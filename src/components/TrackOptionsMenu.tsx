"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

type TrackOptionData = {
  id: string;
  title: string;
  artistName: string;
  coverUrl?: string | null;
};

type Props = {
  track: TrackOptionData;
  className?: string;
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
}

export default function TrackOptionsMenu({ track, className }: Props) {
  const router = useRouter();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState<string>("");
  const menuRef = useRef<HTMLDivElement | null>(null);

  const userKey = user?.id ?? "anon";
  const playlistsKey = useMemo(() => `open-sound-playlists:${userKey}`, [userKey]);
  const playlistTracksKey = useMemo(() => `open-sound-playlist-tracks:${userKey}`, [userKey]);
  const libraryKey = useMemo(() => `open-sound-library:${userKey}`, [userKey]);
  const queueKey = useMemo(() => `open-sound-queue:${userKey}`, [userKey]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    }

    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  function notify(message: string) {
    setFlash(message);
    setTimeout(() => setFlash(""), 1400);
  }

  async function shareTrack() {
    const url = typeof window !== "undefined" ? `${window.location.origin}/track/${track.id}` : `/track/${track.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: track.title,
          text: `Listen to ${track.title} by ${track.artistName}`,
          url,
        });
        notify("Shared");
      } else {
        await navigator.clipboard.writeText(url);
        notify("Link copied");
      }
    } catch {
      notify("Share canceled");
    }

    setOpen(false);
  }

  function addToLibrary() {
    const current = readJson<string[]>(libraryKey, []);
    if (!current.includes(track.id)) {
      writeJson(libraryKey, [track.id, ...current]);
    }
    notify("Added to library");
    setOpen(false);
  }

  function addToQueue() {
    const queue = readJson<TrackOptionData[]>(queueKey, []);
    writeJson(queueKey, [...queue, track]);
    notify("Added to queue");
    setOpen(false);
  }

  function addToPlaylist() {
    const playlists = readJson<Array<{ id: string; name: string }>>(playlistsKey, []);
    const names = playlists.map((p) => p.name).join(", ");

    const selectedName = window.prompt(
      playlists.length > 0
        ? `Add to playlist (existing: ${names}). Enter a playlist name:`
        : "Enter a new playlist name:"
    );

    if (!selectedName) return;

    const trimmed = selectedName.trim();
    if (!trimmed) return;

    const existing = playlists.find((p) => p.name.toLowerCase() === trimmed.toLowerCase());
    const target =
      existing ?? { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: trimmed };

    if (!existing) {
      writeJson(playlistsKey, [target, ...playlists]);
    }

    const mapping = readJson<Record<string, string[]>>(playlistTracksKey, {});
    const ids = mapping[target.id] ?? [];
    if (!ids.includes(track.id)) {
      mapping[target.id] = [track.id, ...ids];
      writeJson(playlistTracksKey, mapping);
    }

    notify(`Added to ${target.name}`);
    setOpen(false);
  }

  function goToArtistPage() {
    setOpen(false);
    router.push(`/artist/${encodeURIComponent(track.artistName)}`);
  }

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="w-8 h-8 rounded-full bg-black/50 border border-white/[0.14] text-white/80 hover:text-white hover:bg-black/70 flex items-center justify-center transition-colors"
        aria-label="Track options"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-56 rounded-xl border border-white/[0.12] bg-[#161b22]/95 backdrop-blur-xl p-1.5 shadow-[0_16px_42px_rgba(0,0,0,0.5)] z-50">
          <button onClick={shareTrack} className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/85 hover:bg-white/[0.08]">Share</button>
          <button onClick={addToLibrary} className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/85 hover:bg-white/[0.08]">Add to your library</button>
          <button onClick={addToPlaylist} className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/85 hover:bg-white/[0.08]">Add to playlist</button>
          <button onClick={addToQueue} className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/85 hover:bg-white/[0.08]">Add to queue</button>
          <button onClick={goToArtistPage} className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/85 hover:bg-white/[0.08]">Go to artist page</button>
        </div>
      )}

      {flash && (
        <div className="absolute right-0 -top-8 px-2 py-1 rounded-md bg-amber-500/20 border border-amber-500/30 text-[11px] text-amber-200 whitespace-nowrap">
          {flash}
        </div>
      )}
    </div>
  );
}
