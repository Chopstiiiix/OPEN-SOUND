import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { DUMMY_TRACKS } from "@/lib/data/dummyData";
import HeroPlasma from "@/components/HeroPlasma";

function HeroTrackCard({ track }: { track: (typeof DUMMY_TRACKS)[number] }) {
  return (
    <div className="group rounded-2xl bg-surface/95 border border-white/[0.08] p-3 min-w-0">
      <div className="relative aspect-square rounded-xl overflow-hidden">
        <Image src={track.coverUrl} alt={track.title} fill className="object-cover" sizes="224px" />
      </div>
      <p className="text-sm font-semibold mt-3 truncate">{track.title}</p>
      <p className="text-xs text-white/55 truncate">{track.artistName}</p>
      <div className="mt-2 inline-flex items-center rounded-full bg-amber-500/20 text-amber-200 px-2 py-1 text-[10px] font-semibold">
        +{track.pointsPerListen} pts reward
      </div>
    </div>
  );
}

export default function Home() {
  const picks = DUMMY_TRACKS.slice(0, 6);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#111319]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl btn-gradient flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <span className="font-semibold tracking-wide">Open Sound</span>
          </Link>

          <div className="flex items-center gap-2">
            <SignInButton>
              <button className="px-4 py-2 rounded-full text-sm text-white/80 hover:bg-white/[0.06] transition-colors cursor-pointer">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="btn-gradient px-5 py-2 rounded-full text-sm font-semibold cursor-pointer">
                Start listening
              </button>
            </SignUpButton>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <section className="rounded-3xl border border-white/[0.08] bg-surface/80 overflow-hidden">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-0">
            <div className="relative overflow-hidden">
              <div className="absolute inset-0">
                <HeroPlasma />
              </div>
              <div className="relative z-10 p-8 sm:p-10">
                <p className="text-[11px] tracking-[0.2em] uppercase text-white/45">Discover and Earn</p>
                <h1 className="mt-3 text-4xl sm:text-5xl font-bold leading-tight">
                  The music feed that <span className="text-gradient">pays you</span> to listen.
                </h1>
                <p className="mt-4 text-white/60 max-w-xl">
                  Open Sound gives fans rewards for qualified plays while helping creators fund promotion campaigns.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <SignUpButton>
                    <button className="btn-gradient text-sm font-semibold px-6 py-3 rounded-full cursor-pointer">
                      Create account
                    </button>
                  </SignUpButton>
                  <Link
                    href="/discover"
                    className="text-sm font-semibold px-6 py-3 rounded-full border border-white/[0.14] hover:bg-white/[0.04] transition-colors"
                  >
                    Preview feed
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-white/[0.06]">
              <p className="text-sm font-semibold mb-4">Recommended right now</p>
              <div className="grid grid-cols-2 gap-3">
                {picks.slice(0, 4).map((track) => (
                  <HeroTrackCard key={track.id} track={track} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-surface/90 border border-white/[0.08] p-5">
            <p className="text-xs text-white/45 uppercase tracking-wider">For fans</p>
            <p className="mt-2 font-semibold">Listen. Track progress. Earn points.</p>
          </div>
          <div className="rounded-2xl bg-surface/90 border border-white/[0.08] p-5">
            <p className="text-xs text-white/45 uppercase tracking-wider">For creators</p>
            <p className="mt-2 font-semibold">Create campaigns and upload tracks.</p>
          </div>
          <div className="rounded-2xl bg-surface/90 border border-white/[0.08] p-5">
            <p className="text-xs text-white/45 uppercase tracking-wider">For admins</p>
            <p className="mt-2 font-semibold">Control fraud rules, track status, manage spend.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
