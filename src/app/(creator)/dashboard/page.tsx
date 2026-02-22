import Link from "next/link";
import Card from "@/components/ui/Card";
import { DUMMY_CAMPAIGNS } from "@/lib/data/dummyData";

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-300">
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function CreatorDashboard() {
  const campaigns = DUMMY_CAMPAIGNS;
  const totalListens = campaigns.reduce((sum, c) => sum + c.totalListens, 0);
  const totalTracks = campaigns.reduce((sum, c) => sum + c.trackCount, 0);
  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE").length;
  const recentCampaigns = campaigns.slice(0, 3);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Creator dashboard</h1>
        <p className="text-white/55 mt-2">Manage your campaigns and monitor performance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Active Campaigns"
          value={activeCampaigns}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
              <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" />
              <circle cx="12" cy="12" r="2" />
              <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" />
              <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
            </svg>
          }
        />
        <StatCard
          label="Total Tracks"
          value={totalTracks}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          }
        />
        <StatCard
          label="Total Listens"
          value={totalListens.toLocaleString()}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M12 7v5l4 2" />
            </svg>
          }
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/campaigns/new" className="group">
          <div className="relative overflow-hidden rounded-2xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl btn-gradient flex items-center justify-center mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <h3 className="font-semibold">New Campaign</h3>
              <p className="text-sm text-white/40 mt-1">Launch a new promotion for your music.</p>
            </div>
          </div>
        </Link>

        <Link href="/tracks/upload" className="group">
          <div className="relative overflow-hidden rounded-2xl p-6 border border-white/[0.08] hover:border-white/[0.14] transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
              </div>
              <h3 className="font-semibold">Upload Track</h3>
              <p className="text-sm text-white/40 mt-1">Add a new track to an existing campaign.</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent campaigns */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Campaigns</h2>
          <Link href="/campaigns" className="text-sm text-amber-300 hover:text-amber-200 transition-colors">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {recentCampaigns.map((c) => {
            const pct = c.budgetPoints > 0 ? Math.round((c.spentPoints / c.budgetPoints) * 100) : 0;
            return (
              <Card key={c.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{c.name}</h3>
                    <p className="text-xs text-white/40 mt-0.5">
                      {c.trackCount} tracks &middot; {c.totalListens} listens
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    c.status === "ACTIVE"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : c.status === "PAUSED"
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-white/10 text-white/40"
                  }`}>
                    {c.status}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-white/40 mb-1">
                    <span>{c.spentPoints} / {c.budgetPoints} pts</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
