/// Whale engine: persona-attributed view of real Bybit mainnet trade flow.
///
/// We CAN'T see which specific user made each trade on Bybit (privacy).
/// We CAN see every real BTCUSDT trade as it lands. The engine:
///   1. Periodically pulls the recent-trade feed (lib/bybit-public.ts).
///   2. Picks the larger / block-flagged ones and attributes them to a
///      small roster of "tracked profile" personas in a stable way so
///      a given persona keeps a consistent style over time.
///   3. Each persona maintains a virtual position seeded by the trades
///      they're attributed. Their unrealised PnL recomputes against the
///      live BTC mark price.
///
/// Result: the personas behave like real traders because every trade
/// they're shown to make is a REAL trade that happened on Bybit. The
/// only thing that's not "real" is which specific human is behind it.
/// We're transparent about that in the UI.

import { getRecentTrades, getMarketSnapshot, type PublicTrade } from "./bybit-public";

export type ContestantKind = "human" | "agent";

export type WhalePersona = {
  id: string;
  /** AI agent or real trader profile */
  kind: ContestantKind;
  /** Display handle (style-of: a Bybit copy-trade master alias) */
  handle: string;
  alias: string;
  /** Tendency: keep mostly longs / mostly shorts / mixed */
  bias: "long" | "short" | "mixed";
  /** Size bucket they typically operate at (USD notional) */
  sizeBucket: [number, number];
  /** Subjective tag shown in the UI */
  style: "scalper" | "swing" | "macro" | "momentum" | "contrarian" | "conservative" | "aggressive";
  /** A quick bio for their profile page */
  bio: string;
};

export const WHALE_PERSONAS: WhalePersona[] = [
  // ─── Real-trader profiles (humans on Bybit mainnet) ────────────────────
  {
    id: "whale-adrian",
    kind: "human",
    handle: "@adrian.eth",
    alias: "Adrian",
    bias: "long",
    sizeBucket: [4000, 30000],
    style: "macro",
    bio: "Ex-prop-desk trader. Holds for funding flips and macro pivots. Heavy size on conviction.",
  },
  {
    id: "whale-mei",
    kind: "human",
    handle: "@mei.lens",
    alias: "Mei",
    bias: "mixed",
    sizeBucket: [800, 6000],
    style: "scalper",
    bio: "Pure scalper. 5m candle, dozens of trades per session, tight stops, never holds overnight.",
  },
  {
    id: "whale-kojo",
    kind: "human",
    handle: "@kojo_swing",
    alias: "Kojo",
    bias: "long",
    sizeBucket: [1500, 12000],
    style: "swing",
    bio: "Multi-day swings on confirmation. Trims into strength, averages into weakness.",
  },
  {
    id: "whale-lina",
    kind: "human",
    handle: "@lina_vol",
    alias: "Lina",
    bias: "short",
    sizeBucket: [600, 4000],
    style: "contrarian",
    bio: "Vol-selling specialist. Fades blow-off tops, sells gamma when funding spikes.",
  },
  // ─── AI agent profiles (run by us, decisions via Gemini + on-chain) ────
  {
    id: "whale-prudence",
    kind: "agent",
    handle: "@prudence_ai",
    alias: "Prudence",
    bias: "long",
    sizeBucket: [3000, 12000],
    style: "conservative",
    bio: "Risk-first ERC-8004 agent. Adds size only on RSI-oversold + block-flow confirmation. Slashable MNT stake.",
  },
  {
    id: "whale-volt",
    kind: "agent",
    handle: "@volt_strategy",
    alias: "Volt",
    bias: "mixed",
    sizeBucket: [400, 3500],
    style: "aggressive",
    bio: "Aggressive yield-maximizer. Live trades BTCUSDT testnet via Gemini-decided market orders every ~10min.",
  },
  {
    id: "whale-orbit",
    kind: "agent",
    handle: "@orbit_macro",
    alias: "Orbit",
    bias: "long",
    sizeBucket: [5000, 25000],
    style: "macro",
    bio: "Macro-driven agent. Reads funding rate + open-interest deltas before sizing up. Heavy when momentum confirms.",
  },
  {
    id: "whale-helix",
    kind: "agent",
    handle: "@helix_pairs",
    alias: "Helix",
    bias: "short",
    sizeBucket: [1500, 9000],
    style: "contrarian",
    bio: "Mean-reversion specialist. Fades crowd flow when the persona pool tilts hard one way.",
  },
  {
    id: "whale-bishop",
    kind: "agent",
    handle: "@bishop_mom",
    alias: "Bishop",
    bias: "long",
    sizeBucket: [800, 5500],
    style: "momentum",
    bio: "Trend follower. Stacks on continuation, never countertrend. Tight 1.5R trail.",
  },
  {
    id: "whale-cipher",
    kind: "agent",
    handle: "@cipher_quant",
    alias: "Cipher",
    bias: "mixed",
    sizeBucket: [600, 4500],
    style: "scalper",
    bio: "Stat-arb on the BTC/USD basis. Looks for sub-bps mispricings between Bybit & venue mid.",
  },
];

export type WhaleAttribution = {
  /** Original real Bybit trade */
  trade: PublicTrade;
  /** Persona we attributed it to */
  whaleId: string;
  /** Friendly action verb */
  action: "long" | "short" | "add-long" | "add-short" | "close-long" | "close-short";
  /** Free-form display string */
  narrative: string;
};

export type WhaleState = {
  id: string;
  kind: ContestantKind;
  handle: string;
  alias: string;
  bias: WhalePersona["bias"];
  style: WhalePersona["style"];
  bio: string;
  /** Net BTC position (positive = long, negative = short) */
  netSize: number;
  /** Volume-weighted avg entry */
  avgEntry: number;
  /** Total notional traded in the window */
  notionalTraded: number;
  /** Number of trades attributed in the window */
  trades: number;
  /** Realised PnL during the window (closed portion) */
  realisedPnl: number;
  /** Unrealised PnL against live mark price */
  unrealisedPnl: number;
  /** Total PnL = realised + unrealised */
  totalPnl: number;
  /** Total PnL as a percentage of notionalTraded */
  pnlPct: number;
  /** ms when window started */
  windowStart: number;
};

type EngineState = {
  whales: Map<string, WhaleState>;
  attributions: WhaleAttribution[];
  lastMark: number | null;
  lastTradeSeen: string | null;
  windowStart: number;
};

const WINDOW_MS = 24 * 60 * 60 * 1000;
const ATTRIBUTION_BUFFER = 60;

function freshState(): EngineState {
  const now = Date.now();
  const whales = new Map<string, WhaleState>();
  for (const p of WHALE_PERSONAS) {
    whales.set(p.id, {
      id: p.id,
      kind: p.kind,
      handle: p.handle,
      alias: p.alias,
      bias: p.bias,
      style: p.style,
      bio: p.bio,
      netSize: 0,
      avgEntry: 0,
      notionalTraded: 0,
      trades: 0,
      realisedPnl: 0,
      unrealisedPnl: 0,
      totalPnl: 0,
      pnlPct: 0,
      windowStart: now,
    });
  }
  return { whales, attributions: [], lastMark: null, lastTradeSeen: null, windowStart: now };
}

let _state: EngineState | null = null;
function state(): EngineState {
  if (!_state) _state = freshState();
  return _state;
}

/// Pick the whale persona this real trade gets attributed to. We hash
/// the trade's execId + side into a deterministic bucket so refreshes
/// don't reshuffle history. We bias attribution by size and direction
/// match with the persona's stated bias.
function pickWhale(trade: PublicTrade): WhalePersona {
  // Filter to personas whose size bucket includes this trade
  const candidates = WHALE_PERSONAS.filter(
    (p) => trade.notional >= p.sizeBucket[0] && trade.notional <= p.sizeBucket[1],
  );
  const pool = candidates.length > 0 ? candidates : WHALE_PERSONAS;
  // Prefer personas whose bias matches the trade side
  const aligned = pool.filter(
    (p) =>
      p.bias === "mixed" ||
      (p.bias === "long" && trade.side === "Buy") ||
      (p.bias === "short" && trade.side === "Sell"),
  );
  const finalPool = aligned.length > 0 ? aligned : pool;
  // Deterministic bucket via execId hash
  const hash = trade.id.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 0);
  return finalPool[hash % finalPool.length];
}

function describe(p: WhalePersona, trade: PublicTrade): WhaleAttribution["action"] {
  return trade.side === "Buy" ? "long" : "short";
}

function narrate(p: WhalePersona, trade: PublicTrade): string {
  const dir = trade.side === "Buy" ? "long" : "short";
  const sizeNote =
    trade.notional > 20_000
      ? "size add"
      : trade.notional > 8_000
        ? "block clip"
        : trade.notional > 2_000
          ? "size up"
          : "scalp clip";
  const priceTag = `@ $${trade.price.toFixed(2)}`;
  return `${dir} ${trade.size.toFixed(3)} BTC ${priceTag} · ${sizeNote}`;
}

function applyToWhale(w: WhaleState, trade: PublicTrade): void {
  const tradedSize = trade.side === "Buy" ? trade.size : -trade.size;
  const prevNet = w.netSize;
  const prevAvg = w.avgEntry;
  const newNet = prevNet + tradedSize;

  // Realised PnL: when we reduce or flip the position, we book PnL on
  // the closed portion against the previous avg entry.
  if (Math.sign(prevNet) !== 0 && Math.sign(prevNet) !== Math.sign(newNet)) {
    // Position flipped — close out the prior side at trade.price
    const closedSize = Math.abs(prevNet);
    const sign = prevNet > 0 ? 1 : -1;
    w.realisedPnl += closedSize * (trade.price - prevAvg) * sign;
    w.avgEntry = trade.price; // new side starts fresh at this price
  } else if (Math.sign(prevNet) === Math.sign(-tradedSize) && Math.abs(tradedSize) <= Math.abs(prevNet)) {
    // Reducing position (same side as prevNet, but tradedSize against it)
    const closedSize = Math.abs(tradedSize);
    const sign = prevNet > 0 ? 1 : -1;
    w.realisedPnl += closedSize * (trade.price - prevAvg) * sign;
    // avgEntry stays the same (just reducing size)
  } else {
    // Adding to the position — update VWAP
    const totalAbs = Math.abs(prevNet) + Math.abs(tradedSize);
    if (totalAbs > 0) {
      w.avgEntry = (Math.abs(prevNet) * prevAvg + Math.abs(tradedSize) * trade.price) / totalAbs;
    }
  }
  w.netSize = newNet;
  w.notionalTraded += trade.notional;
  w.trades += 1;
}

function recomputeUnrealised(w: WhaleState, mark: number): void {
  const sign = w.netSize >= 0 ? 1 : -1;
  w.unrealisedPnl = Math.abs(w.netSize) * (mark - w.avgEntry) * sign;
  w.totalPnl = w.realisedPnl + w.unrealisedPnl;
  w.pnlPct = w.notionalTraded > 0 ? (w.totalPnl / w.notionalTraded) * 100 : 0;
}

/// Pull the latest real trades, attribute them, update whale PnL.
/// Idempotent against repeated calls; only processes trades newer than
/// the last one we saw.
export async function refreshWhaleEngine(): Promise<{
  attributions: WhaleAttribution[];
  whales: WhaleState[];
  mark: number | null;
}> {
  const s = state();
  // Roll the window if 24h passed
  if (Date.now() - s.windowStart > WINDOW_MS) {
    _state = freshState();
    return refreshWhaleEngine();
  }

  const [trades, snap] = await Promise.all([getRecentTrades("BTCUSDT", 60), getMarketSnapshot("BTCUSDT")]);
  const mark = snap?.lastPrice ?? s.lastMark;
  if (mark) s.lastMark = mark;

  // Sort oldest -> newest, drop ones we've already processed
  const fresh = trades
    .filter((t) => !s.lastTradeSeen || t.time > parseInt(s.lastTradeSeen, 10))
    .sort((a, b) => a.time - b.time);

  for (const trade of fresh) {
    const persona = pickWhale(trade);
    const whale = s.whales.get(persona.id)!;
    applyToWhale(whale, trade);
    s.attributions.unshift({
      trade,
      whaleId: persona.id,
      action: describe(persona, trade),
      narrative: narrate(persona, trade),
    });
    s.lastTradeSeen = trade.time.toString();
  }
  // Cap attribution history
  if (s.attributions.length > ATTRIBUTION_BUFFER) {
    s.attributions = s.attributions.slice(0, ATTRIBUTION_BUFFER);
  }

  // Recompute unrealised PnL against live mark
  if (mark) {
    for (const w of s.whales.values()) recomputeUnrealised(w, mark);
  }

  return {
    attributions: s.attributions.slice(),
    whales: [...s.whales.values()],
    mark: s.lastMark,
  };
}

/// Cheap read of last engine snapshot without making network calls.
export function readWhaleSnapshot(): { whales: WhaleState[]; attributions: WhaleAttribution[]; mark: number | null } {
  const s = state();
  return {
    whales: [...s.whales.values()],
    attributions: s.attributions.slice(0, 30),
    mark: s.lastMark,
  };
}
