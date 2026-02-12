"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  // Load creator's campaigns
  useEffect(() => {
    fetch("/api/creator/campaigns")
      .then((r) => r.json())
      .then((data) => {
        const active = (data.campaigns ?? []).filter((c: Campaign) => c.status === "ACTIVE");
        setCampaigns(active);
        if (active.length === 1) setCampaignId(active[0].id);
      });
  }, []);

  // Read audio duration when file is selected
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file || !campaignId) return;

    setErrorMsg("");

    try {
      // 1. Get signed upload URL
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

      // 2. Upload file to Supabase storage
      setStep("uploading");
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("File upload to storage failed");
      }

      // 3. Create track record
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
      router.push("/creator/campaigns");
    } catch (err: any) {
      setStep("error");
      setErrorMsg(err.message || "Something went wrong");
    }
  }

  const busy = step === "signing" || step === "uploading" || step === "saving";

  const stepLabel: Record<string, string> = {
    signing: "Getting upload URL...",
    uploading: "Uploading audio...",
    saving: "Saving track...",
  };

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold">Upload Track</h2>
      <p className="text-white/60 mt-1">Add a track to one of your campaigns.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-white/70">Campaign</span>
          {campaigns.length === 0 ? (
            <p className="text-sm text-white/40">
              No active campaigns.{" "}
              <a href="/creator/campaigns/new" className="underline">Create one first.</a>
            </p>
          ) : (
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              required
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
            >
              <option value="">Select a campaign</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-white/70">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-white/70">Artist Name</span>
          <input
            type="text"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            required
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-white/70">Audio File</span>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            required
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-sm file:text-white"
          />
          {file && durationSec > 0 && (
            <span className="text-xs text-white/40 mt-1">
              {file.name} &middot; {Math.floor(durationSec / 60)}:{String(durationSec % 60).padStart(2, "0")}
            </span>
          )}
        </label>

        {errorMsg && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={busy || !file || !campaignId}
          className="mt-2 px-4 py-2.5 rounded bg-white text-black font-medium disabled:opacity-50"
        >
          {busy ? stepLabel[step] : "Upload track"}
        </button>
      </form>
    </main>
  );
}
