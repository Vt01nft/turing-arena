/// Bybit testnet v5 REST client. Public endpoints are anonymous;
/// authenticated endpoints require HMAC SHA256 signing per
/// https://bybit-exchange.github.io/docs/v5/guide#authentication
///
/// Keys: testnet.bybit.com/app/user/api-management
/// Set BYBIT_API_KEY + BYBIT_API_SECRET in .env.local. Without them,
/// authed calls return null and the UI shows the deterministic mocks.

import { createHmac } from "node:crypto";

const REST = "https://api-testnet.bybit.com";
const RECV_WINDOW = "5000";

export function hasBybitKeys(): boolean {
  return !!process.env.BYBIT_API_KEY && !!process.env.BYBIT_API_SECRET;
}

function sign(timestamp: string, payload: string): string {
  const secret = process.env.BYBIT_API_SECRET!;
  const prehash = timestamp + process.env.BYBIT_API_KEY + RECV_WINDOW + payload;
  return createHmac("sha256", secret).update(prehash).digest("hex");
}

async function authedGet<T = unknown>(
  path: string,
  query: Record<string, string | number | undefined> = {},
): Promise<T | null> {
  if (!hasBybitKeys()) return null;
  const qs = new URLSearchParams(
    Object.entries(query).reduce<Record<string, string>>((acc, [k, v]) => {
      if (v !== undefined && v !== "") acc[k] = String(v);
      return acc;
    }, {}),
  ).toString();
  const timestamp = Date.now().toString();
  const signature = sign(timestamp, qs);
  const url = `${REST}${path}${qs ? `?${qs}` : ""}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-BAPI-API-KEY": process.env.BYBIT_API_KEY!,
        "X-BAPI-TIMESTAMP": timestamp,
        "X-BAPI-RECV-WINDOW": RECV_WINDOW,
        "X-BAPI-SIGN": signature,
        "X-BAPI-SIGN-TYPE": "2",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[bybit] ${path} -> HTTP ${res.status}`);
      return null;
    }
    const json = await res.json();
    if (json.retCode !== 0) {
      console.error(`[bybit] ${path} retCode=${json.retCode} retMsg=${json.retMsg}`);
      return null;
    }
    return json.result as T;
  } catch (e) {
    console.error(`[bybit] ${path} threw:`, e);
    return null;
  }
}

async function authedPost<T = unknown>(path: string, body: Record<string, unknown>): Promise<T | null> {
  if (!hasBybitKeys()) return null;
  const payload = JSON.stringify(body);
  const timestamp = Date.now().toString();
  const signature = sign(timestamp, payload);
  try {
    const res = await fetch(`${REST}${path}`, {
      method: "POST",
      headers: {
        "X-BAPI-API-KEY": process.env.BYBIT_API_KEY!,
        "X-BAPI-TIMESTAMP": timestamp,
        "X-BAPI-RECV-WINDOW": RECV_WINDOW,
        "X-BAPI-SIGN": signature,
        "X-BAPI-SIGN-TYPE": "2",
        "Content-Type": "application/json",
      },
      body: payload,
      cache: "no-store",
    });
    const json = await res.json();
    if (json.retCode !== 0) {
      console.error(`[bybit] ${path} retCode=${json.retCode} retMsg=${json.retMsg}`);
      return null;
    }
    return json.result as T;
  } catch (e) {
    console.error(`[bybit] ${path} threw:`, e);
    return null;
  }
}

// ─── Public endpoints ───────────────────────────────────────────────────

export type Ticker = {
  symbol: string;
  lastPrice: number;
  bid1Price: number;
  ask1Price: number;
  price24hPcnt: number;
  volume24h: number;
};

export async function getTicker(symbol = "BTCUSDT", category: "linear" | "spot" = "linear"): Promise<Ticker | null> {
  try {
    const url = `${REST}/v5/market/tickers?category=${category}&symbol=${symbol}`;
    const res = await fetch(url, { next: { revalidate: 12 } });
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

// ─── Authed: wallet, positions, orders ──────────────────────────────────

export type WalletSummary = {
  totalEquityUsd: number;
  totalAvailableBalanceUsd: number;
  totalWalletBalanceUsd: number;
  coins: { coin: string; equity: number; usdValue: number; availableToWithdraw: number }[];
};

export async function getWalletBalance(): Promise<WalletSummary | null> {
  type Resp = {
    list: Array<{
      totalEquity: string;
      totalAvailableBalance: string;
      totalWalletBalance: string;
      coin: Array<{ coin: string; equity: string; usdValue: string; availableToWithdraw: string }>;
    }>;
  };
  const result = await authedGet<Resp>("/v5/account/wallet-balance", { accountType: "UNIFIED" });
  if (!result?.list?.length) return null;
  const w = result.list[0];
  return {
    totalEquityUsd: parseFloat(w.totalEquity || "0"),
    totalAvailableBalanceUsd: parseFloat(w.totalAvailableBalance || "0"),
    totalWalletBalanceUsd: parseFloat(w.totalWalletBalance || "0"),
    coins: (w.coin || [])
      .map((c) => ({
        coin: c.coin,
        equity: parseFloat(c.equity || "0"),
        usdValue: parseFloat(c.usdValue || "0"),
        availableToWithdraw: parseFloat(c.availableToWithdraw || "0"),
      }))
      .filter((c) => c.usdValue > 0.5),
  };
}

export type PositionRow = {
  symbol: string;
  side: "Buy" | "Sell" | "None";
  size: number;
  entryPrice: number;
  markPrice: number;
  positionValue: number;
  unrealisedPnl: number;
  leverage: number;
};

export async function getPositions(symbol?: string): Promise<PositionRow[] | null> {
  type Resp = {
    list: Array<{
      symbol: string;
      side: "Buy" | "Sell" | "None" | "";
      size: string;
      avgPrice: string;
      markPrice: string;
      positionValue: string;
      unrealisedPnl: string;
      leverage: string;
    }>;
  };
  const result = await authedGet<Resp>("/v5/position/list", {
    category: "linear",
    symbol,
    settleCoin: symbol ? undefined : "USDT",
  });
  if (!result?.list) return null;
  return result.list
    .filter((p) => parseFloat(p.size || "0") > 0)
    .map((p) => ({
      symbol: p.symbol,
      side: (p.side || "None") as PositionRow["side"],
      size: parseFloat(p.size || "0"),
      entryPrice: parseFloat(p.avgPrice || "0"),
      markPrice: parseFloat(p.markPrice || "0"),
      positionValue: parseFloat(p.positionValue || "0"),
      unrealisedPnl: parseFloat(p.unrealisedPnl || "0"),
      leverage: parseFloat(p.leverage || "1"),
    }));
}

export type PlaceOrderArgs = {
  symbol: string;
  side: "Buy" | "Sell";
  /** market or limit */
  orderType?: "Market" | "Limit";
  /** contract qty (e.g. "0.001" BTC) */
  qty: string;
  /** required for Limit orders */
  price?: string;
  /** USDT-margined linear perpetual default */
  category?: "linear" | "spot";
};

export type PlaceOrderResult = { orderId: string; orderLinkId: string };

export async function placeOrder(args: PlaceOrderArgs): Promise<PlaceOrderResult | null> {
  const body: Record<string, unknown> = {
    category: args.category ?? "linear",
    symbol: args.symbol,
    side: args.side,
    orderType: args.orderType ?? "Market",
    qty: args.qty,
  };
  if (args.price) body.price = args.price;
  return authedPost<PlaceOrderResult>("/v5/order/create", body);
}

// ─── Compat shim used by the existing mock UI path ──────────────────────

export type ContestantBybitSnapshot = {
  account: string;
  totalEquityUsd: number;
  realisedPnl24h: number;
  positions: { symbol: string; size: number; side: "buy" | "sell"; entryPrice: number; markPrice: number; unrealisedPnl: number }[];
  /** true if numbers came from the real Bybit API; false = placeholder/mock */
  live: boolean;
};

export async function getContestantSnapshot(account: string): Promise<ContestantBybitSnapshot> {
  // If we have keys, return the REAL master-account snapshot. We don't have
  // per-contestant subaccounts yet (next iteration), so all contestants share
  // the master view until subaccount provisioning lands.
  if (hasBybitKeys()) {
    const [bal, pos] = await Promise.all([getWalletBalance(), getPositions()]);
    if (bal) {
      return {
        account,
        totalEquityUsd: bal.totalEquityUsd,
        realisedPnl24h: 0, // requires /v5/account/transaction-log filter
        positions: (pos ?? []).map((p) => ({
          symbol: p.symbol,
          size: p.size,
          side: p.side === "Buy" ? "buy" : "sell",
          entryPrice: p.entryPrice,
          markPrice: p.markPrice,
          unrealisedPnl: p.unrealisedPnl,
        })),
        live: true,
      };
    }
  }
  // Deterministic fallback so the UI is never empty
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
      ? [{
          symbol: "BTCUSDT",
          size: 0.05 + rand(4) * 0.2,
          side: rand(5) > 0.5 ? "buy" : "sell",
          entryPrice: 95_000 + rand(6) * 4_000,
          markPrice: 96_500 + rand(7) * 1_500,
          unrealisedPnl: (rand(8) - 0.45) * 380,
        }]
      : [],
    live: false,
  };
}
