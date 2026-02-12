import TrackCard from "@/components/TrackCard";

async function getTracks() {
  const res = await fetch(`${process.env.APP_BASE_URL}/api/tracks`, { cache: "no-store" });
  return res.json();
}

export default async function Discover() {
  const data = await getTracks();
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold">Discover</h2>
      <p className="text-white/60 mt-1">Listen and earn AMP points.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.tracks?.map((t: any) => <TrackCard key={t.id} track={t} />)}
      </div>
    </main>
  );
}
