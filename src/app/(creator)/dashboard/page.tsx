import Link from "next/link";

export default function CreatorDashboard() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold">Creator</h2>
      <p className="text-white/60 mt-1">Run campaigns and upload tracks.</p>

      <div className="mt-6 flex gap-3 flex-wrap">
        <Link className="px-4 py-2 rounded bg-white text-black" href="/creator/campaigns">Campaigns</Link>
        <Link className="px-4 py-2 rounded border border-white/20" href="/creator/campaigns/new">New campaign</Link>
        <Link className="px-4 py-2 rounded border border-white/20" href="/creator/tracks/upload">Upload track</Link>
      </div>
    </main>
  );
}
