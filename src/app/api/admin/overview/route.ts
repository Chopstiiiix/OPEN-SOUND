import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/requireRole";

export async function GET() {
  await requireRole(["ADMIN"]);

  const [campaigns, tracks] = await Promise.all([
    prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        budgetPoints: true,
        spentPoints: true,
        tracks: { select: { id: true, title: true, isActive: true } },
      },
    }),
    prisma.track.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        artistName: true,
        isActive: true,
        campaignId: true,
      },
    }),
  ]);

  return NextResponse.json({ campaigns, tracks });
}
