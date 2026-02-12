import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/requireRole";
import { getFraudRules } from "@/lib/reward/caps";

export async function POST(req: Request) {
  const user = await requireUser();
  const rules = await getFraudRules();
  const body = await req.json();

  const sessionId = String(body.sessionId || "");
  const progressSec = Number(body.progressSec || 0);
  const completionPct = Number(body.completionPct || 0);

  if (!sessionId) return NextResponse.json({ error: "MISSING_SESSION" }, { status: 400 });

  // Simple throttle by last update time using updatedAt heuristic:
  const session = await prisma.listeningSession.findUnique({
    where: { id: sessionId },
    select: { id: true, userId: true, startedAt: true, status: true, progressSec: true, completionPct: true },
  });

  if (!session) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (session.userId !== user.id) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (session.status === "REWARDED") return NextResponse.json({ ok: true });

  // prevent backwards progress
  const safeProgress = Math.max(session.progressSec, Math.floor(progressSec));
  const safePct = Math.max(session.completionPct, Math.floor(completionPct));

  // super basic sanity:
  if (safeProgress < 0 || safeProgress > 60 * 60) {
    return NextResponse.json({ error: "BAD_PROGRESS" }, { status: 400 });
  }
  if (safePct < 0 || safePct > 100) {
    return NextResponse.json({ error: "BAD_PCT" }, { status: 400 });
  }

  // (Optional) you can add a proper ms-gap check using a separate field later.
  // For MVP, keep it simple.

  await prisma.listeningSession.update({
    where: { id: sessionId },
    data: {
      status: "IN_PROGRESS",
      progressSec: safeProgress,
      completionPct: safePct,
    },
  });

  return NextResponse.json({ ok: true, minHeartbeatGapMs: rules.minHeartbeatGapMs });
}
