"use client";

import React from "react";

function VolumeIcon({ volume, isMuted }: { volume: number; isMuted: boolean }) {
  if (isMuted || volume === 0) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H2v6h4l5 4V5Z" />
        <line x1="22" x2="16" y1="9" y2="15" />
        <line x1="16" x2="22" y1="9" y2="15" />
      </svg>
    );
  }
  if (volume < 50) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H2v6h4l5 4V5Z" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

interface VolumeSliderProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (value: number) => void;
  onToggleMute: () => void;
  iconSize?: "sm" | "md";
}

export default function VolumeSlider({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  iconSize = "sm",
}: VolumeSliderProps) {
  const pct = isMuted ? 0 : volume;
  const iconClass = iconSize === "md" ? "text-white/60 hover:text-white" : "text-white/50 hover:text-white";

  return (
    <div className="flex items-center gap-2 group/vol">
      <button
        onClick={onToggleMute}
        className={`${iconClass} transition-colors flex-shrink-0`}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        <VolumeIcon volume={volume} isMuted={isMuted} />
      </button>
      <div className="relative flex items-center w-full">
        {/* Track background */}
        <div className="absolute inset-y-0 flex items-center w-full pointer-events-none">
          <div className="w-full h-1 rounded-full bg-white/[0.12] group-hover/vol:h-1.5 transition-all">
            <div
              className="h-full rounded-full bg-white group-hover/vol:bg-amber-400 transition-colors"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        {/* Invisible range input on top */}
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={pct}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="relative z-10 w-full h-4 appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:opacity-0
            [&::-webkit-slider-thumb]:group-hover/vol:opacity-100
            [&::-webkit-slider-thumb]:transition-opacity
            [&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:h-3
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:opacity-0
            [&::-moz-range-thumb]:group-hover/vol:opacity-100
            [&::-moz-range-thumb]:transition-opacity
            [&::-moz-range-track]:bg-transparent
          "
        />
      </div>
    </div>
  );
}
