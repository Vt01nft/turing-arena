/// Bybit MAINNET public data layer. Everything here is unauthenticated:
/// recent trades, mark price, open interest, funding rate. We use this to
/// drive the "live Bybit mainnet" experience without needing access to
/// other users' private accounts (which Bybit blocks for privacy).
///
/// Every trade returned by getRecentTrades() is a REAL Bybit user's order
/// - we just don't know which user. We attribute clusters of trades to
/// "tracked profile" personas inside our app.

const REST = "https://api.bybit.com";

export type PublicTrade = {
  /** Bybit's internal execution id */
  id: string;
  symbol: string;
  price: number;
  /** in base coin (BTC) */
  size: number;
  side: "Buy" | "Sell";
  /** ms since epoch */
  time: number;
  /** USD notional = price * size */
  notional: number;
  /** flagged as "block trade" or RPI by Bybit (large / institutional) */
  block: boolean;
};

export async function getRecentTrades(symbol = "BTCUSDT", limit = 60): Promise<PublicTrade[]> {
  try {
    const url = `${REST}/v5/market/recent-trade?category=linear&symbol=${symbol}&limit=${limit}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0 (TuringArena)" },
    });
    if (!res.ok) {
      console.error(`[bybit-public] recent-trade HTTP ${res.status}`);
      return [];
    }
    const json = await res.json();
    if (json.retCode !== 0) return [];
    const list = (json.result?.list ?? []) as Array<{
      execId: string;
      symbol: string;
      price: string;
      size: string;
      side: "Buy" | "Sell";
      time: string;
      isBlockTrade?: boolean;
      isRPITrade?: boolean;
    }>;
    return list.map((t) => {
      const price = parseFloat(t.price);
      const size = parseFloat(t.size);
      return {
        id: t.execId,
        symbol: t.symbol,
        price,
        size,
        side: t.side,
        time: parseInt(t.time, 10),
        notional: price * size,
        block: !!t.isBlockTrade || !!t.isRPITrade,
      };
    });
  } catch {
    return [];
  }
}

export type MarketSnapshot = {
  symbol: string;
  lastPrice: number;
  bid1Price: number;
  ask1Price: number;
  price24hPcnt: number;
  volume24h: number;
  /** Open interest at the most recent reporting period (in base coin) */
  openInterest: number | null;
  /** Most recent settled funding rate (decimal, e.g. 0.0001 = 0.01%) */
  fundingRate: number | null;
  /** ms since epoch */
  fundingRateTime: number | null;
};

export async function getMarketSnapshot(symbol = "BTCUSDT"): Promise<MarketSnapshot | null> {
  try {
    const [tickRes, oiRes, frRes] = await Promise.all([
      fetch(`${REST}/v5/market/tickers?category=linear&symbol=${symbol}`, {
        cache: "no-store",
        headers: { "User-Agent": "Mozilla/5.0 (TuringArena)" },
      }),
      fetch(`${REST}/v5/market/open-interest?category=linear&symbol=${symbol}&intervalTime=1h&limit=1`, {
        cache: "no-store",
        headers: { "User-Agent": "Mozilla/5.0 (TuringArena)" },
      }),
      fetch(`${REST}/v5/market/funding/history?category=linear&symbol=${symbol}&limit=1`, {
        cache: "no-store",
        headers: { "User-Agent": "Mozilla/5.0 (TuringArena)" },
      }),
    ]);
    if (!tickRes.ok) {
      console.error(`[bybit-public] tickers HTTP ${tickRes.status}`);
      return null;
    }
    const tickJson = await tickRes.json();
    const t = tickJson?.result?.list?.[0];
    if (!t) return null;
    const oiJson = oiRes.ok ? await oiRes.json() : null;
    const frJson = frRes.ok ? await frRes.json() : null;
    const oi = oiJson?.result?.list?.[0];
    const fr = frJson?.result?.list?.[0];
    return {
      symbol: t.symbol,
      lastPrice: parseFloat(t.lastPrice),
      bid1Price: parseFloat(t.bid1Price),
      ask1Price: parseFloat(t.ask1Price),
      price24hPcnt: parseFloat(t.price24hPcnt),
      volume24h: parseFloat(t.volume24h),
      openInterest: oi ? parseFloat(oi.openInterest) : null,
      fundingRate: fr ? parseFloat(fr.fundingRate) : null,
      fundingRateTime: fr ? parseInt(fr.fundingRateTimestamp, 10) : null,
    };
  } catch {
    return null;
  }
}

/// Convenience: just the last trade price (mark proxy).
export async function getMarkPrice(symbol = "BTCUSDT"): Promise<number | null> {
  const s = await getMarketSnapshot(symbol);
  return s?.lastPrice ?? null;
}
