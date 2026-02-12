"use client";

import { useEffect, useState } from "react";

interface Track {
  id: string;
  title: string;
  artistName: string;
  isActive: boolean;
  campaignId: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  budgetPoints: number;
  spentPoints: number;
  tracks: { id: string; title: string; isActive: boolean }[];
}

interface FraudRules {
  id: string;
  dailyRewardCap: number;
  maxSessionsPerHour: number;
  minHeartbeatGapMs: number;
}

export default function AdminPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [rules, setRules] = useState<FraudRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/overview").then((r) => r.json()),
      fetch("/api/admin/fraud-rules").then((r) => r.json()),
    ])
      .then(([overview, fraud]) => {
        setCampaigns(overview.campaigns ?? []);
        setTracks(overview.tracks ?? []);
        setRules(fraud.rules ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggleTrack(id: string, isActive: boolean) {
    setSaving(`track-${id}`);
    const res = await fetch(`/api/admin/tracks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    if (res.ok) {
      setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, isActive } : t)));
      setCampaigns((prev) =>
        prev.map((c) => ({
          ...c,
          tracks: c.tracks.map((t) => (t.id === id ? { ...t, isActive } : t)),
        }))
      );
    }
    setSaving(null);
  }

  async function setCampaignStatus(id: string, status: string) {
    setSaving(`campaign-${id}`);
    const res = await fetch(`/api/admin/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    }
    setSaving(null);
  }

  async function saveRules() {
    if (!rules) return;
    setSaving("rules");
    await fetch("/api/admin/fraud-rules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dailyRewardCap: rules.dailyRewardCap,
        maxSessionsPerHour: rules.maxSessionsPerHour,
        minHeartbeatGapMs: rules.minHeartbeatGapMs,
      }),
    });
    setSaving(null);
  }

  if (loading) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <p className="text-white/50">Loading admin panel...</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-white/50 mt-1">Manage campaigns, tracks, and fraud rules.</p>
      </div>

      {/* Fraud Rules */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Fraud Rules</h2>
        {rules && (
          <div className="rounded-xl border border-white/10 p-4 space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-white/70">Daily reward cap (pts/day)</span>
              <input
                type="number"
                min={1}
                value={rules.dailyRewardCap}
                onChange={(e) => setRules({ ...rules, dailyRewardCap: Number(e.target.value) })}
                className="w-24 rounded border border-white/10 bg-white/5 px-2 py-1 text-right text-sm text-white"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-white/70">Max sessions per hour</span>
              <input
                type="number"
                min={1}
                value={rules.maxSessionsPerHour}
                onChange={(e) => setRules({ ...rules, maxSessionsPerHour: Number(e.target.value) })}
                className="w-24 rounded border border-white/10 bg-white/5 px-2 py-1 text-right text-sm text-white"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-white/70">Min heartbeat gap (ms)</span>
              <input
                type="number"
                min={500}
                step={500}
                value={rules.minHeartbeatGapMs}
                onChange={(e) => setRules({ ...rules, minHeartbeatGapMs: Number(e.target.value) })}
                className="w-24 rounded border border-white/10 bg-white/5 px-2 py-1 text-right text-sm text-white"
              />
            </label>
            <button
              onClick={saveRules}
              disabled={saving === "rules"}
              className="mt-1 px-4 py-1.5 rounded bg-white text-black text-sm font-medium disabled:opacity-50"
            >
              {saving === "rules" ? "Saving..." : "Save rules"}
            </button>
          </div>
        )}
      </section>

      {/* Campaigns */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Campaigns</h2>
        {campaigns.length === 0 ? (
          <p className="text-white/40 text-sm">No campaigns.</p>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => {
              const pct = c.budgetPoints > 0 ? Math.round((c.spentPoints / c.budgetPoints) * 100) : 0;
              return (
                <div key={c.id} className="rounded-xl border border-white/10 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{c.name}</h3>
                      <p className="text-white/50 text-sm">
                        {c.spentPoints}/{c.budgetPoints} pts ({pct}%) &middot; {c.tracks.length} tracks
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          c.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : c.status === "PAUSED"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-white/10 text-white/40"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>

                  {/* Budget bar */}
                  <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="mt-3 flex gap-2">
                    {c.status !== "ACTIVE" && (
                      <button
                        onClick={() => setCampaignStatus(c.id, "ACTIVE")}
                        disabled={saving === `campaign-${c.id}`}
                        className="px-3 py-1 rounded text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50"
                      >
                        Activate
                      </button>
                    )}
                    {c.status === "ACTIVE" && (
                      <button
                        onClick={() => setCampaignStatus(c.id, "PAUSED")}
                        disabled={saving === `campaign-${c.id}`}
                        className="px-3 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 disabled:opacity-50"
                      >
                        Pause
                      </button>
                    )}
                    {c.status !== "ENDED" && (
                      <button
                        onClick={() => setCampaignStatus(c.id, "ENDED")}
                        disabled={saving === `campaign-${c.id}`}
                        className="px-3 py-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50"
                      >
                        End
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Tracks */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Tracks</h2>
        {tracks.length === 0 ? (
          <p className="text-white/40 text-sm">No tracks.</p>
        ) : (
          <div className="rounded-xl border border-white/10 divide-y divide-white/5">
            {tracks.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3">
                <div>
                  <span className={t.isActive ? "text-white" : "text-white/40"}>{t.title}</span>
                  <span className="text-white/40 text-sm ml-2">{t.artistName}</span>
                </div>
                <button
                  onClick={() => toggleTrack(t.id, !t.isActive)}
                  disabled={saving === `track-${t.id}`}
                  className={`px-3 py-1 rounded text-xs font-medium disabled:opacity-50 ${
                    t.isActive
                      ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  }`}
                >
                  {t.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
