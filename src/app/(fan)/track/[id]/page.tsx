import Player from "@/components/Player";

async function getTrack(id: string) {
  const res = await fetch(`${process.env.APP_BASE_URL}/api/tracks/${id}`, { cache: "no-store" });
  return res.json();
}

export default async function TrackPage({ params }: { params: { id: string } }) {
  const data = await getTrack(params.id);
  const t = data.track;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold">{t.title}</h2>
      <p className="text-white/60">{t.artistName}</p>

      <div className="mt-6">
        <Player track={t} />
      </div>

      <div className="mt-6 text-sm text-white/50">
        Minimum listen: {t.campaign.minListenSeconds}s • Reward: {t.campaign.costPerListen} points
      </div>
    </main>
  );
}
