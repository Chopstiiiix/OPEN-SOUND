import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/requireRole";

export async function GET() {
  const tracks = await prisma.track.findMany({
    where: { isActive: true, campaign: { status: "ACTIVE" } },
    take: 50,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      artistName: true,
      coverUrl: true,
      durationSec: true,
    },
  });
  return NextResponse.json({ tracks });
}

export async function POST(req: Request) {
  const user = await requireRole(["CREATOR", "ADMIN"]);
  const body = await req.json();

  const campaignId = String(body.campaignId || "");
  const title = String(body.title || "");
  const artistName = String(body.artistName || "");
  const durationSec = Number(body.durationSec || 0);
  const audioPath = String(body.audioPath || "");
  const coverUrl = body.coverUrl ? String(body.coverUrl) : null;

  if (!campaignId || !title || !artistName || !audioPath || durationSec <= 0) {
    return NextResponse.json({ error: "BAD_INPUT" }, { status: 400 });
  }

  // Ensure creator owns campaign (or admin)
  const creator = await prisma.creatorProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
    select: { id: true },
  });

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { id: true, creatorId: true },
  });

  if (!campaign) return NextResponse.json({ error: "CAMPAIGN_NOT_FOUND" }, { status: 404 });

  if (user.role !== "ADMIN" && campaign.creatorId !== creator.id) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const track = await prisma.track.create({
    data: {
      campaignId,
      title,
      artistName,
      durationSec,
      audioPath,
      audioUrl: "",
      coverUrl,
    },
    select: { id: true },
  });

  return NextResponse.json({ track });
}
