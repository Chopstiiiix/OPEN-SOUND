import { prisma } from "@/lib/db/prisma";
import { getFraudRules, startOfTodayUTC } from "@/lib/reward/caps";

export async function validateReward(params: {
  userId: string;        // DB user.id
  trackId: string;
  sessionId: string;
}) {
  const rules = await getFraudRules();

  const session = await prisma.listeningSession.findUnique({
    where: { id: params.sessionId },
    include: { track: { include: { campaign: true } }, user: true },
  });

  if (!session) return { ok: false as const, reason: "SESSION_NOT_FOUND" as const };
  if (session.userId !== params.userId) return { ok: false as const, reason: "NOT_OWNER" as const };
  if (session.trackId !== params.trackId) return { ok: false as const, reason: "TRACK_MISMATCH" as const };
  if (session.rewardedLedgerId) return { ok: false as const, reason: "ALREADY_REWARDED" as const };

  const track = session.track;
  const campaign = track.campaign;

  if (!track.isActive) return { ok: false as const, reason: "TRACK_INACTIVE" as const };
  if (campaign.status !== "ACTIVE") return { ok: false as const, reason: "CAMPAIGN_NOT_ACTIVE" as const };

  // completion check
  const requiredSec = Math.max(campaign.minListenSeconds, 10);
  const mustPct = 70;

  const qualifies =
    session.progressSec >= requiredSec &&
    (session.completionPct >= mustPct ||
      session.progressSec >= Math.floor(track.durationSec * 0.8));

  if (!qualifies) return { ok: false as const, reason: "NOT_QUALIFIED" as const };

  // hourly session rate limit
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const sessionsThisHour = await prisma.listeningSession.count({
    where: {
      userId: params.userId,
      startedAt: { gte: oneHourAgo },
    },
  });
  if (sessionsThisHour > rules.maxSessionsPerHour) {
    return { ok: false as const, reason: "HOURLY_SESSION_CAP" as const };
  }

  // per-user per-track reward limit (simple MVP: 1 reward ever per track)
  const previousReward = await prisma.listeningSession.findFirst({
    where: {
      userId: params.userId,
      trackId: params.trackId,
      rewardedLedgerId: { not: null },
    },
    select: { id: true },
  });
  if (previousReward) return { ok: false as const, reason: "DUPLICATE_REWARD" as const };

  // daily reward cap (points/day)
  const since = startOfTodayUTC();
  const wallet = await prisma.wallet.findUnique({ where: { userId: params.userId } });
  if (!wallet) return { ok: false as const, reason: "WALLET_MISSING" as const };

  const todayEarned = await prisma.walletLedger.aggregate({
    where: {
      walletId: wallet.id,
      type: "REWARD",
      createdAt: { gte: since },
    },
    _sum: { amount: true },
  });

  const earned = todayEarned._sum.amount ?? 0;
  if (earned + campaign.costPerListen > rules.dailyRewardCap) {
    return { ok: false as const, reason: "DAILY_CAP" as const };
  }

  // campaign budget check
  const remaining = campaign.budgetPoints - campaign.spentPoints;
  if (remaining < campaign.costPerListen) return { ok: false as const, reason: "CAMPAIGN_BUDGET" as const };

  return { ok: true as const, session, track, campaign, rules };
}
