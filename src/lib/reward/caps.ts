import { prisma } from "@/lib/db/prisma";

export async function getFraudRules() {
  const existing = await prisma.fraudRuleConfig.findFirst();
  if (existing) return existing;
  // auto-create default on first run
  return prisma.fraudRuleConfig.create({ data: {} });
}

export function startOfTodayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}
