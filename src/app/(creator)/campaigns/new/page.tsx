"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
      router.push("/dashboard");
    } else {
      setLoading(false);
      alert("Failed to create campaign");
    }
  }

  return (
    <div className="mx-auto max-w-lg p-8">
      <h1 className="mb-8 text-3xl font-bold">New Campaign</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Campaign Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-lg border px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Budget (points)</span>
          <input
            type="number"
            min="1"
            value={budgetPoints}
            onChange={(e) => setBudgetPoints(e.target.value)}
            required
            className="rounded-lg border px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Cost per listen (points)</span>
          <input
            type="number"
            min="1"
            value={costPerListen}
            onChange={(e) => setCostPerListen(e.target.value)}
            required
            className="rounded-lg border px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Min listen seconds</span>
          <input
            type="number"
            min="1"
            value={minListenSeconds}
            onChange={(e) => setMinListenSeconds(e.target.value)}
            className="rounded-lg border px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Max rewards per user</span>
          <input
            type="number"
            min="1"
            value={maxRewardsPerUser}
            onChange={(e) => setMaxRewardsPerUser(e.target.value)}
            className="rounded-lg border px-3 py-2"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 rounded-full bg-zinc-900 px-8 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Campaign"}
        </button>
      </form>
    </div>
  );
}
