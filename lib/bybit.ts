/// Bybit testnet client wrapper. Currently a thin scaffold: types + an
/// unauthenticated public-data getter so the UI can display real BTC/USDT
/// price even before keys are wired. Authenticated routes (place order,
/// read position, read PnL) live in lib/bybit-trader.ts once the user
/// supplies BYBIT_API_KEY / BYBIT_API_SECRET in .env.local.
///
/// Get free testnet keys at https://testnet.bybit.com/app/user/api-management

const BYBIT_TESTNET_REST = "https://api-testnet.bybit.com";

export type Ticker = {
  symbol: string;
  lastPrice: number;
  bid1Price: number;
  ask1Price: number;
  price24hPcnt: number;
  volume24h: number;
};

/// Public endpoint, no auth required.
export async function getTicker(symbol = "BTCUSDT"): Promise<Ticker | null> {
  try {
    const url = `${BYBIT_TESTNET_REST}/v5/market/tickers?category=spot&symbol=${symbol}`;
    const res = await fetch(url, { next: { revalidate: 15 } });
    if (!res.ok) return null;
    const json = await res.json();
    const t = json?.result?.list?.[0];
    if (!t) return null;
    return {
      symbol: t.symbol,
      lastPrice: parseFloat(t.lastPrice),
      bid1Price: parseFloat(t.bid1Price),
      ask1Price: parseFloat(t.ask1Price),
      price24hPcnt: parseFloat(t.price24hPcnt),
      volume24h: parseFloat(t.volume24h),
    };
  } catch {
    return null;
  }
}

export function hasBybitKeys(): boolean {
  return !!process.env.BYBIT_API_KEY && !!process.env.BYBIT_API_SECRET;
}

export type ContestantBybitSnapshot = {
  account: string;
  totalEquityUsd: number;
  realisedPnl24h: number;
  positions: { symbol: string; size: number; side: "buy" | "sell"; entryPrice: number; markPrice: number; unrealisedPnl: number }[];
  /** true if numbers came from the real Bybit API; false = placeholder/mock */
  live: boolean;
};

/// Returns a snapshot of a contestant's Bybit positions. Currently returns
/// deterministic mock data keyed on the account string. Swap to real API
/// calls once authenticated trading is wired.
export async function getContestantSnapshot(account: string): Promise<ContestantBybitSnapshot> {
  const seed = account.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = (n: number) => (Math.sin(seed * 9301 + n * 49297) * 0.5 + 0.5);
  const equity = 10_000 + rand(1) * 3_500;
  const pnl = (rand(2) - 0.4) * 420;
  const hasPos = rand(3) > 0.25;
  return {
    account,
    totalEquityUsd: equity,
    realisedPnl24h: pnl,
    positions: hasPos
      ? [
          {
            symbol: "BTCUSDT",
            size: 0.05 + rand(4) * 0.2,
            side: rand(5) > 0.5 ? "buy" : "sell",
            entryPrice: 95_000 + rand(6) * 4_000,
            markPrice: 96_500 + rand(7) * 1_500,
            unrealisedPnl: (rand(8) - 0.45) * 380,
          },
        ]
      : [],
    live: false,
  };
}
