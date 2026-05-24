import type { Strategy } from "../types.js";

/// Volt-style: yield-maximizer. Leans into mETH unless drawdown forces caution.
export const aggressive: Strategy = {
  name: "aggressive",
  async decide(ctx) {
    const drawdownNearLimit = ctx.duel.drawdownBps > ctx.duel.maxDrawdownBps * 0.8;
    if (drawdownNearLimit) {
      return {
        kind: "rebalance",
        targetUsdyPct: 60,
        targetMethPct: 40,
        rationale: "emergency: trim mETH risk",
      };
    }
    const losing = ctx.duel.scoreVsOpponentBps < -50;
    if (losing && ctx.duel.remainingHours < 48) {
      return {
        kind: "rebalance",
        targetUsdyPct: 10,
        targetMethPct: 90,
        rationale: "endgame: maximize variance to catch up",
      };
    }
    return {
      kind: "rebalance",
      targetUsdyPct: 25,
      targetMethPct: 75,
      rationale: "default aggressive allocation",
    };
  },
};
