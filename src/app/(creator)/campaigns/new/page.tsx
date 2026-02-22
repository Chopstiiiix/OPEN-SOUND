"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Card from "@/components/ui/Card";
import GradientButton from "@/components/ui/GradientButton";

const inputClasses =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors";

export default function NewCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [budgetPoints, setBudgetPoints] = useState("");
  const [costPerListen, setCostPerListen] = useState("");
  const [minListenSeconds, setMinListenSeconds] = useState("30");
  const [maxRewardsPerUser, setMaxRewardsPerUser] = useState("1");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/creator/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        budgetPoints: Number(budgetPoints),
        costPerListen: Number(costPerListen),
        minListenSeconds: Number(minListenSeconds),
        maxRewardsPerUser: Number(maxRewardsPerUser),
      }),
    });

    if (res.ok) {
      router.push("/campaigns");
    } else {
      setLoading(false);
      alert("Failed to create campaign");
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">New campaign</h1>
      <p className="text-white/55 mb-8">Set up a promotional campaign for your music.</p>

      <Card hover={false}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campaign details */}
          <div>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Campaign Details</h3>
            <label className="block">
              <span className="text-sm font-medium text-white/70">Campaign Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Summer Launch 2025"
                className={`${inputClasses} mt-1.5`}
              />
            </label>
          </div>

          {/* Budget */}
          <div>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Budget & Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-white/70">Budget (points)</span>
                <input
                  type="number"
                  min="1"
                  value={budgetPoints}
                  onChange={(e) => setBudgetPoints(e.target.value)}
                  required
                  placeholder="5000"
                  className={`${inputClasses} mt-1.5`}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white/70">Cost per listen</span>
                <input
                  type="number"
                  min="1"
                  value={costPerListen}
                  onChange={(e) => setCostPerListen(e.target.value)}
                  required
                  placeholder="5"
                  className={`${inputClasses} mt-1.5`}
                />
              </label>
            </div>
          </div>

          {/* Rules */}
          <div>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Listening Rules</h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-white/70">Min listen (seconds)</span>
                <input
                  type="number"
                  min="1"
                  value={minListenSeconds}
                  onChange={(e) => setMinListenSeconds(e.target.value)}
                  className={`${inputClasses} mt-1.5`}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-white/70">Max rewards/user</span>
                <input
                  type="number"
                  min="1"
                  value={maxRewardsPerUser}
                  onChange={(e) => setMaxRewardsPerUser(e.target.value)}
                  className={`${inputClasses} mt-1.5`}
                />
              </label>
            </div>
          </div>

          <div className="pt-2">
            <GradientButton type="submit" disabled={loading} size="lg" className="w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Campaign"
              )}
            </GradientButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
