import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/requireRole";

const VALID_STATUSES = ["ACTIVE", "PAUSED", "ENDED"] as const;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await requireRole(["ADMIN"]);
  const body = await req.json();

  const campaign = await prisma.campaign.findUnique({ where: { id: params.id } });
  if (!campaign) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const status = body.status as string | undefined;
  if (status && !VALID_STATUSES.includes(status as any)) {
    return NextResponse.json({ error: "INVALID_STATUS" }, { status: 400 });
  }

  const updated = await prisma.campaign.update({
    where: { id: params.id },
    data: {
      ...(status ? { status: status as any } : {}),
    },
    select: { id: true, name: true, status: true },
  });

  return NextResponse.json({ campaign: updated });
}
