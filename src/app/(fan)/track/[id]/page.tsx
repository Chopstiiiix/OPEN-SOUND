import Image from "next/image";
import Player from "@/components/Player";
import Badge from "@/components/ui/Badge";
import TrackCard from "@/components/TrackCard";
import TrackOptionsMenu from "@/components/TrackOptionsMenu";
import { DUMMY_TRACKS } from "@/lib/data/dummyData";
import { formatDuration } from "@/lib/utils";

async function getTrack(id: string) {
  // Try API first, fall back to dummy data
  if (id.startsWith("dummy-")) {
    const dummy = DUMMY_TRACKS.find((t) => t.id === id);
    return dummy ? { track: dummy } : null;
  }
  try {
    const res = await fetch(`${process.env.APP_BASE_URL}/api/tracks/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getTrack(id);

  if (!data || !data.track) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-white/40 text-lg">Track not found</p>
        </div>
      </div>
    );
  }

  const t = data.track;
  const coverUrl = t.coverUrl || `https://picsum.photos/seed/${t.id}/600/600`;
  const relatedTracks = DUMMY_TRACKS.filter((dt) => dt.id !== t.id).slice(0, 4);

  return (
    <div className="animate-fade-in">
        {/* Blurred background */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 scale-110 blur-3xl opacity-30"
          style={{
            backgroundImage: `url(${coverUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-background/88" />
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Track header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-2xl flex-shrink-0 border border-white/[0.1]">
            <Image
              src={coverUrl}
              alt={t.title}
              fill
              className="object-cover"
              sizes="224px"
              priority
            />
          </div>
          <div className="text-center sm:text-left">
            <Badge variant="active" className="mb-3">Campaign Active</Badge>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{t.title}</h1>
              <TrackOptionsMenu
                track={{
                  id: t.id,
                  title: t.title,
                  artistName: t.artistName,
                  coverUrl: t.coverUrl ?? null,
                }}
              />
            </div>
            <p className="text-lg text-white/60 mt-1">{t.artistName}</p>
            <p className="text-sm text-white/40 mt-2">{formatDuration(t.durationSec)}</p>
          </div>
        </div>

        {/* Player */}
        <Player track={t} />

        {/* Campaign info */}
        {t.campaign && (
          <div className="rounded-2xl p-5 bg-surface/85 border border-white/[0.08]">
            <h3 className="text-sm font-semibold text-white/80 mb-3">Campaign Info</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-white/40">Campaign</p>
                <p className="text-sm font-medium mt-0.5">{t.campaign.name}</p>
              </div>
              <div>
                <p className="text-xs text-white/40">Reward</p>
                <p className="text-sm font-medium mt-0.5 text-amber-300">{t.campaign.costPerListen} pts</p>
              </div>
              <div>
                <p className="text-xs text-white/40">Min Listen</p>
                <p className="text-sm font-medium mt-0.5">{t.campaign.minListenSeconds}s</p>
              </div>
              <div>
                <p className="text-xs text-white/40">Status</p>
                <p className="text-sm font-medium mt-0.5">{t.campaign.status}</p>
              </div>
            </div>
          </div>
        )}

        {/* Related tracks */}
        <section>
          <h2 className="text-lg font-semibold mb-4">More Tracks</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedTracks.map((rt) => (
              <TrackCard key={rt.id} track={rt} showPoints={false} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
