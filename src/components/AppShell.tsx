"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AppTopBar from "@/components/AppTopBar";
import PlayerShell from "@/components/PlayerShell";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <PlayerShell>
      <Sidebar />
      <main className="md:ml-24 min-h-screen pb-28 md:pb-20">
        <AppTopBar />
        <div className="px-4 md:px-8 py-6">{children}</div>
      </main>
    </PlayerShell>
  );
}
