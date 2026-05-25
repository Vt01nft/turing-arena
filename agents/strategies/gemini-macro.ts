import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import type { Strategy } from "../types.js";
import { Action } from "../types.js";

/// Orbit-style: defers full allocation decision to a Gemini model with a structured
/// output schema. Demonstrates LLM-in-the-loop autonomy.
export const geminiMacro: Strategy = {
  name: "gemini-macro",
  async decide(ctx) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return {
        kind: "hold",
        rationale: "GOOGLE_GENERATIVE_AI_API_KEY missing - holding for safety",
      };
    }

    const { object } = await generateObject({
      model: google("gemini-2.5-pro"),
      schema: Action,
      system: `You are a disciplined macro-driven yield strategist on the Mantle network.
You allocate between USDY (Ondo's yield-bearing USD) and mETH (Mantle's liquid staked ETH).
You MUST respect a hard ${ctx.duel.maxDrawdownBps / 100}% max drawdown cutoff.
Be decisive: explicitly choose hold, rebalance, or claim. Keep rationale under 140 chars.`,
      prompt: `Context:
- elapsed: ${ctx.duel.elapsedHours}h / remaining: ${ctx.duel.remainingHours}h
- portfolio: $${ctx.portfolio.totalValueUsd.toFixed(2)} (USDC: ${ctx.portfolio.usdcBalance.toFixed(2)}, USDY: ${ctx.portfolio.usdyBalance.toFixed(2)}, mETH: ${ctx.portfolio.methBalance.toFixed(4)})
- prices: mETH=$${ctx.prices.methUsd.toFixed(2)}, USDY=$${ctx.prices.usdyUsd.toFixed(4)}
- yields: USDY ${ctx.yields.usdyApyBps / 100}% APY, mETH staking ${ctx.yields.methStakingApyBps / 100}% APY
- current drawdown: ${ctx.duel.drawdownBps / 100}%  (limit ${ctx.duel.maxDrawdownBps / 100}%)
- score vs opponent: ${(ctx.duel.scoreVsOpponentBps / 100).toFixed(2)}%

Choose the best next action.`,
    });

    return object;
  },
};
