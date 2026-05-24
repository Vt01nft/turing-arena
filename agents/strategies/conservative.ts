import type { Strategy } from "../types.js";

/// Prudence-style: stays heavy in USDY unless mETH staking dominates clearly.
export const conservative: Strategy = {
  name: "conservative",
  async decide(ctx) {
    const { usdyApyBps, methStakingApyBps } = ctx.yields;
    const drawdownNearLimit = ctx.duel.drawdownBps > ctx.duel.maxDrawdownBps * 0.6;
    if (drawdownNearLimit) {
      return {
        kind: "rebalance",
        targetUsdyPct: 95,
        targetMethPct: 5,
        rationale: "drawdown approaching limit — flight to USDY",
      };
    }
    if (methStakingApyBps - usdyApyBps > 200) {
      return {
        kind: "rebalance",
        targetUsdyPct: 70,
        targetMethPct: 30,
        rationale: "mETH yield premium > 200bps — modest rotation",
      };
    }
    return {
      kind: "rebalance",
      targetUsdyPct: 85,
      targetMethPct: 15,
      rationale: "stable yield + small mETH exposure for upside",
    };
  },
};
