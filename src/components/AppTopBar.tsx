"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function pageLabel(pathname: string) {
  if (pathname.startsWith("/discover")) return "Home";
  if (pathname.startsWith("/wallet")) return "Wallet";
  if (pathname.startsWith("/campaigns/new")) return "New campaign";
  if (pathname.startsWith("/campaigns")) return "Campaigns";
  if (pathname.startsWith("/tracks/upload")) return "Upload";
  if (pathname.startsWith("/dashboard")) return "Creator";
  if (pathname.startsWith("/admin")) return "Admin";
  if (pathname.startsWith("/track/")) return "Now playing";
  return "Open Sound";
}

export default function AppTopBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="h-14 px-4 md:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Link href="/discover" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg btn-gradient flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <span className="font-semibold text-white whitespace-nowrap">Open Sound</span>
          </Link>

          <span className="hidden md:block text-sm font-semibold text-white/65">{pageLabel(pathname)}</span>

          <div className="relative w-full sm:w-[420px] max-w-[58vw]">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              readOnly
              value="Search songs, albums, artists, podcasts"
              className="w-full rounded-lg border border-white/[0.1] bg-white/[0.08] py-2 pl-10 pr-4 text-sm text-white/60"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-white/75 flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.55a7 7 0 1 1 14 0" />
            <path d="M1 12.55h4" />
            <path d="M19 12.55h4" />
            <path d="M12 19v3" />
          </svg>
          <div className="w-7 h-7 rounded-full bg-lime-700 text-[11px] font-semibold text-white flex items-center justify-center">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
