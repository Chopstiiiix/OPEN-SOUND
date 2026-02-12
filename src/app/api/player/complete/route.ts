import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireRole";
import { completeAndReward } from "@/lib/reward/rewardEngine";

export async function POST(req: Request) {
  const user = await requireUser();
  const body = await req.json();

  const sessionId = String(body.sessionId || "");
  const trackId = String(body.trackId || "");

  if (!sessionId || !trackId) {
    return NextResponse.json({ error: "MISSING_PARAMS" }, { status: 400 });
  }

  const result = await completeAndReward({
    userDbId: user.id,
    trackId,
    sessionId,
  });

  if (!result.ok) return NextResponse.json(result, { status: 400 });

  return NextResponse.json({ ok: true, reward: result.reward });
}
