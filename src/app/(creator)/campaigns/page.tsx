"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import GradientButton from "@/components/ui/GradientButton";

interface Track {
  id: string;
  title: string;
  isActive: boolean;
  coverUrl?: string;
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

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl bg-surface border border-white/[0.06] p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="skeleton h-5 w-40 mb-2" />
              <div className="skeleton h-3 w-28" />
            </div>
            <div className="skeleton h-6 w-16 rounded-full" />
          </div>
          <div className="skeleton h-2 w-full rounded-full mt-4" />
          <div className="skeleton h-3 w-24 mt-3" />
        </div>
      ))}
    </div>
  );
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-white/55 mt-1">Manage your promotional campaigns.</p>
        </div>
        <GradientButton href="/campaigns/new" size="sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Campaign
        </GradientButton>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : campaigns.length === 0 ? (
        <Card hover={false} className="text-center py-12">
          <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/30">
              <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
              <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" />
              <circle cx="12" cy="12" r="2" />
              <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" />
              <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
            </svg>
          </div>
          <p className="text-white/50 mb-4">No campaigns yet. Create one to start promoting tracks.</p>
          <GradientButton href="/campaigns/new">Create Campaign</GradientButton>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => {
            const remaining = c.budgetPoints - c.spentPoints;
            const activeTracks = c.tracks.filter((t) => t.isActive).length;
            const statusVariant = c.status === "ACTIVE" ? "active" : c.status === "PAUSED" ? "paused" : "ended";

            return (
              <Card key={c.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{c.name}</h3>
                    <p className="text-white/40 text-sm mt-0.5">
                      {c.costPerListen} pts/listen &middot; min {c.minListenSeconds}s
                    </p>
                  </div>
                  <Badge variant={statusVariant}>{c.status}</Badge>
                </div>

                {/* Budget bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white/40 mb-1.5">
                    <span>{c.spentPoints} / {c.budgetPoints} pts spent</span>
                    <span>{remaining} remaining</span>
                  </div>
                  <ProgressBar value={c.spentPoints} max={c.budgetPoints} />
                </div>

                {/* Tracks */}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-white/50">
                    {c.tracks.length} track{c.tracks.length !== 1 ? "s" : ""}
                    {activeTracks < c.tracks.length && (
                      <span className="text-white/30"> ({activeTracks} active)</span>
                    )}
                  </span>
                  <Link
                    href="/tracks/upload"
                    className="text-amber-300 hover:text-amber-200 text-xs transition-colors"
                  >
                    + Add track
                  </Link>
                </div>

                {c.tracks.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {c.tracks.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between text-sm py-2 border-t border-white/[0.04]"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                            {t.coverUrl ? (
                              <Image src={t.coverUrl} alt="" width={32} height={32} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20">
                                  <path d="M9 18V5l12-2v13" />
                                  <circle cx="6" cy="18" r="3" />
                                  <circle cx="18" cy="16" r="3" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <span className={t.isActive ? "text-white/80" : "text-white/30"}>
                            {t.title}
                          </span>
                        </div>
                        <Badge variant={t.isActive ? "active" : "default"} className="text-[10px]">
                          {t.isActive ? "active" : "inactive"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
