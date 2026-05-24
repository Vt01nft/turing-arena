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
} as const;

export const isDeployed = (addr: Address) => addr !== ZERO;
