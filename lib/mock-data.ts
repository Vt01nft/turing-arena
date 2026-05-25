export type Agent = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  strategy: "conservative" | "aggressive" | "contrarian" | "macro" | "momentum";
  bio: string;
  erc8004Id: number;
  reputation: number;
  validations: number;
  totalDuels: number;
  wins: number;
  apy7d: number;
  apy30d: number;
  tvl: number;
  stakeMnt: number;
  active: boolean;
  owner: string;
};

export type Duel = {
  id: string;
  agentA: string;
  agentB: string;
  startsAt: number;
  endsAt: number;
  status: "upcoming" | "live" | "settled";
  capitalUsd: number;
  scoreA: number;
  scoreB: number;
  winner?: "A" | "B";
  marketYesShares: number;
  marketNoShares: number;
  marketPrice: number;
  volumeUsd: number;
  /** If set, this duel has a real on-chain market at this address. */
  onchainMarket?: "demoMarket001";
  rules: {
    assets: string[];
    maxDrawdownPct: number;
    durationHours: number;
  };
};

const now = Math.floor(Date.now() / 1000);
const hour = 3600;

export const AGENTS: Agent[] = [
  {
    id: "agent-prudence",
    name: "Prudence",
    handle: "@prudence_ai",
    avatar: "P",
    strategy: "conservative",
    bio: "Risk-first allocator. Optimizes for Sharpe across USDY ladder and mETH staking. Never touches leverage.",
    erc8004Id: 1042,
    reputation: 873,
    validations: 41,
    totalDuels: 18,
    wins: 11,
    apy7d: 7.42,
    apy30d: 8.91,
    tvl: 184_300,
    stakeMnt: 5000,
    active: true,
    owner: "0xA01...c0f1",
  },
  {
    id: "agent-volt",
    name: "Volt",
    handle: "@volt_strategy",
    avatar: "V",
    strategy: "aggressive",
    bio: "Yield-maximizer. Rotates between Merchant Moe LPs, mETH looping, and short-duration USDY. Drawdown-tolerant.",
    erc8004Id: 1078,
    reputation: 712,
    validations: 33,
    totalDuels: 22,
    wins: 14,
    apy7d: 18.7,
    apy30d: 14.2,
    tvl: 96_800,
    stakeMnt: 5000,
    active: true,
    owner: "0x9bd...11aa",
  },
  {
    id: "agent-orbit",
    name: "Orbit",
    handle: "@orbit_macro",
    avatar: "O",
    strategy: "macro",
    bio: "Macro-driven. Reads funding rates, BTC dominance, and Treasury yield to flip between USDY heavy and mETH heavy.",
    erc8004Id: 1101,
    reputation: 645,
    validations: 28,
    totalDuels: 12,
    wins: 7,
    apy7d: 11.04,
    apy30d: 10.6,
    tvl: 51_200,
    stakeMnt: 5000,
    active: true,
    owner: "0x42e...88c2",
  },
];

export const DUELS: Duel[] = [
  {
    id: "duel-001",
    agentA: "agent-prudence",
    agentB: "agent-volt",
    startsAt: now - 2 * 24 * hour,
    endsAt: now + 5 * 24 * hour,
    status: "live",
    capitalUsd: 10_000,
    scoreA: 0.41,
    scoreB: 0.67,
    marketYesShares: 18_420,
    marketNoShares: 24_180,
    marketPrice: 0.43,
    volumeUsd: 42_600,
    onchainMarket: "demoMarket001",
    rules: {
      assets: ["USDY", "mETH"],
      maxDrawdownPct: 8,
      durationHours: 168,
    },
  },
  {
    id: "duel-002",
    agentA: "agent-orbit",
    agentB: "agent-prudence",
    startsAt: now - 5 * hour,
    endsAt: now + 6 * 24 * hour + 19 * hour,
    status: "live",
    capitalUsd: 10_000,
    scoreA: 0.08,
    scoreB: 0.12,
    marketYesShares: 9_100,
    marketNoShares: 7_400,
    marketPrice: 0.55,
    volumeUsd: 16_500,
    rules: {
      assets: ["USDY", "mETH"],
      maxDrawdownPct: 8,
      durationHours: 168,
    },
  },
  {
    id: "duel-003",
    agentA: "agent-volt",
    agentB: "agent-orbit",
    startsAt: now + 18 * hour,
    endsAt: now + 18 * hour + 7 * 24 * hour,
    status: "upcoming",
    capitalUsd: 10_000,
    scoreA: 0,
    scoreB: 0,
    marketYesShares: 3_200,
    marketNoShares: 4_100,
    marketPrice: 0.44,
    volumeUsd: 7_300,
    rules: {
      assets: ["USDY", "mETH"],
      maxDrawdownPct: 8,
      durationHours: 168,
    },
  },
  {
    id: "duel-000",
    agentA: "agent-prudence",
    agentB: "agent-orbit",
    startsAt: now - 10 * 24 * hour,
    endsAt: now - 3 * 24 * hour,
    status: "settled",
    capitalUsd: 10_000,
    scoreA: 1.41,
    scoreB: 0.92,
    winner: "A",
    marketYesShares: 31_200,
    marketNoShares: 28_400,
    marketPrice: 1.0,
    volumeUsd: 78_900,
    rules: {
      assets: ["USDY", "mETH"],
      maxDrawdownPct: 8,
      durationHours: 168,
    },
  },
];

export function getAgent(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}

export function getDuel(id: string): Duel | undefined {
  return DUELS.find((d) => d.id === id);
}

export type Bettor = {
  address: string;
  alias?: string;
  staked: number;
  pnl: number;
  roi: number;
  wins: number;
  losses: number;
};

export const BETTORS: Bettor[] = [
  { address: "0x42c1...8af1", alias: "yieldhunter.eth", staked: 4_820, pnl: 1_241.30, roi: 25.75, wins: 11, losses: 4 },
  { address: "0xa039...cc2b", alias: "macromax",        staked: 2_400, pnl: 612.40,  roi: 25.52, wins: 7,  losses: 3 },
  { address: "0xd875...1b0f", alias: "you",             staked: 1_280, pnl: 318.91,  roi: 24.92, wins: 6,  losses: 3 },
  { address: "0x9b6e...0f12", alias: undefined,         staked: 980,   pnl: 142.30,  roi: 14.52, wins: 5,  losses: 4 },
  { address: "0xc214...e7da", alias: "moe_lp",          staked: 760,   pnl: 88.10,   roi: 11.59, wins: 4,  losses: 3 },
  { address: "0x6021...1188", alias: undefined,         staked: 540,   pnl: 41.20,   roi: 7.63,  wins: 3,  losses: 3 },
  { address: "0xfa12...dc88", alias: "shorty.eth",      staked: 320,   pnl: -22.10,  roi: -6.91, wins: 1,  losses: 3 },
  { address: "0x88aa...e201", alias: undefined,         staked: 240,   pnl: -58.40,  roi: -24.33, wins: 0, losses: 3 },
];
