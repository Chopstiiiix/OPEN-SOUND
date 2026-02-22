"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import AnimatedList from "@/components/AnimatedList";
import TrackOptionsMenu from "@/components/TrackOptionsMenu";

type QuickPickTrack = {
  id: string;
  title: string;
  artistName: string;
  coverUrl?: string | null;
};

export default function QuickPicksAnimated({ tracks }: { tracks: QuickPickTrack[] }) {
  const router = useRouter();

  return (
    <AnimatedList
      items={tracks}
      onItemSelect={(item) => router.push(`/track/${item.id}`)}
      showGradients
      enableArrowNavigation
      displayScrollbar
      className="w-full"
      renderItem={(item, _index, isSelected) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 border border-white/[0.08]">
            <Image
              src={item.coverUrl || "/covers/1.jpg"}
              alt={item.title}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="min-w-0">
            <p className={`text-base font-semibold truncate ${isSelected ? "text-white" : "text-white/95"}`}>
              {item.title}
            </p>
            <p className="text-sm text-white/55 truncate">{item.artistName}</p>
          </div>
          <div className="ml-auto">
            <TrackOptionsMenu track={item} />
          </div>
        </div>
      )}
    />
  );
}
