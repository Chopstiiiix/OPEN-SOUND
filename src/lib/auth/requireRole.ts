import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { Role } from "@prisma/client";

export async function requireUser() {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const email =
    (sessionClaims?.email as string) ||
    (sessionClaims?.primaryEmailAddress as string) ||
    "unknown@example.com";

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: { email },
    create: { clerkId: userId, email },
  });

  // ensure wallet exists
  await prisma.wallet.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  return user;
}

export async function requireRole(roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}
