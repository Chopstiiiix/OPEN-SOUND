"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function Player({ track }: { track: any }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [progressSec, setProgressSec] = useState(0);
  const [pct, setPct] = useState(0);
  const [status, setStatus] = useState<string>("idle");
  const [rewardMsg, setRewardMsg] = useState<string>("");
  const [playUrl, setPlayUrl] = useState<string>("");

  useEffect(() => {
    async function loadUrl() {
      const res = await fetch(`/api/tracks/${track.id}/stream`);
      const data = await res.json();
      if (res.ok) setPlayUrl(data.url);
    }
    loadUrl();
  }, [track.id]);

  const deviceHash = useMemo(() => {
    // super simple device hint for MVP (replace later)
    return `${navigator.platform}-${navigator.language}-${screen.width}x${screen.height}`;
  }, []);

  async function startSession() {
    setRewardMsg("");
    setStatus("starting");
    const res = await fetch("/api/player/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId: track.id, deviceHash }),
    });
    const data = await res.json();
    setSessionId(data.sessionId);
    setStatus("playing");
  }

  async function heartbeat(sessionId: string, progressSec: number, completionPct: number) {
    await fetch("/api/player/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, progressSec, completionPct }),
    });
  }

  async function complete(sessionId: string) {
    setStatus("completing");
    const res = await fetch("/api/player/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, trackId: track.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setRewardMsg(`No reward: ${data.reason || data.error || "unknown"}`);
      setStatus("done");
      return;
    }
    setRewardMsg(`Earned ${data.reward.amount} points`);
    setStatus("rewarded");
  }

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const timer = setInterval(() => {
      if (!sessionId) return;
      if (!audioRef.current) return;

      const current = Math.floor(audioRef.current.currentTime || 0);
      const duration = Math.max(1, Math.floor(audioRef.current.duration || track.durationSec || 1));
      const completion = Math.min(100, Math.floor((current / duration) * 100));

      setProgressSec(current);
      setPct(completion);

      // send heartbeat every ~5s
      if (current > 0 && current % 5 === 0) heartbeat(sessionId, current, completion);
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionId, track.durationSec]);

  return (
    <div className="rounded-xl border border-white/10 p-4">
      <audio ref={audioRef} src={playUrl} controls className="w-full" />

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={startSession}
          className="px-4 py-2 rounded bg-white text-black disabled:opacity-50"
          disabled={status === "starting" || status === "playing"}
        >
          Start earning session
        </button>

        <button
          onClick={() => sessionId && complete(sessionId)}
          className="px-4 py-2 rounded border border-white/20 disabled:opacity-50"
          disabled={!sessionId || status === "rewarded"}
        >
          Claim reward
        </button>
      </div>

      <div className="mt-3 text-sm text-white/70">
        Progress: {progressSec}s • {pct}%
      </div>

      {rewardMsg && <div className="mt-3 text-sm">{rewardMsg}</div>}
    </div>
  );
}
