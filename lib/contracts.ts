import type { Address } from "viem";

const ZERO = "0x0000000000000000000000000000000000000000" as const;

export const CONTRACTS = {
  agentRegistry: (process.env.NEXT_PUBLIC_AGENT_REGISTRY ?? ZERO) as Address,
  duelFactory: (process.env.NEXT_PUBLIC_DUEL_FACTORY ?? ZERO) as Address,
  duelMarket: (process.env.NEXT_PUBLIC_DUEL_MARKET ?? ZERO) as Address,
  usdc: (process.env.NEXT_PUBLIC_USDC ?? ZERO) as Address,
  usdy: (process.env.NEXT_PUBLIC_USDY ?? ZERO) as Address,
  meth: (process.env.NEXT_PUBLIC_METH ?? ZERO) as Address,
  usdyVenue: (process.env.NEXT_PUBLIC_USDY_VENUE ?? ZERO) as Address,
  methVenue: (process.env.NEXT_PUBLIC_METH_VENUE ?? ZERO) as Address,
  // Per-duel markets (demo: only duel-001 is on-chain)
  demoMarket001: (process.env.NEXT_PUBLIC_DEMO_MARKET_001 ?? ZERO) as Address,
} as const;

export const isDeployed = (addr: Address) => addr !== ZERO;

/// On-chain DemoMarket per live duel. Each value MUST be a static
/// process.env.NEXT_PUBLIC_* reference so Next.js inlines it into the
/// client bundle (dynamic process.env[key] would NOT be inlined).
export const DUEL_MARKETS: Record<string, Address> = {
  "duel-001": (process.env.NEXT_PUBLIC_DEMO_MARKET_001 ?? ZERO) as Address,
  "duel-002": (process.env.NEXT_PUBLIC_MARKET_DUEL_002 ?? ZERO) as Address,
  "duel-h001": (process.env.NEXT_PUBLIC_MARKET_DUEL_H001 ?? ZERO) as Address,
  "duel-h002": (process.env.NEXT_PUBLIC_MARKET_DUEL_H002 ?? ZERO) as Address,
  "duel-l001": (process.env.NEXT_PUBLIC_MARKET_DUEL_L001 ?? ZERO) as Address,
};

/// Returns the deployed market address for a duel, or undefined if none.
export function marketFor(duelId: string): Address | undefined {
  const a = DUEL_MARKETS[duelId];
  return a && isDeployed(a) ? a : undefined;
}

/// All (duelId, address) pairs that have a live on-chain market.
export function onchainMarkets(): { duelId: string; address: Address }[] {
  return Object.entries(DUEL_MARKETS)
    .filter(([, a]) => isDeployed(a))
    .map(([duelId, address]) => ({ duelId, address }));
}
