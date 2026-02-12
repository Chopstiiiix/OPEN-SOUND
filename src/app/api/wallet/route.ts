import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireRole";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const user = await requireUser();

  const wallet = await prisma.wallet.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
    select: { id: true, balance: true },
  });

  const ledger = await prisma.walletLedger.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: 25,
    select: { id: true, amount: true, type: true, referenceId: true, createdAt: true },
  });

  return NextResponse.json({ balance: wallet.balance, ledger });
}
