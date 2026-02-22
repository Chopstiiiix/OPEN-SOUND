"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import GradientButton from "@/components/ui/GradientButton";
import { cn } from "@/lib/utils";

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

type Tab = "campaigns" | "tracks" | "settings";

const inputClasses =
  "w-28 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-right text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors";

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl bg-surface border border-white/[0.06] p-5">
          <div className="skeleton h-5 w-48 mb-2" />
          <div className="skeleton h-3 w-32" />
          <div className="skeleton h-2 w-full rounded-full mt-4" />
        </div>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [rules, setRules] = useState<FraudRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("campaigns");
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

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

  async function seedDatabase() {
    setSeeding(true);
    setSeedMsg("");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSeedMsg(`Seeded: ${data.campaignsCreated} campaigns, ${data.tracksCreated} tracks`);
      } else {
        setSeedMsg(`Error: ${data.error || "Failed to seed"}`);
      }
    } catch {
      setSeedMsg("Error: Failed to seed database");
    }
    setSeeding(false);
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "campaigns", label: "Campaigns", count: campaigns.length },
    { key: "tracks", label: "Tracks", count: tracks.length },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Admin panel</h1>
        <p className="text-white/55 mt-1">Manage campaigns, tracks, and fraud rules.</p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface border border-white/[0.06]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "bg-white/[0.12] text-white"
                : "text-white/40 hover:text-white/60"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs text-white/30">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Campaigns Tab */}
          {activeTab === "campaigns" && (
            <div className="space-y-3">
              {campaigns.length === 0 ? (
                <Card hover={false} className="text-center py-8">
                  <p className="text-white/40 text-sm">No campaigns found.</p>
                </Card>
              ) : (
                campaigns.map((c) => {
                  const pct = c.budgetPoints > 0 ? Math.round((c.spentPoints / c.budgetPoints) * 100) : 0;
                  const statusVariant = c.status === "ACTIVE" ? "active" : c.status === "PAUSED" ? "paused" : "ended";
                  return (
                    <Card key={c.id}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{c.name}</h3>
                          <p className="text-white/40 text-sm mt-0.5">
                            {c.spentPoints}/{c.budgetPoints} pts ({pct}%) &middot; {c.tracks.length} tracks
                          </p>
                        </div>
                        <Badge variant={statusVariant}>{c.status}</Badge>
                      </div>

                      <div className="mt-3">
                        <ProgressBar value={c.spentPoints} max={c.budgetPoints} />
                      </div>

                      <div className="mt-3 flex gap-2">
                        {c.status !== "ACTIVE" && (
                          <button
                            onClick={() => setCampaignStatus(c.id, "ACTIVE")}
                            disabled={saving === `campaign-${c.id}`}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50 transition-colors"
                          >
                            Activate
                          </button>
                        )}
                        {c.status === "ACTIVE" && (
                          <button
                            onClick={() => setCampaignStatus(c.id, "PAUSED")}
                            disabled={saving === `campaign-${c.id}`}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 disabled:opacity-50 transition-colors"
                          >
                            Pause
                          </button>
                        )}
                        {c.status !== "ENDED" && (
                          <button
                            onClick={() => setCampaignStatus(c.id, "ENDED")}
                            disabled={saving === `campaign-${c.id}`}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500/15 text-red-400 hover:bg-red-500/25 disabled:opacity-50 transition-colors"
                          >
                            End
                          </button>
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* Tracks Tab */}
          {activeTab === "tracks" && (
            <Card hover={false}>
              {tracks.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-4">No tracks found.</p>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {tracks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20">
                            <path d="M9 18V5l12-2v13" />
                            <circle cx="6" cy="18" r="3" />
                            <circle cx="18" cy="16" r="3" />
                          </svg>
                        </div>
                        <div>
                          <span className={cn("text-sm", t.isActive ? "text-white" : "text-white/40")}>
                            {t.title}
                          </span>
                          <span className="text-white/30 text-xs ml-2">{t.artistName}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleTrack(t.id, !t.isActive)}
                        disabled={saving === `track-${t.id}`}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors",
                          t.isActive
                            ? "bg-orange-500/15 text-red-400 hover:bg-red-500/25"
                            : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                        )}
                      >
                        {t.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Fraud Rules */}
              {rules && (
                <Card hover={false}>
                  <h3 className="text-sm font-semibold text-white/80 mb-4">Fraud Prevention Rules</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-white/70">Daily reward cap</span>
                        <p className="text-xs text-white/30">Max points a user can earn per day</p>
                      </div>
                      <input
                        type="number"
                        min={1}
                        value={rules.dailyRewardCap}
                        onChange={(e) => setRules({ ...rules, dailyRewardCap: Number(e.target.value) })}
                        className={inputClasses}
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-white/70">Max sessions per hour</span>
                        <p className="text-xs text-white/30">Rate limit for listening sessions</p>
                      </div>
                      <input
                        type="number"
                        min={1}
                        value={rules.maxSessionsPerHour}
                        onChange={(e) => setRules({ ...rules, maxSessionsPerHour: Number(e.target.value) })}
                        className={inputClasses}
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-white/70">Min heartbeat gap</span>
                        <p className="text-xs text-white/30">Minimum ms between heartbeats</p>
                      </div>
                      <input
                        type="number"
                        min={500}
                        step={500}
                        value={rules.minHeartbeatGapMs}
                        onChange={(e) => setRules({ ...rules, minHeartbeatGapMs: Number(e.target.value) })}
                        className={inputClasses}
                      />
                    </label>
                    <div className="pt-2">
                      <GradientButton onClick={saveRules} disabled={saving === "rules"} size="sm">
                        {saving === "rules" ? "Saving..." : "Save Rules"}
                      </GradientButton>
                    </div>
                  </div>
                </Card>
              )}

              {/* Seed database */}
              <Card hover={false}>
                <h3 className="text-sm font-semibold text-white/80 mb-2">Seed Database</h3>
                <p className="text-xs text-white/40 mb-4">Insert dummy campaigns and tracks into the database for testing.</p>
                <GradientButton onClick={seedDatabase} disabled={seeding} size="sm">
                  {seeding ? "Seeding..." : "Seed Dummy Data"}
                </GradientButton>
                {seedMsg && (
                  <p className={cn(
                    "text-xs mt-3",
                    seedMsg.startsWith("Error") ? "text-red-400" : "text-emerald-400"
                  )}>
                    {seedMsg}
                  </p>
                )}
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
