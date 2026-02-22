"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type PlayerTrack = {
  id: string;
  title?: string;
  artistName?: string;
  coverUrl?: string | null;
  durationSec: number;
  campaign?: {
    minListenSeconds?: number;
    costPerListen?: number;
  };
};

interface PlayerState {
  track: PlayerTrack | null;
  isPlaying: boolean;
  currentTime: number;
  audioDuration: number;
  volume: number;
  isMuted: boolean;
  showDock: boolean;
  playUrl: string;
  sessionId: string | null;
  progressSec: number;
  pct: number;
  status: string;
  rewardMsg: string;
}

interface PlayerActions {
  loadTrack: (track: PlayerTrack) => void;
  togglePlay: () => void;
  seek: (e: React.MouseEvent<HTMLDivElement>) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  startSession: () => Promise<void>;
  claimReward: () => Promise<void>;
}

type PlayerContextValue = PlayerState & PlayerActions;

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [track, setTrack] = useState<PlayerTrack | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [progressSec, setProgressSec] = useState(0);
  const [pct, setPct] = useState(0);
  const [status, setStatus] = useState<string>("idle");
  const [rewardMsg, setRewardMsg] = useState<string>("");
  const [playUrl, setPlayUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDock, setShowDock] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const prevVolume = useRef(80);
  const trackIdRef = useRef<string | null>(null);

  // Fetch stream URL when track changes
  useEffect(() => {
    if (!track) return;
    if (track.id === trackIdRef.current) return;
    trackIdRef.current = track.id;

    async function loadUrl() {
      const res = await fetch(`/api/tracks/${track!.id}/stream`);
      const data = await res.json();
      if (res.ok) setPlayUrl(data.url);
    }
    loadUrl();
  }, [track]);

  const deviceHash = useMemo(() => {
    if (typeof navigator === "undefined") return "";
    return `${navigator.platform}-${navigator.language}-${screen.width}x${screen.height}`;
  }, []);

  function handleVolumeChange(val: number) {
    setVolumeState(val);
    setIsMuted(val === 0);
    if (audioRef.current) audioRef.current.volume = val / 100;
  }

  function toggleMute() {
    if (isMuted) {
      const restored = prevVolume.current > 0 ? prevVolume.current : 80;
      setVolumeState(restored);
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = restored / 100;
    } else {
      prevVolume.current = volume;
      setVolumeState(0);
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  }

  function loadTrack(newTrack: PlayerTrack) {
    if (track?.id === newTrack.id) return;

    // Stop current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Reset session state for new track
    setSessionId(null);
    setProgressSec(0);
    setPct(0);
    setStatus("idle");
    setRewardMsg("");
    setPlayUrl("");
    setCurrentTime(0);
    setIsPlaying(false);
    setAudioDuration(newTrack.durationSec || 0);
    trackIdRef.current = null; // Allow the URL fetch effect to fire
    setTrack(newTrack);
  }

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      setShowDock(true);
      a.play();
      setIsPlaying(true);
    } else {
      a.pause();
      setIsPlaying(false);
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    a.currentTime = ratio * a.duration;
  }

  async function startSession() {
    if (!track) return;
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
    setShowDock(true);
    audioRef.current?.play();
  }

  const heartbeat = useCallback(
    async (sid: string, prog: number, comp: number) => {
      await fetch("/api/player/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sid,
          progressSec: prog,
          completionPct: comp,
        }),
      });
    },
    []
  );

  async function claimReward() {
    if (!sessionId || !track) return;
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
    setRewardMsg(`+${data.reward.amount} points`);
    setStatus("rewarded");
  }

  // Heartbeat interval
  useEffect(() => {
    if (!sessionId) return;

    const timer = setInterval(() => {
      if (!audioRef.current) return;

      const current = Math.floor(audioRef.current.currentTime || 0);
      const duration = Math.max(
        1,
        Math.floor(audioRef.current.duration || track?.durationSec || 1)
      );
      const completion = Math.min(
        100,
        Math.floor((current / duration) * 100)
      );

      setProgressSec(current);
      setPct(completion);

      if (current > 0 && current % 5 === 0) heartbeat(sessionId, current, completion);
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionId, track?.durationSec, heartbeat]);

  function handleTimeUpdate() {
    const a = audioRef.current;
    if (!a) return;
    setCurrentTime(a.currentTime);
    if (a.duration) setAudioDuration(a.duration);
  }

  const value: PlayerContextValue = {
    track,
    isPlaying,
    currentTime,
    audioDuration,
    volume,
    isMuted,
    showDock,
    playUrl,
    sessionId,
    progressSec,
    pct,
    status,
    rewardMsg,
    loadTrack,
    togglePlay,
    seek,
    setVolume: handleVolumeChange,
    toggleMute,
    startSession,
    claimReward,
  };

  return (
    <PlayerContext.Provider value={value}>
      {/* Hidden audio element — persists across navigations */}
      <audio
        ref={audioRef}
        src={playUrl}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            if (audioRef.current.duration)
              setAudioDuration(audioRef.current.duration);
            audioRef.current.volume = volume / 100;
          }
        }}
        className="hidden"
      />
      {children}
    </PlayerContext.Provider>
  );
}
