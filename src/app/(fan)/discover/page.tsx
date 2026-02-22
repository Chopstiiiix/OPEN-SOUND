import Link from "next/link";
import Image from "next/image";
import TrackCard from "@/components/TrackCard";
import { DUMMY_TRACKS } from "@/lib/data/dummyData";

type ApiTrack = {
  id: string;
  title: string;
  artistName: string;
  coverUrl?: string | null;
  durationSec?: number;
};

const chips = [
  "Podcasts",
  "Energize",
  "Workout",
  "Feel good",
  "Commute",
  "Relax",
  "Party",
  "Romance",
  "Sad",
  "Focus",
  "Sleep",
];

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

function ArrowButtons({ withPlay = false }: { withPlay?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {withPlay && (
        <button className="text-sm font-medium px-4 py-1 rounded-full border border-white/[0.18] text-white/80 hover:bg-white/[0.05] transition-colors">
          Play all
        </button>
      )}
      <button className="w-8 h-8 rounded-full border border-white/[0.12] text-white/60 hover:text-white hover:bg-white/[0.06] flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <button className="w-8 h-8 rounded-full border border-white/[0.12] text-white/80 hover:text-white hover:bg-white/[0.06] flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}

export default async function Discover() {
  const apiTracks = await getTracks();
  const tracks = (apiTracks ?? DUMMY_TRACKS) as Array<ApiTrack & { pointsPerListen?: number; campaign?: { costPerListen?: number } }>;

  const albumsForYou = tracks.slice(0, 6);
  const quickPicks = tracks.slice(0, 12);

  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in">
      <div className="space-y-8">
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip}
              className="px-3 py-1.5 rounded-lg text-sm text-white/80 bg-white/[0.11] hover:bg-white/[0.18] transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[42px] leading-none font-bold tracking-tight sm:text-5xl">
              <span className="text-white/45 block text-sm font-medium mb-2 tracking-wide">EASE INTO THE DAY</span>
              Albums for you
            </h2>
            <ArrowButtons />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {albumsForYou.map((track) => (
              <div key={track.id} className="min-w-0">
                <TrackCard track={track} showPoints={false} />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 pb-8">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-4xl sm:text-[44px] leading-none font-bold tracking-tight">Quick picks</h3>
            <ArrowButtons withPlay />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
            {quickPicks.map((track) => (
              <Link
                key={`quick-${track.id}`}
                href={`/track/${track.id}`}
                className="group flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/[0.06] transition-colors"
              >
                <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={track.coverUrl || `https://picsum.photos/seed/${track.id}/120/120`}
                    alt={track.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold truncate text-white/95 group-hover:text-white">{track.title}</p>
                  <p className="text-sm text-white/55 truncate">{track.artistName}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
