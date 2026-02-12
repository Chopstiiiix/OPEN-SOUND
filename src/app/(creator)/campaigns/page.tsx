"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Track {
  id: string;
  title: string;
  isActive: boolean;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  budgetPoints: number;
  spentPoints: number;
  costPerListen: number;
  minListenSeconds: number;
  tracks: Track[];
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/creator/campaigns")
      .then((r) => r.json())
      .then((data) => setCampaigns(data.campaigns ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <p className="text-white/50">Loading campaigns...</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Campaigns</h2>
        <Link
          href="/creator/campaigns/new"
          className="px-4 py-2 rounded bg-white text-black text-sm"
        >
          New campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <p className="mt-6 text-white/50">No campaigns yet. Create one to start promoting tracks.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {campaigns.map((c) => {
            const pct = c.budgetPoints > 0 ? Math.round((c.spentPoints / c.budgetPoints) * 100) : 0;
            const remaining = c.budgetPoints - c.spentPoints;
            const activeTracks = c.tracks.filter((t) => t.isActive).length;

            return (
              <div key={c.id} className="rounded-xl border border-white/10 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{c.name}</h3>
                    <p className="text-white/50 text-sm mt-0.5">
                      {c.costPerListen} pts/listen &middot; min {c.minListenSeconds}s
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
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

                {/* Budget bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/60">
                      {c.spentPoints} / {c.budgetPoints} pts spent
                    </span>
                    <span className="text-white/40">{remaining} remaining</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Tracks */}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-white/60">
                    {c.tracks.length} track{c.tracks.length !== 1 ? "s" : ""}
                    {activeTracks < c.tracks.length && (
                      <span className="text-white/40"> ({activeTracks} active)</span>
                    )}
                  </span>
                  <Link
                    href="/creator/tracks/upload"
                    className="text-white/50 hover:text-white underline-offset-2 hover:underline"
                  >
                    Add track
                  </Link>
                </div>

                {c.tracks.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {c.tracks.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between text-sm py-1.5 border-t border-white/5"
                      >
                        <span className={t.isActive ? "text-white/80" : "text-white/30"}>
                          {t.title}
                        </span>
                        <span className={`text-xs ${t.isActive ? "text-emerald-400" : "text-white/30"}`}>
                          {t.isActive ? "active" : "inactive"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
