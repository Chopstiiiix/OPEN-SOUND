"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Discover",
    href: "/discover",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    label: "Wallet",
    href: "/wallet",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
      </svg>
    ),
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    label: "Campaigns",
    href: "/campaigns",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
        <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" />
        <circle cx="12" cy="12" r="2" />
        <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" />
        <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
      </svg>
    ),
  },
  {
    label: "Upload",
    href: "/tracks/upload",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" x2="12" y1="3" y2="15" />
      </svg>
    ),
  },
  {
    label: "Admin",
    href: "/admin",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

const primaryRoutes = new Set(["/discover", "/wallet"]);

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [playlistVersion, setPlaylistVersion] = useState(0);

  const playlistStorageKey = useMemo(
    () => `open-sound-playlists:${user?.id ?? "anon"}`,
    [user?.id]
  );

  const playlists = useMemo(() => {
    void playlistVersion;
    if (typeof window === "undefined") return [] as Array<{ id: string; name: string }>;
    try {
      const raw = localStorage.getItem(playlistStorageKey);
      if (!raw) return [] as Array<{ id: string; name: string }>;
      const parsed = JSON.parse(raw) as Array<{ id: string; name: string }>;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [] as Array<{ id: string; name: string }>;
    }
  }, [playlistStorageKey, playlistVersion]);

  function createPlaylist() {
    const rawName = window.prompt("Playlist name");
    if (!rawName) return;
    const name = rawName.trim();
    if (!name) return;

    const next = [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name },
      ...playlists,
    ];

    try {
      localStorage.setItem(playlistStorageKey, JSON.stringify(next));
      setPlaylistVersion((v) => v + 1);
    } catch {
      // ignore storage write failures
    }
  }

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-24 bg-black/30 backdrop-blur-xl border-r border-white/[0.06] z-40">
        <nav className="flex-1 px-2 py-3">
          <div className="space-y-1">
            {navItems.filter((item) => primaryRoutes.has(item.href)).map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-[11px] font-medium transition-colors",
                    isActive
                      ? "bg-white/[0.16] text-white"
                      : "text-white/60 hover:text-white hover:bg-white/[0.08]"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="my-3 border-t border-white/[0.08]" />

          <div className="space-y-1">
            {navItems.filter((item) => !primaryRoutes.has(item.href)).map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-[10px] font-medium transition-colors",
                    isActive
                      ? "bg-white/[0.12] text-white"
                      : "text-white/45 hover:text-white hover:bg-white/[0.06]"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-white/[0.08]">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[10px] font-semibold text-white/55 uppercase tracking-wide">
                Playlists
              </span>
              <button
                onClick={createPlaylist}
                className="w-5 h-5 rounded-md bg-white/[0.08] hover:bg-white/[0.14] text-white/75 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Create playlist"
              >
                +
              </button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto no-scrollbar">
              {playlists.length === 0 ? (
                <p className="text-[10px] text-white/35 px-1">
                  Create a playlist to pin it here.
                </p>
              ) : (
                playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    className="w-full flex items-center gap-1.5 px-1.5 py-1.5 rounded-md text-[10px] text-white/65 hover:text-white hover:bg-white/[0.06] transition-colors"
                    title={playlist.name}
                  >
                    <span className="w-4 h-4 rounded-sm bg-amber-500/20 text-amber-300 flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                      {playlist.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="truncate">{playlist.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-white/[0.06] flex justify-center">
          <UserButton />
        </div>
      </aside>

      {/* Mobile bottom tab rail */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#12141a]/95 backdrop-blur-xl border-t border-white/[0.08] z-40 px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around">
          {navItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 px-3 text-[10px] transition-colors rounded-xl",
                  isActive ? "text-amber-300 bg-amber-500/15" : "text-white/40"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
