import { z } from "zod";

export const MarketContext = z.object({
  blockNumber: z.number(),
  timestamp: z.number(),
  portfolio: z.object({
    usdcBalance: z.number(),
    usdyBalance: z.number(),
    methBalance: z.number(),
    totalValueUsd: z.number(),
  }),
  prices: z.object({
    methUsd: z.number(),
    usdyUsd: z.number(),
  }),
  yields: z.object({
    usdyApyBps: z.number(),
    methStakingApyBps: z.number(),
  }),
  duel: z.object({
    id: z.string(),
    elapsedHours: z.number(),
    remainingHours: z.number(),
    drawdownBps: z.number(),
    maxDrawdownBps: z.number(),
    scoreVsOpponentBps: z.number(),
  }),
});
export type MarketContext = z.infer<typeof MarketContext>;

export const Action = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("hold"), rationale: z.string() }),
  z.object({
    kind: z.literal("rebalance"),
    targetUsdyPct: z.number().min(0).max(100),
    targetMethPct: z.number().min(0).max(100),
    rationale: z.string(),
  }),
  z.object({
    kind: z.literal("claim"),
    venue: z.enum(["usdy", "meth"]),
    rationale: z.string(),
  }),
]);
export type Action = z.infer<typeof Action>;

export type Strategy = {
  name: string;
  decide: (ctx: MarketContext) => Promise<Action>;
};
