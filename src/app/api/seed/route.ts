import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/requireRole";
import { DUMMY_TRACKS } from "@/lib/data/dummyData";

export async function POST() {
  try {
    const user = await requireRole(["ADMIN"]);

    // Ensure creator profile exists
    const profile = await prisma.creatorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, stageName: "Admin Seeder" },
    });

    // Group dummy tracks by campaign
    const campaignMap = new Map<string, typeof DUMMY_TRACKS>();
    for (const t of DUMMY_TRACKS) {
      const key = t.campaign.id;
      if (!campaignMap.has(key)) campaignMap.set(key, []);
      campaignMap.get(key)!.push(t);
    }

    let campaignsCreated = 0;
    let tracksCreated = 0;

    for (const [, tracks] of campaignMap) {
      const first = tracks[0];
      const camp = first.campaign;

      // Create campaign
      const campaign = await prisma.campaign.create({
        data: {
          creatorId: profile.id,
          name: camp.name,
          status: camp.status as any,
          budgetPoints: camp.budgetPoints,
          spentPoints: camp.spentPoints,
          costPerListen: camp.costPerListen,
          minListenSeconds: camp.minListenSeconds,
        },
      });
      campaignsCreated++;

      // Create tracks for this campaign
      for (const t of tracks) {
        await prisma.track.create({
          data: {
            campaignId: campaign.id,
            title: t.title,
            artistName: t.artistName,
            audioUrl: "",
            coverUrl: t.coverUrl,
            durationSec: t.durationSec,
            isActive: true,
          },
        });
        tracksCreated++;
      }
    }

    return NextResponse.json({ ok: true, campaignsCreated, tracksCreated });
  } catch (err: any) {
    if (err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admin role required" }, { status: 403 });
    }
    return NextResponse.json({ error: err.message || "Failed to seed" }, { status: 500 });
  }
}
