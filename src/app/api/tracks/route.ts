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

  const title = String(body.title || "");
  const artistName = String(body.artistName || "");
  const audioUrl = String(body.audioUrl || "");
  const campaignId = String(body.campaignId || "");
  const durationSec = Number(body.durationSec || 0);

  if (!title || !artistName || !audioUrl || !campaignId) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }

  // Verify campaign belongs to this creator
  const creator = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!creator) {
    return NextResponse.json({ error: "NO_CREATOR_PROFILE" }, { status: 403 });
  }

  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign || campaign.creatorId !== creator.id) {
    return NextResponse.json({ error: "CAMPAIGN_NOT_FOUND" }, { status: 404 });
  }

  const track = await prisma.track.create({
    data: {
      title,
      artistName,
      audioUrl,
      campaignId,
      durationSec: durationSec || 180,
    },
  });

  return NextResponse.json({ track }, { status: 201 });
}
