"use client";

import { useEffect } from "react";
import { formatDuration, cn } from "@/lib/utils";
import { usePlayer, type PlayerTrack } from "@/contexts/PlayerContext";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";

export default function Player({ track }: { track: PlayerTrack }) {
  const {
    isPlaying,
    currentTime,
    audioDuration,
    playUrl,
    sessionId,
    progressSec,
    pct,
    status,
    rewardMsg,
    loadTrack,
    togglePlay,
    seek,
    startSession,
    claimReward,
  } = usePlayer();

  // Load this track into the global player when the track page mounts
  useEffect(() => {
    loadTrack(track);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.id]);

  const minListenSec = track.campaign?.minListenSeconds || 30;
  const costPerListen = track.campaign?.costPerListen;
  const sessionProgress = sessionId
    ? Math.min(100, Math.round((progressSec / minListenSec) * 100))
    : 0;

  return (
    <div className="space-y-4">
      {/* Custom player controls */}
      <div className="rounded-2xl p-5 bg-surface/85 border border-white/[0.08]">
        <div className="flex items-center gap-4">
          {/* Play/Pause button */}
          <button
            onClick={togglePlay}
            disabled={!playUrl}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
              "disabled:opacity-30 disabled:cursor-not-allowed",
              isPlaying
                ? "btn-gradient animate-pulse-glow"
                : "bg-white/10 hover:bg-white/20"
            )}
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          {/* Progress bar + time */}
          <div className="flex-1 min-w-0">
            <div
              className="h-2 w-full rounded-full bg-white/[0.08] overflow-hidden cursor-pointer group"
              onClick={seek}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all relative"
                style={{
                  width: `${audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0}%`,
                }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-white/40">
              <span>{formatDuration(Math.floor(currentTime))}</span>
              <span>{formatDuration(Math.floor(audioDuration))}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Earning session card */}
      <div className="rounded-2xl p-5 bg-surface/85 border border-white/[0.08]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/80">
            Earning Session
          </h3>
          <div className="flex items-center gap-2">
            {status === "idle" && <Badge variant="default">Ready</Badge>}
            {status === "starting" && (
              <Badge variant="paused">Starting...</Badge>
            )}
            {status === "playing" && (
              <Badge variant="active">Listening</Badge>
            )}
            {status === "completing" && (
              <Badge variant="paused">Claiming...</Badge>
            )}
            {status === "done" && <Badge variant="ended">Ended</Badge>}
            {status === "rewarded" && (
              <Badge variant="reward">Rewarded</Badge>
            )}
          </div>
        </div>

        {/* Session progress */}
        {sessionId && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-white/50 mb-1.5">
              <span>Listen progress</span>
              <span>
                {progressSec}s / {minListenSec}s minimum
              </span>
            </div>
            <ProgressBar value={sessionProgress} />
          </div>
        )}

        {/* Info row */}
        {costPerListen && (
          <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
            <span>Min listen: {minListenSec}s</span>
            <span className="text-amber-300">Reward: {costPerListen} pts</span>
            <span>Completion: {pct}%</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={startSession}
            disabled={
              status === "starting" ||
              status === "playing" ||
              status === "rewarded"
            }
            className={cn(
              "btn-gradient px-5 py-2.5 rounded-full text-sm font-medium text-white",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            {status === "starting" ? "Starting..." : "Start Earning"}
          </button>

          <button
            onClick={claimReward}
            disabled={
              !sessionId || status === "rewarded" || status === "completing"
            }
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-medium border border-white/20 text-white/80",
              "hover:bg-white/5 transition-colors",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
          >
            {status === "completing" ? "Claiming..." : "Claim Reward"}
          </button>
        </div>

        {/* Reward message */}
        {rewardMsg && (
          <div
            className={cn(
              "mt-4 rounded-xl px-4 py-3 text-sm font-medium",
              status === "rewarded"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-reward-pop"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            )}
          >
            {status === "rewarded" && (
              <span className="mr-2">&#127881;</span>
            )}
            {rewardMsg}
          </div>
        )}
      </div>
    </div>
  );
}
