import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/requireRole";
import { sha256 } from "@/lib/util/hash";

export async function POST(req: Request) {
  const user = await requireUser();
  const body = await req.json();
  const trackId = String(body.trackId || "");

  if (!trackId) return NextResponse.json({ error: "MISSING_TRACK" }, { status: 400 });

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  const ua = req.headers.get("user-agent") || "";

  const session = await prisma.listeningSession.create({
    data: {
      userId: user.id,
      trackId,
      status: "STARTED",
      ipHash: ip ? sha256(ip) : null,
      userAgentHash: ua ? sha256(ua) : null,
      deviceHash: body.deviceHash ? sha256(String(body.deviceHash)) : null,
    },
    select: { id: true, startedAt: true },
  });

  return NextResponse.json({ sessionId: session.id });
}
