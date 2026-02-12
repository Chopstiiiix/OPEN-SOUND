import Link from "next/link";

export default function TrackCard({ track }: { track: any }) {
  return (
    <Link href={`/track/${track.id}`} className="block rounded-xl border border-white/10 p-4 hover:border-white/20">
      <div className="flex gap-3">
        <div className="w-14 h-14 rounded bg-white/10" />
        <div>
          <div className="font-medium">{track.title}</div>
          <div className="text-white/60 text-sm">{track.artistName}</div>
          <div className="text-white/40 text-xs mt-1">{track.durationSec}s</div>
        </div>
      </div>
    </Link>
  );
}
