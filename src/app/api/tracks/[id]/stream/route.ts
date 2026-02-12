import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { supabaseAdmin } from "@/lib/storage/supabaseAdmin";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const track = await prisma.track.findUnique({
    where: { id: params.id },
    select: { audioPath: true, audioUrl: true },
  });

  if (!track) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  // If you still stored a public URL, just return it
  if (track.audioUrl && !track.audioPath) {
    return NextResponse.json({ url: track.audioUrl });
  }

  if (!track.audioPath) {
    return NextResponse.json({ error: "MISSING_AUDIO_PATH" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const bucket = "audio";

  const { data, error } = await sb.storage
    .from(bucket)
    .createSignedUrl(track.audioPath, 60 * 10); // 10 minutes

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ url: data.signedUrl });
}
