"use client";

import { PlayerProvider } from "@/contexts/PlayerContext";
import GlobalDock from "@/components/GlobalDock";

export default function PlayerShell({ children }: { children: React.ReactNode }) {
  return (
    <PlayerProvider>
      {children}
      <GlobalDock />
    </PlayerProvider>
  );
}
