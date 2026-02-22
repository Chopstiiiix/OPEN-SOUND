import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const track = await prisma.track.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      artistName: true,
      coverUrl: true,
      audioUrl: true,
      durationSec: true,
      campaign: { select: { minListenSeconds: true, costPerListen: true } },
    },
  });

  if (!track) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ track });
}
