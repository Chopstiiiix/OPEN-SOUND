async function getWallet() {
  const res = await fetch(`${process.env.APP_BASE_URL}/api/wallet`, { cache: "no-store" });
  return res.json();
}

export default async function WalletPage() {
  const data = await getWallet();

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold">Wallet</h2>
      <div className="mt-4 rounded-xl border border-white/10 p-4">
        <div className="text-white/60 text-sm">Balance</div>
        <div className="text-3xl font-semibold">{data.balance} points</div>
      </div>

      <h3 className="mt-8 text-lg font-semibold">Recent activity</h3>
      <div className="mt-3 space-y-2">
        {data.ledger?.map((x: any) => (
          <div key={x.id} className="rounded-lg border border-white/10 p-3 text-sm flex justify-between">
            <div>
              <div className="font-medium">{x.type}</div>
              <div className="text-white/50">{new Date(x.createdAt).toLocaleString()}</div>
            </div>
            <div className="font-semibold">+{x.amount}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
