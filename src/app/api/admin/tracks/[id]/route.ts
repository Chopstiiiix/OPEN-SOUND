import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/requireRole";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await requireRole(["ADMIN"]);
  const body = await req.json();

  const track = await prisma.track.findUnique({ where: { id: params.id } });
  if (!track) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const updated = await prisma.track.update({
    where: { id: params.id },
    data: {
      ...(typeof body.isActive === "boolean" ? { isActive: body.isActive } : {}),
    },
    select: { id: true, title: true, isActive: true },
  });

  return NextResponse.json({ track: updated });
}
