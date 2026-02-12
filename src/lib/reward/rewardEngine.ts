import { prisma } from "@/lib/db/prisma";
import { validateReward } from "@/lib/reward/validator";

export async function completeAndReward(params: {
  userDbId: string;
  trackId: string;
  sessionId: string;
}) {
  const check = await validateReward({
    userId: params.userDbId,
    trackId: params.trackId,
    sessionId: params.sessionId,
  });

  if (!check.ok) return check;

  const { campaign, session } = check;

  const result = await prisma.$transaction(async (tx) => {
    // Re-read wallet within txn
    const wallet = await tx.wallet.upsert({
      where: { userId: params.userDbId },
      update: {},
      create: { userId: params.userDbId },
    });

    // Create ledger entry
    const ledger = await tx.walletLedger.create({
      data: {
        walletId: wallet.id,
        amount: campaign.costPerListen,
        type: "REWARD",
        referenceId: session.id,
      },
    });

    // Update wallet balance
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: campaign.costPerListen } },
    });

    // Mark session rewarded
    await tx.listeningSession.update({
      where: { id: session.id },
      data: {
        status: "REWARDED",
        completedAt: new Date(),
        rewardedLedgerId: ledger.id,
      },
    });

    // Spend campaign budget
    await tx.campaign.update({
      where: { id: campaign.id },
      data: { spentPoints: { increment: campaign.costPerListen } },
    });

    return { ledgerId: ledger.id, amount: campaign.costPerListen };
  });

  return { ok: true as const, reward: result };
}
