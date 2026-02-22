"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import GradientButton from "@/components/ui/GradientButton";
import ProgressBar from "@/components/ui/ProgressBar";
import { cn, formatDuration } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  status: string;
}

function genPath(fileName: string) {
  const ext = fileName.split(".").pop() || "mp3";
  const id = crypto.randomUUID();
  return `uploads/${id}.${ext}`;
}

const inputClasses =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors";

const steps = [
  { key: "details", label: "Details" },
  { key: "file", label: "Audio File" },
  { key: "upload", label: "Upload" },
];

export default function UploadTrackPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignId, setCampaignId] = useState("");
  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [durationSec, setDurationSec] = useState(0);
  const [step, setStep] = useState<"idle" | "signing" | "uploading" | "saving" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetch("/api/creator/campaigns")
      .then((r) => r.json())
      .then((data) => {
        const active = (data.campaigns ?? []).filter((c: Campaign) => c.status === "ACTIVE");
        setCampaigns(active);
        if (active.length === 1) setCampaignId(active[0].id);
      });
  }, []);

  function handleFileChange(f: File | null) {
    setFile(f);
    setDurationSec(0);
    if (!f) return;

    const url = URL.createObjectURL(f);
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      setDurationSec(Math.round(audio.duration));
      URL.revokeObjectURL(url);
    });
    audio.addEventListener("error", () => {
      URL.revokeObjectURL(url);
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("audio/")) handleFileChange(f);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file || !campaignId) return;

    setErrorMsg("");

    try {
      setStep("signing");
      const path = genPath(file.name);

      const signRes = await fetch("/api/storage/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });

      if (!signRes.ok) {
        const data = await signRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to get upload URL");
      }

      const { url: signedUrl, path: storagePath } = await signRes.json();

      setStep("uploading");
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("File upload to storage failed");
      }

      setStep("saving");
      const trackRes = await fetch("/api/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          artistName,
          audioPath: storagePath,
          campaignId,
          durationSec: durationSec || 180,
        }),
      });

      if (!trackRes.ok) {
        const data = await trackRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save track");
      }

      setStep("done");
      router.push("/campaigns");
    } catch (err: unknown) {
      setStep("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const busy = step === "signing" || step === "uploading" || step === "saving";

  const currentStepIndex = step === "idle" ? (file ? 1 : 0) : 2;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">Upload track</h1>
      <p className="text-white/55 mb-6">Add a track to one of your active campaigns.</p>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2 flex-1">
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 transition-colors",
              i <= currentStepIndex
                ? "btn-gradient text-white"
                : "bg-white/[0.06] text-white/30"
            )}>
              {i + 1}
            </div>
            <span className={cn(
              "text-xs hidden sm:block",
              i <= currentStepIndex ? "text-white/70" : "text-white/30"
            )}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-px",
                i < currentStepIndex ? "bg-amber-500/40" : "bg-white/[0.06]"
              )} />
            )}
          </div>
        ))}
      </div>

      <Card hover={false}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campaign select */}
          <label className="block">
            <span className="text-sm font-medium text-white/70">Campaign</span>
            {campaigns.length === 0 ? (
              <p className="text-sm text-white/40 mt-1.5">
                No active campaigns.{" "}
                <Link href="/campaigns/new" className="text-amber-300 hover:text-amber-200 transition-colors">
                  Create one first.
                </Link>
              </p>
            ) : (
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                required
                className={`${inputClasses} mt-1.5`}
              >
                <option value="">Select a campaign</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </label>

          {/* Title & Artist */}
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-white/70">Title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Track title"
                className={`${inputClasses} mt-1.5`}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-white/70">Artist Name</span>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                required
                placeholder="Artist name"
                className={`${inputClasses} mt-1.5`}
              />
            </label>
          </div>

          {/* Drag-drop file zone */}
          <div>
            <span className="text-sm font-medium text-white/70">Audio File</span>
            <div
              className={cn(
                "mt-1.5 relative rounded-xl border-2 border-dashed p-8 text-center transition-colors",
                dragOver
                  ? "border-amber-500/50 bg-amber-500/5"
                  : file
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-white/[0.08] hover:border-white/[0.16]"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {file ? (
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-emerald-400">{file.name}</p>
                  {durationSec > 0 && (
                    <p className="text-xs text-white/40 mt-1">{formatDuration(durationSec)}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => { setFile(null); setDurationSec(0); }}
                    className="text-xs text-white/30 hover:text-white/50 mt-2 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                  </div>
                  <p className="text-sm text-white/50">Drag & drop audio file here</p>
                  <p className="text-xs text-white/30 mt-1">or click to browse</p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                    required={!file}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Upload progress */}
          {busy && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>
                  {step === "signing" && "Getting upload URL..."}
                  {step === "uploading" && "Uploading audio..."}
                  {step === "saving" && "Saving track..."}
                </span>
                <span>
                  {step === "signing" && "1/3"}
                  {step === "uploading" && "2/3"}
                  {step === "saving" && "3/3"}
                </span>
              </div>
              <ProgressBar
                value={step === "signing" ? 33 : step === "uploading" ? 66 : 100}
              />
            </div>
          )}

          {errorMsg && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {errorMsg}
            </div>
          )}

          <GradientButton type="submit" disabled={busy || !file || !campaignId} size="lg" className="w-full">
            {busy ? "Uploading..." : "Upload Track"}
          </GradientButton>
        </form>
      </Card>
    </div>
  );
}
