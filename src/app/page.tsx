import Link from "next/link";

export default function Home() {
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold">AMP MVP</h1>
      <p className="mt-2 text-white/70">Earn while you listen. Creator campaigns power rewards.</p>

      <div className="mt-6 flex gap-3 flex-wrap">
        <Link className="px-4 py-2 rounded bg-white text-black" href="/discover">Discover</Link>
        <Link className="px-4 py-2 rounded border border-white/20" href="/wallet">Wallet</Link>
        <Link className="px-4 py-2 rounded border border-white/20" href="/creator/dashboard">Creator</Link>
        <Link className="px-4 py-2 rounded border border-white/20" href="/admin">Admin</Link>
      </div>
    </main>
  );
}
