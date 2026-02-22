import { DUMMY_WALLET, DUMMY_LEDGER } from "@/lib/data/dummyData";

async function getWallet() {
  try {
    const res = await fetch(`${process.env.APP_BASE_URL}/api/wallet`, { cache: "no-store" });
    const data = await res.json();
    if (data.balance !== undefined) return data;
    return null;
  } catch {
    return null;
  }
}

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function WalletPage() {
  const apiData = await getWallet();

  const balance = apiData?.balance ?? DUMMY_WALLET.balance;
  const weeklyDelta = DUMMY_WALLET.weeklyDelta;
  const ledger: Array<{
    id: string;
    type: string;
    amount: number;
    createdAt: string;
    trackTitle?: string;
  }> = apiData?.ledger?.length > 0 ? apiData.ledger : DUMMY_LEDGER;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Wallet</h1>

      {/* Balance card */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-white/[0.08] bg-surface/85">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent" />
        <div className="absolute inset-0 border border-amber-500/20 rounded-2xl" />
        <div className="relative">
          <p className="text-sm text-white/50">Total Balance</p>
          <p className="text-5xl sm:text-6xl font-bold mt-2 text-gradient">{balance.toLocaleString()}</p>
          <p className="text-sm text-white/40 mt-1">points</p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            +{weeklyDelta} this week
          </div>
        </div>
      </div>

      {/* Ledger */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-2">
          {ledger.map((entry) => {
            const isReward = entry.type === "REWARD";
            const isBonus = entry.type === "BONUS";
            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-xl bg-surface border border-white/[0.06] p-4 hover:border-white/[0.12] transition-colors"
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isReward ? "bg-amber-500/15" : isBonus ? "bg-orange-500/15" : "bg-white/10"
                }`}>
                  {isReward ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fda4af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {isReward ? "Listening Reward" : isBonus ? "Bonus" : entry.type}
                  </p>
                  <p className="text-xs text-white/40 truncate">
                    {entry.trackTitle && <span>{entry.trackTitle} &middot; </span>}
                    {relativeTime(entry.createdAt)}
                  </p>
                </div>

                {/* Amount */}
                <span className={`text-sm font-semibold ${isReward ? "text-amber-300" : "text-orange-300"}`}>
                  +{entry.amount}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
