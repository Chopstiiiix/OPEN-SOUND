import TrackCard from "@/components/TrackCard";
import { DUMMY_TRACKS } from "@/lib/data/dummyData";

type ApiTrack = {
  id: string;
  title: string;
  artistName: string;
  coverUrl?: string | null;
  durationSec?: number;
};

async function getTracks(): Promise<ApiTrack[] | null> {
  try {
    const res = await fetch(`${process.env.APP_BASE_URL}/api/tracks`, { cache: "no-store" });
    const data = await res.json();
    if (Array.isArray(data.tracks) && data.tracks.length > 0) return data.tracks as ApiTrack[];
    return null;
  } catch {
    return null;
  }
}

export default async function ArtistPage({ params }: { params: Promise<{ artist: string }> }) {
  const { artist } = await params;
  const artistName = decodeURIComponent(artist);

  const apiTracks = await getTracks();
  const tracks = (apiTracks ?? DUMMY_TRACKS).filter(
    (track) => track.artistName.toLowerCase() === artistName.toLowerCase()
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-white/45">Artist</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-2">{artistName}</h1>
        <p className="text-white/55 mt-2">Tracks featuring this artist.</p>
      </div>

      {tracks.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-surface/80 p-6 text-white/60 text-sm">
          No tracks found for this artist yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {tracks.map((track) => (
            <TrackCard key={track.id} track={track} showPoints={false} />
          ))}
        </div>
      )}
    </div>
  );
}
