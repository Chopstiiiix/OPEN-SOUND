"use client";

import React, { useCallback, useRef, useState } from "react";

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
}

export default function VolumeSlider({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}: VolumeSliderProps) {
  const pct = isMuted ? 0 : volume;
  const trackRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [iconPop, setIconPop] = useState(false);

  const handleMuteClick = useCallback(() => {
    setIconPop(true);
    onToggleMute();
    setTimeout(() => setIconPop(false), 300);
  }, [onToggleMute]);

  const updateFromPointer = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const { left, width } = trackRef.current.getBoundingClientRect();
      const val = Math.min(100, Math.max(0, Math.round(((clientX - left) / width) * 100)));
      onVolumeChange(val);
    },
    [onVolumeChange]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
      updateFromPointer(e.clientX);
    },
    [updateFromPointer]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.buttons > 0) updateFromPointer(e.clientX);
    },
    [updateFromPointer]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const active = hovered || dragging;

  return (
    <div
      className="flex items-center gap-2 w-full select-none touch-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: active ? "scale(1.08)" : "scale(1)",
        opacity: active ? 1 : 0.75,
        transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease",
      }}
    >
      {/* Mute button with pop animation */}
      <button
        onClick={handleMuteClick}
        className="text-white/50 hover:text-white transition-colors flex-shrink-0"
        aria-label={isMuted ? "Unmute" : "Mute"}
        style={{
          transform: iconPop ? "scale(1.35)" : "scale(1)",
          transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <VolumeIcon volume={volume} isMuted={isMuted} />
      </button>

      {/* Slider track */}
      <div
        ref={trackRef}
        className="relative flex-1 cursor-pointer"
        style={{ height: "16px", display: "flex", alignItems: "center" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Background track */}
        <div
          className="w-full rounded-full bg-white/[0.15] overflow-hidden"
          style={{
            height: active ? "5px" : "3px",
            transition: "height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Fill */}
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: active
                ? "linear-gradient(to right, #fbbf24, #f97316)"
                : "rgba(255,255,255,0.8)",
              transition: dragging
                ? "background 0.2s ease"
                : "width 0.15s ease, background 0.2s ease",
            }}
          />
        </div>

        {/* Thumb */}
        <div
          style={{
            position: "absolute",
            left: `${pct}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: "white",
            boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
            opacity: active ? 1 : 0,
            transition:
              "opacity 0.2s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}
