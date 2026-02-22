"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDuration, cn } from "@/lib/utils";
import { usePlayer } from "@/contexts/PlayerContext";
import VolumeSlider from "@/components/ui/VolumeSlider";

export default function GlobalDock() {
  const {
    track,
    isPlaying,
    currentTime,
    audioDuration,
    volume,
    isMuted,
    showDock,
    playUrl,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
  } = usePlayer();

  if (!track || !showDock) return null;

  const coverUrl = track.coverUrl || "/covers/1.jpg";
  const trackTitle = track.title || "Now Playing";
  const artistName = track.artistName || "Open Sound";

  return (
    <div
      className={cn(
        "fixed left-0 right-0 bottom-0 z-50 transition-transform duration-300 ease-out",
        "md:left-24",
        showDock ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="bg-[#181818] border-t border-white/[0.08]">
        <div className="h-full px-4 py-2.5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Left: Track info */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/track/${track.id}`}
              className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0"
            >
              <Image
                src={coverUrl}
                alt={trackTitle}
                fill
                className="object-cover"
                sizes="56px"
              />
            </Link>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate hover:underline cursor-pointer">
                {trackTitle}
              </p>
              <p className="text-[11px] text-white/50 truncate">{artistName}</p>
            </div>
            <button
              className="flex-shrink-0 text-amber-400 hover:text-amber-300 transition-colors hidden sm:block"
              aria-label="Like"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          </div>

          {/* Center: Transport controls + progress */}
          <div className="flex flex-col items-center gap-1 w-[clamp(300px,40vw,600px)]">
            {/* Transport buttons */}
            <div className="flex items-center gap-4">
              {/* Shuffle */}
              <button
                className="text-white/50 hover:text-white transition-colors hidden sm:block"
                aria-label="Shuffle"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 3h5v5" />
                  <path d="M4 20 21 3" />
                  <path d="M21 16v5h-5" />
                  <path d="M15 15l6 6" />
                  <path d="M4 4l5 5" />
                </svg>
              </button>

              {/* Previous */}
              <button
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Previous"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
                </svg>
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                disabled={!playUrl}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                  "disabled:opacity-30 disabled:cursor-not-allowed",
                  "bg-white hover:scale-105 active:scale-95"
                )}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="black">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="black">
                    <polygon points="6 3 20 12 6 21 6 3" />
                  </svg>
                )}
              </button>

              {/* Next */}
              <button
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Next"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>

              {/* Repeat */}
              <button
                className="text-white/50 hover:text-white transition-colors hidden sm:block"
                aria-label="Repeat"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m17 2 4 4-4 4" />
                  <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                  <path d="m7 22-4-4 4-4" />
                  <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                </svg>
              </button>
            </div>

            {/* Progress bar with timestamps */}
            <div className="flex items-center gap-2 w-full">
              <span className="text-[11px] text-white/50 tabular-nums w-10 text-right flex-shrink-0">
                {formatDuration(Math.floor(currentTime))}
              </span>
              <div
                className="h-1 flex-1 rounded-full bg-white/[0.12] overflow-hidden cursor-pointer group hover:h-1.5 transition-all"
                onClick={seek}
              >
                <div
                  className="h-full rounded-full bg-white group-hover:bg-amber-400 transition-colors relative"
                  style={{
                    width: `${audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0}%`,
                  }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <span className="text-[11px] text-white/50 tabular-nums w-10 flex-shrink-0">
                {formatDuration(Math.floor(audioDuration))}
              </span>
            </div>
          </div>

          {/* Right: Utility icons + volume */}
          <div className="flex items-center justify-end gap-3">
            {/* Queue */}
            <button
              className="text-white/50 hover:text-white transition-colors hidden lg:block"
              aria-label="Queue"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h12" />
              </svg>
            </button>

            {/* Lyrics */}
            <button
              className="text-white/50 hover:text-white transition-colors hidden lg:block"
              aria-label="Lyrics"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </button>

            {/* Volume slider */}
            <div className="hidden md:flex items-center w-32 flex-shrink-0">
              <VolumeSlider
                volume={volume}
                isMuted={isMuted}
                onVolumeChange={setVolume}
                onToggleMute={toggleMute}
              />
            </div>

            {/* Fullscreen / expand */}
            <button
              className="text-white/50 hover:text-white transition-colors hidden lg:block"
              aria-label="Expand"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h6v6" />
                <path d="M9 21H3v-6" />
                <path d="M21 3l-7 7" />
                <path d="M3 21l7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
