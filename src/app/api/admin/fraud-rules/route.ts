import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/requireRole";
import { getFraudRules } from "@/lib/reward/caps";

export async function GET() {
  await requireRole(["ADMIN"]);
  const rules = await getFraudRules();
  return NextResponse.json({ rules });
}

export async function PATCH(req: Request) {
  await requireRole(["ADMIN"]);
  const body = await req.json();

  const rules = await getFraudRules();

  const updated = await prisma.fraudRuleConfig.update({
    where: { id: rules.id },
    data: {
      ...(typeof body.dailyRewardCap === "number" ? { dailyRewardCap: body.dailyRewardCap } : {}),
      ...(typeof body.maxSessionsPerHour === "number" ? { maxSessionsPerHour: body.maxSessionsPerHour } : {}),
      ...(typeof body.minHeartbeatGapMs === "number" ? { minHeartbeatGapMs: body.minHeartbeatGapMs } : {}),
    },
  });

  return NextResponse.json({ rules: updated });
}
