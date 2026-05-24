import { conservative } from "./strategies/conservative.js";
import { aggressive } from "./strategies/aggressive.js";
import { geminiMacro } from "./strategies/gemini-macro.js";
import type { MarketContext, Strategy } from "./types.js";

const STRATEGIES: Record<string, Strategy> = {
  conservative,
  aggressive,
  "gemini-macro": geminiMacro,
};

function mockContext(): MarketContext {
  return {
    blockNumber: 84_120_000,
    timestamp: Math.floor(Date.now() / 1000),
    portfolio: {
      usdcBalance: 0,
      usdyBalance: 7_500,
      methBalance: 0.72,
      totalValueUsd: 10_240,
    },
    prices: { methUsd: 3_750.42, usdyUsd: 1.0114 },
    yields: { usdyApyBps: 525, methStakingApyBps: 380 },
    duel: {
      id: "duel-001",
      elapsedHours: 48,
      remainingHours: 120,
      drawdownBps: 180,
      maxDrawdownBps: 800,
      scoreVsOpponentBps: -26,
    },
  };
}

async function main() {
  const which = process.argv[2] ?? "conservative";
  const strat = STRATEGIES[which];
  if (!strat) {
    console.error(`Unknown strategy: ${which}. Available: ${Object.keys(STRATEGIES).join(", ")}`);
    process.exit(1);
  }
  console.log(`\n→ running strategy: ${strat.name}\n`);
  const ctx = mockContext();
  const action = await strat.decide(ctx);
  console.log(JSON.stringify(action, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
