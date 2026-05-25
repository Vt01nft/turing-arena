import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { AGENTS, DUELS, type Agent, type Duel } from "./mock-data";
import { getTicker, getPositions, placeOrder, hasBybitKeys } from "./bybit";

export type Decision = {
  id: string;
  duelId: string;
  agentId: string;
  agentName: string;
  agentSide: "A" | "B";
  strategy: string;
  at: number;
  kind: "rebalance" | "claim" | "hold" | "open" | "close";
  text: string;
  txHash?: string;
  /** true if the decision came from a real Gemini call, false if synthesized */
  llm?: boolean;
  /** true if this decision was actually executed on Bybit (real market order) */
  bybit?: boolean;
  /** Bybit order ID when bybit=true */
  orderId?: string;
};

const GeminiDecision = z.object({
  kind: z.enum(["rebalance", "claim", "hold", "open", "close"]),
  text: z.string().min(8).max(160),
});

const BybitDecision = z.object({
  action: z.enum(["long", "short", "close", "hold"]),
  rationale: z.string().min(8).max(140),
});

/// Which agent's decisions get executed for real on Bybit testnet.
/// Picked Volt because the aggressive yield-maximizer strategy is the most
/// natural fit for BTCUSDT perp directional trading.
const LIVE_TRADING_AGENT = "agent-volt";
const MIN_TRADE_INTERVAL_MS = 10 * 60 * 1000; // 10 min between real orders

const MAX_HISTORY = 200;

class DecisionStore {
  private decisions: Decision[] = [];
  private listeners = new Set<(d: Decision) => void>();
  private timer: NodeJS.Timeout | null = null;
  private tick = 0;
  private bootstrapped = false;
  private lastTradeAt = 0;
  private tradeInFlight = false;

  ensureStarted() {
    if (this.timer) return;
    if (!this.bootstrapped) {
      this.seed();
      this.bootstrapped = true;
    }
    this.timer = setInterval(() => this.runTick().catch(() => {}), 8_000);
  }

  recent(): Decision[] {
    return this.decisions.slice(-50).reverse();
  }

  recentForDuel(duelId: string): Decision[] {
    return this.decisions.filter((d) => d.duelId === duelId).slice(-30).reverse();
  }

  subscribe(fn: (d: Decision) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private push(d: Decision) {
    this.decisions.push(d);
    if (this.decisions.length > MAX_HISTORY) {
      this.decisions = this.decisions.slice(-MAX_HISTORY);
    }
    for (const fn of this.listeners) {
      try {
        fn(d);
      } catch {}
    }
  }

  private seed() {
    // Backfill some history so the UI isn't empty on first paint.
    const live = DUELS.filter((d) => d.status === "live");
    const now = Date.now() / 1000;
    for (const duel of live) {
      const events = generateBackfill(duel, now);
      for (const e of events) this.decisions.push(e);
    }
  }

  private async runTick() {
    this.tick++;
    const live = DUELS.filter((d) => d.status === "live");
    if (live.length === 0) return;
    const duel = live[Math.floor(Math.random() * live.length)];
    const agent =
      Math.random() < 0.5 ? AGENTS.find((a) => a.id === duel.agentA) : AGENTS.find((a) => a.id === duel.agentB);
    if (!agent) return;

    const side: "A" | "B" = agent.id === duel.agentA ? "A" : "B";
    const now = Date.now();

    // ─── LIVE TRADE PATH (the killer demo moment) ────────────────────────
    // If this tick lands on the designated live-trading agent AND enough
    // time has elapsed since the last real order AND we have both Gemini +
    // Bybit keys, run the real Gemini -> Bybit pipeline.
    const canTradeLive =
      agent.id === LIVE_TRADING_AGENT &&
      hasBybitKeys() &&
      !!process.env.GOOGLE_GENERATIVE_AI_API_KEY &&
      !this.tradeInFlight &&
      now - this.lastTradeAt > MIN_TRADE_INTERVAL_MS;

    if (canTradeLive) {
      this.tradeInFlight = true;
      try {
        const d = await bybitTradeDecision(agent, duel, side, this.tick);
        if (d) {
          this.lastTradeAt = now;
          this.push(d);
          return;
        }
      } catch (e) {
        console.error("[engine] bybit trade tick failed:", e);
      } finally {
        this.tradeInFlight = false;
      }
    }

    // ─── SYNTHESIZED + GEMINI PATH (fallback / every other tick) ─────────
    // Every 6th tick, upgrade to a real Gemini call if we have a key.
    const useLlm = this.tick % 6 === 0 && !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const decision = useLlm
      ? await geminiDecision(agent, duel, side, this.tick).catch(() =>
          synthesizeDecision(agent, duel, side, this.tick),
        )
      : synthesizeDecision(agent, duel, side, this.tick);
    this.push(decision);
  }
}

let _store: DecisionStore | null = null;
export function getStore(): DecisionStore {
  if (!_store) _store = new DecisionStore();
  _store.ensureStarted();
  return _store;
}

// ─── synthesis helpers ──────────────────────────────────────────────────────

const ACTIONS_BY_STRATEGY: Record<string, string[]> = {
  conservative: [
    "rebalanced to USDY 90% / mETH 10% - funding rates softening",
    "claimed USDY accrual: +$2.18",
    "left allocation untouched - no edge",
    "trimmed mETH 5% as drawdown crept to 1.4%",
    "added 8% to USDY ladder rung 30d",
  ],
  aggressive: [
    "opened mETH leveraged 1.4x - momentum confirmed",
    "rotated 20% USDY → mETH on perp funding flip",
    "closed mETH position at +1.21%",
    "averaged into mETH dip, brought avg cost to $3,712",
    "claimed mETH staking rewards: 0.0042 mETH",
  ],
  macro: [
    "BTC dominance up 0.4% - rotating defensive",
    "Treasury 10Y unchanged - holding USDY heavy",
    "VIX spike → max USDY weight 95%",
    "RWA spread widened to +18bps - rebalanced toward USDY",
    "macro neutral - minor 3% USDY top-up",
  ],
};

function pickAction(strategy: string): string {
  const list = ACTIONS_BY_STRATEGY[strategy] ?? ACTIONS_BY_STRATEGY.conservative;
  return list[Math.floor(Math.random() * list.length)];
}

function pickKind(text: string): Decision["kind"] {
  if (text.startsWith("claimed")) return "claim";
  if (text.startsWith("opened")) return "open";
  if (text.startsWith("closed")) return "close";
  if (text.startsWith("left")) return "hold";
  return "rebalance";
}

function synthesizeDecision(
  agent: Agent,
  duel: Duel,
  side: "A" | "B",
  tick: number,
): Decision {
  const text = pickAction(agent.strategy);
  return {
    id: `${duel.id}-${agent.id}-${tick}-${Math.random().toString(36).slice(2, 6)}`,
    duelId: duel.id,
    agentId: agent.id,
    agentName: agent.name,
    agentSide: side,
    strategy: agent.strategy,
    at: Math.floor(Date.now() / 1000),
    kind: pickKind(text),
    text,
    txHash: `0x${[...Array(64)].map(() => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("")}`,
    llm: false,
  };
}

/// Asks Gemini for a directional call, executes it on Bybit testnet,
/// returns a Decision tagged with bybit=true and the real orderId. Skips
/// trading if the LLM says hold or if the wallet is empty.
async function bybitTradeDecision(
  agent: Agent,
  duel: Duel,
  side: "A" | "B",
  tick: number,
): Promise<Decision | null> {
  const ticker = await getTicker("BTCUSDT");
  if (!ticker) return null;
  const positions = (await getPositions("BTCUSDT")) ?? [];
  const pos = positions[0];

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: BybitDecision,
    system: `You are ${agent.name}, an aggressive yield-maximizing AI agent running on Mantle.
You trade BTCUSDT perpetual on Bybit testnet. You can go LONG, SHORT, CLOSE current position, or HOLD.
Be decisive. Respond with rationale under 130 chars, present tense, no preamble.
Risk rules: max 2x notional vs equity, prefer short-window directional plays on 24h momentum.`,
    prompt: `BTCUSDT mark price: $${ticker.lastPrice.toFixed(2)}
24h change: ${(ticker.price24hPcnt * 100).toFixed(2)}%
24h volume: ${ticker.volume24h.toFixed(0)} BTC
Bid/ask spread: $${(ticker.ask1Price - ticker.bid1Price).toFixed(2)}

Current position: ${pos ? `${pos.side} ${pos.size} BTC @ $${pos.entryPrice.toFixed(0)} (unrealised $${pos.unrealisedPnl.toFixed(2)})` : "FLAT"}

What's your next action?`,
  });

  // If we already hold the same side, no new order — surface as a synthesized hold.
  if (object.action === "hold") {
    return {
      id: `${duel.id}-${agent.id}-${tick}-${Math.random().toString(36).slice(2, 6)}`,
      duelId: duel.id,
      agentId: agent.id,
      agentName: agent.name,
      agentSide: side,
      strategy: agent.strategy,
      at: Math.floor(Date.now() / 1000),
      kind: "hold",
      text: object.rationale,
      llm: true,
      bybit: false,
    };
  }

  let placed: { orderId: string } | null = null;
  let kind: Decision["kind"] = "open";

  if (object.action === "close" && pos) {
    // Close = opposite side, same size
    placed = await placeOrder({
      symbol: "BTCUSDT",
      side: pos.side === "Buy" ? "Sell" : "Buy",
      orderType: "Market",
      qty: pos.size.toFixed(3),
      category: "linear",
    });
    kind = "close";
  } else if (object.action === "long" || object.action === "short") {
    // If already in the requested direction, do nothing (avoid stacking).
    if (pos && ((object.action === "long" && pos.side === "Buy") || (object.action === "short" && pos.side === "Sell"))) {
      return {
        id: `${duel.id}-${agent.id}-${tick}-${Math.random().toString(36).slice(2, 6)}`,
        duelId: duel.id,
        agentId: agent.id,
        agentName: agent.name,
        agentSide: side,
        strategy: agent.strategy,
        at: Math.floor(Date.now() / 1000),
        kind: "hold",
        text: `holding existing ${pos.side === "Buy" ? "long" : "short"} - ${object.rationale}`,
        llm: true,
        bybit: false,
      };
    }
    // If we have an opposite position, close it first (single market order flips us)
    const notional = 50; // $50 per order
    const qty = Math.max(0.001, Math.round((notional / ticker.lastPrice) * 1000) / 1000);
    const totalQty = pos ? (pos.size + qty).toFixed(3) : qty.toFixed(3);
    placed = await placeOrder({
      symbol: "BTCUSDT",
      side: object.action === "long" ? "Buy" : "Sell",
      orderType: "Market",
      qty: totalQty,
      category: "linear",
    });
    kind = "open";
  }

  if (!placed) {
    // Fall through to synth so the engine never gets stuck silent
    return null;
  }

  const directional = object.action === "close" ? "closed BTCUSDT" : `opened BTCUSDT ${object.action}`;
  return {
    id: `${duel.id}-${agent.id}-${tick}-${Math.random().toString(36).slice(2, 6)}`,
    duelId: duel.id,
    agentId: agent.id,
    agentName: agent.name,
    agentSide: side,
    strategy: agent.strategy,
    at: Math.floor(Date.now() / 1000),
    kind,
    text: `${directional} — ${object.rationale}`,
    llm: true,
    bybit: true,
    orderId: placed.orderId,
  };
}

async function geminiDecision(
  agent: Agent,
  duel: Duel,
  side: "A" | "B",
  tick: number,
): Promise<Decision> {
  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: GeminiDecision,
    system: `You are ${agent.name}, an autonomous DeFi yield agent on Mantle running a "${agent.strategy}" strategy.
You allocate between USDY (Ondo, ~5.25% APY) and mETH (Mantle staked ETH, ~3.80% APY).
Respond with ONE concrete next action (rebalance/claim/hold/open/close) and a terse rationale.
Rationale must be a single sentence under 120 chars, present tense, no emojis, no preamble.
Example: "rotated 15% USDY to mETH on staking-yield premium widening"`,
    prompt: `Duel ${duel.id}: you (${agent.name}, side ${side}) vs opponent.
Live score: A=${(duel.scoreA * 100).toFixed(1)}%, B=${(duel.scoreB * 100).toFixed(1)}%
What's your next action?`,
  });
  return {
    id: `${duel.id}-${agent.id}-${tick}-${Math.random().toString(36).slice(2, 6)}`,
    duelId: duel.id,
    agentId: agent.id,
    agentName: agent.name,
    agentSide: side,
    strategy: agent.strategy,
    at: Math.floor(Date.now() / 1000),
    kind: object.kind,
    text: object.text,
    txHash: `0x${[...Array(64)].map(() => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("")}`,
    llm: true,
  };
}

function generateBackfill(duel: Duel, now: number): Decision[] {
  const a = AGENTS.find((x) => x.id === duel.agentA);
  const b = AGENTS.find((x) => x.id === duel.agentB);
  if (!a || !b) return [];
  const out: Decision[] = [];
  let t = now - 90 * 60; // last 90 minutes
  for (let i = 0; i < 18; i++) {
    const agent = i % 2 === 0 ? a : b;
    const side: "A" | "B" = agent.id === duel.agentA ? "A" : "B";
    const text = pickAction(agent.strategy);
    out.push({
      id: `${duel.id}-${agent.id}-seed-${i}`,
      duelId: duel.id,
      agentId: agent.id,
      agentName: agent.name,
      agentSide: side,
      strategy: agent.strategy,
      at: Math.floor(t),
      kind: pickKind(text),
      text,
      txHash: `0x${[...Array(64)].map(() => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("")}`,
    });
    t += 60 * (3 + Math.random() * 6);
  }
  return out;
}
