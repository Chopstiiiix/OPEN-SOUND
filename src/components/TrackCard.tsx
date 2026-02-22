import Link from "next/link";
import Image from "next/image";
import { formatDuration } from "@/lib/utils";
import TrackOptionsMenu from "@/components/TrackOptionsMenu";

type TrackLike = {
  id: string;
  title: string;
  artistName: string;
  coverUrl?: string | null;
  durationSec?: number;
  pointsPerListen?: number;
  campaign?: {
    costPerListen?: number;
  };
};

export default function TrackCard({
  track,
  showPoints = true,
}: {
  track: TrackLike;
  showPoints?: boolean;
}) {
  const coverUrl = track.coverUrl || `https://picsum.photos/seed/${track.id}/300/300`;
  const points = track.pointsPerListen || track.campaign?.costPerListen;

  return (
    <div className="group block">
      <div className="relative">
        <Link href={`/track/${track.id}`} className="block">
          <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-surface border border-white/[0.08]">
            <Image
              src={coverUrl}
              alt={track.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {/* Play button overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="black">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            </div>
            {/* Points badge */}
            {showPoints && points && (
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-[10px] text-amber-300 font-semibold px-2 py-0.5 rounded-full">
                +{points} pts
              </div>
            )}
          </div>
        </Link>

        <div className="absolute top-2 left-2">
          <TrackOptionsMenu
            track={{
              id: track.id,
              title: track.title,
              artistName: track.artistName,
              coverUrl: track.coverUrl ?? null,
            }}
          />
        </div>
      </div>
      <Link href={`/track/${track.id}`} className="block">
        <p className="text-sm font-semibold truncate group-hover:text-white transition-colors">{track.title}</p>
        <p className="text-xs text-white/55 truncate">{track.artistName}</p>
        {track.durationSec && (
          <p className="text-[10px] text-white/35 mt-0.5">{formatDuration(track.durationSec)}</p>
        )}
      </Link>
    </div>
  );
}
