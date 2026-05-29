/// Bridges the static contestant roster (lib/mock-data.ts) with the live
/// whale engine (lib/whale-engine.ts). For human contestants whose IDs
/// match a whale persona, returns the live-market-driven snapshot. For
/// AI agents (and unknown ids), returns null so callers can fall back to
/// the static mock numbers.

import { refreshWhaleEngine, readWhaleSnapshot, type WhaleState } from "./whale-engine";
import { getAgent, type Agent } from "./mock-data";

/// Every contestant in our static roster now maps to a whale persona -
/// agents and humans alike. The two pools share the same engine but
/// keep distinct kind metadata so the UI can label/color them.
const CONTESTANT_TO_WHALE: Record<string, string> = {
  // humans
  "human-adrian": "whale-adrian",
  "human-mei": "whale-mei",
  "human-kojo": "whale-kojo",
  "human-lina": "whale-lina",
  // agents
  "agent-prudence": "whale-prudence",
  "agent-volt": "whale-volt",
  "agent-orbit": "whale-orbit",
  "agent-helix": "whale-helix",
  "agent-bishop": "whale-bishop",
  "agent-cipher": "whale-cipher",
};

/// Server-side: triggers a fresh fetch from Bybit, then maps the contestant
/// id to the matching whale. Cached by the engine so concurrent calls
/// dedupe in practice.
export async function getLiveStats(contestantId: string): Promise<WhaleState | null> {
  const whaleId = CONTESTANT_TO_WHALE[contestantId];
  if (!whaleId) return null;
  const snap = await refreshWhaleEngine();
  return snap.whales.find((w) => w.id === whaleId) ?? null;
}

/// Cheap synchronous read of whatever the engine has cached. Use this in
/// hot loops (duel-score computation) where you don't want to hit Bybit
/// on every call.
export function readLiveStats(contestantId: string): WhaleState | null {
  const whaleId = CONTESTANT_TO_WHALE[contestantId];
  if (!whaleId) return null;
  const snap = readWhaleSnapshot();
  return snap.whales.find((w) => w.id === whaleId) ?? null;
}

/// Returns an overlay object you can spread onto a static Agent to get
/// the live PnL / win-rate / TVL numbers. Falls back to mock if the
/// contestant isn't whale-backed.
export function liveOverlay(agent: Agent | undefined): Partial<Agent> | null {
  if (!agent) return null;
  const w = readLiveStats(agent.id);
  if (!w) return null;
  // Map whale PnL pct to a believable APY-style number (whale window is
  // 24h, scale to annualised).
  const annualisedApy = w.pnlPct * 365;
  return {
    apy7d: annualisedApy,
    apy30d: annualisedApy * 0.6,
    tvl: Math.max(0, agent.tvl + w.totalPnl),
    totalDuels: agent.totalDuels + Math.floor(w.trades / 4),
  };
}

/// For a duel, computes the LIVE score for each side using whale PnL
/// when available, falling back to the static mock score otherwise.
/// Returns the scaled scores (% returns) ready to display.
export function liveDuelScores(
  agentAId: string,
  agentBId: string,
  fallbackA: number,
  fallbackB: number,
): { scoreA: number; scoreB: number; livePoweredA: boolean; livePoweredB: boolean } {
  const a = readLiveStats(agentAId);
  const b = readLiveStats(agentBId);
  // Whale pnlPct is already a percentage in our schema (e.g. 0.42 = 0.42%)
  // The mock scoreA / scoreB are absolute % returns (e.g. 0.41 = 0.41%).
  // We keep both in the same scale.
  return {
    scoreA: a ? a.pnlPct : fallbackA,
    scoreB: b ? b.pnlPct : fallbackB,
    livePoweredA: !!a,
    livePoweredB: !!b,
  };
}

/// Resolve current contestant info including a live snapshot if available.
export function getContestantSnapshot(id: string): { agent: Agent | undefined; live: WhaleState | null } {
  const agent = getAgent(id);
  return { agent, live: agent ? readLiveStats(id) : null };
}
