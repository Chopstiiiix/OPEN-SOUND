import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/requireRole";

export async function GET() {
  const user = await requireRole(["CREATOR", "ADMIN"]);

  const creator = await prisma.creatorProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
    select: { id: true },
  });

  const campaigns = await prisma.campaign.findMany({
    where: { creatorId: creator.id },
    orderBy: { createdAt: "desc" },
    include: { tracks: { select: { id: true, title: true, isActive: true } } },
  });

  return NextResponse.json({ campaigns });
}

export async function POST(req: Request) {
  const user = await requireRole(["CREATOR", "ADMIN"]);
  const body = await req.json();

  const name = String(body.name || "");
  const budgetPoints = Number(body.budgetPoints || 0);
  const costPerListen = Number(body.costPerListen || 1);
  const minListenSeconds = Number(body.minListenSeconds || 30);

  if (!name || budgetPoints <= 0 || costPerListen <= 0) {
    return NextResponse.json({ error: "BAD_INPUT" }, { status: 400 });
  }

  const creator = await prisma.creatorProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
    select: { id: true },
  });

  const campaign = await prisma.campaign.create({
    data: {
      creatorId: creator.id,
      name,
      budgetPoints,
      costPerListen,
      minListenSeconds,
    },
  });

  return NextResponse.json({ campaign });
}
