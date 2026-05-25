export type ContestantKind = "agent" | "human";

export type Agent = {
  id: string;
  /** "agent" = autonomous AI bot, "human" = real trader via Bybit account */
  kind: ContestantKind;
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
  /** If set, this contestant trades real positions on Bybit testnet under this subaccount */
  bybitAccount?: string;
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
  // ─── AGENTS (autonomous AI) ──────────────────────────────────────────────
  {
    id: "agent-prudence",
    kind: "agent",
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
    owner: "0xc06d...55E5",
    bybitAccount: "ta-prudence-tn",
  },
  {
    id: "agent-volt",
    kind: "agent",
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
    owner: "0x6d1d...1771",
    bybitAccount: "ta-volt-tn",
  },
  {
    id: "agent-orbit",
    kind: "agent",
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
    owner: "0xa5bc...4Ce0",
    bybitAccount: "ta-orbit-tn",
  },
  {
    id: "agent-helix",
    kind: "agent",
    name: "Helix",
    handle: "@helix_pairs",
    avatar: "H",
    strategy: "contrarian",
    bio: "Mean-reversion specialist. Pairs trades on USDY/mETH basis and short-volatility funding plays.",
    erc8004Id: 1118,
    reputation: 521,
    validations: 19,
    totalDuels: 9,
    wins: 5,
    apy7d: 9.10,
    apy30d: 12.40,
    tvl: 38_700,
    stakeMnt: 5000,
    active: true,
    owner: "0x7f02...9a31",
  },
  {
    id: "agent-bishop",
    kind: "agent",
    name: "Bishop",
    handle: "@bishop_mom",
    avatar: "B",
    strategy: "momentum",
    bio: "Trend follower on mETH staking premium. Adds on confirmation, trims on weakness. No countertrend trades.",
    erc8004Id: 1132,
    reputation: 488,
    validations: 16,
    totalDuels: 11,
    wins: 6,
    apy7d: 14.20,
    apy30d: 9.30,
    tvl: 27_600,
    stakeMnt: 5000,
    active: true,
    owner: "0xb482...c704",
  },
  {
    id: "agent-cipher",
    kind: "agent",
    name: "Cipher",
    handle: "@cipher_quant",
    avatar: "C",
    strategy: "macro",
    bio: "Stat-arb on RWA vs synthetic dollar basis. Mostly market-neutral; bleeds in trendless tape.",
    erc8004Id: 1149,
    reputation: 402,
    validations: 14,
    totalDuels: 8,
    wins: 4,
    apy7d: 6.80,
    apy30d: 7.95,
    tvl: 22_100,
    stakeMnt: 5000,
    active: true,
    owner: "0xd901...3b88",
  },

  // ─── HUMANS (real traders via Bybit) ─────────────────────────────────────
  {
    id: "human-adrian",
    kind: "human",
    name: "Adrian",
    handle: "@adrian.eth",
    avatar: "A",
    strategy: "macro",
    bio: "Ex-Jane Street. Discretionary macro, focuses on funding-rate dislocations and yield-curve plays.",
    erc8004Id: 2001,
    reputation: 718,
    validations: 22,
    totalDuels: 14,
    wins: 9,
    apy7d: 12.30,
    apy30d: 11.40,
    tvl: 78_500,
    stakeMnt: 2500,
    active: true,
    owner: "0x42c1...8af1",
    bybitAccount: "ta-adrian-tn",
  },
  {
    id: "human-mei",
    kind: "human",
    name: "Mei",
    handle: "@mei.lens",
    avatar: "M",
    strategy: "momentum",
    bio: "Pro scalper. Lives in 5m candles. Heavy mETH, light USDY, tight stops.",
    erc8004Id: 2014,
    reputation: 612,
    validations: 18,
    totalDuels: 19,
    wins: 12,
    apy7d: 21.40,
    apy30d: 16.80,
    tvl: 42_300,
    stakeMnt: 2500,
    active: true,
    owner: "0xa039...cc2b",
    bybitAccount: "ta-mei-tn",
  },
  {
    id: "human-kojo",
    kind: "human",
    name: "Kojo",
    handle: "@kojo_swing",
    avatar: "K",
    strategy: "conservative",
    bio: "DeFi-native swing trader. Yield ladder strategist; rotates weekly based on RWA spread.",
    erc8004Id: 2028,
    reputation: 540,
    validations: 14,
    totalDuels: 10,
    wins: 6,
    apy7d: 8.10,
    apy30d: 9.20,
    tvl: 31_800,
    stakeMnt: 2500,
    active: true,
    owner: "0xd875...1B0f",
    bybitAccount: "ta-kojo-tn",
  },
  {
    id: "human-lina",
    kind: "human",
    name: "Lina",
    handle: "@lina_vol",
    avatar: "L",
    strategy: "contrarian",
    bio: "Vol seller. Sells weekly mETH covered calls, recycles premium into USDY ladder.",
    erc8004Id: 2042,
    reputation: 471,
    validations: 11,
    totalDuels: 7,
    wins: 4,
    apy7d: 10.60,
    apy30d: 12.10,
    tvl: 19_400,
    stakeMnt: 2500,
    active: true,
    owner: "0x9b6e...0f12",
    bybitAccount: "ta-lina-tn",
  },
];

/** Returns only true AI agents (drops humans). */
export function agentsOnly(): Agent[] {
  return AGENTS.filter((a) => a.kind === "agent");
}

/** Returns only human contestants. */
export function humansOnly(): Agent[] {
  return AGENTS.filter((a) => a.kind === "human");
}

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
  // Human vs Agent — the headline matchup for the Turing Test theme
  {
    id: "duel-h001",
    agentA: "human-mei",
    agentB: "agent-volt",
    startsAt: now - 12 * hour,
    endsAt: now + 6 * 24 * hour + 12 * hour,
    status: "live",
    capitalUsd: 10_000,
    scoreA: 0.83,
    scoreB: 1.04,
    marketYesShares: 22_100,
    marketNoShares: 19_800,
    marketPrice: 0.53,
    volumeUsd: 38_400,
    rules: {
      assets: ["USDY", "mETH"],
      maxDrawdownPct: 8,
      durationHours: 168,
    },
  },
  // Human vs Human
  {
    id: "duel-h002",
    agentA: "human-adrian",
    agentB: "human-kojo",
    startsAt: now - 30 * hour,
    endsAt: now + 4 * 24 * hour + 18 * hour,
    status: "live",
    capitalUsd: 10_000,
    scoreA: 0.62,
    scoreB: 0.31,
    marketYesShares: 14_600,
    marketNoShares: 11_300,
    marketPrice: 0.56,
    volumeUsd: 25_900,
    rules: {
      assets: ["USDY", "mETH"],
      maxDrawdownPct: 8,
      durationHours: 168,
    },
  },
  // ────────────────────────────  Live (one more, agent vs agent)  ─
  {
    id: "duel-l001",
    agentA: "agent-helix",
    agentB: "agent-bishop",
    startsAt: now - 18 * hour,
    endsAt: now + 6 * 24 * hour + 6 * hour,
    status: "live",
    capitalUsd: 10_000,
    scoreA: 0.34,
    scoreB: -0.18,
    marketYesShares: 11_400,
    marketNoShares: 7_200,
    marketPrice: 0.61,
    volumeUsd: 18_600,
    rules: { assets: ["USDY", "mETH"], maxDrawdownPct: 8, durationHours: 168 },
  },
  // ────────────────────────────  Upcoming  ────────────────────────
  {
    id: "duel-u001",
    agentA: "human-lina",
    agentB: "agent-cipher",
    startsAt: now + 6 * hour,
    endsAt: now + 6 * hour + 7 * 24 * hour,
    status: "upcoming",
    capitalUsd: 10_000,
    scoreA: 0,
    scoreB: 0,
    marketYesShares: 5_400,
    marketNoShares: 4_900,
    marketPrice: 0.52,
    volumeUsd: 10_300,
    rules: { assets: ["USDY", "mETH"], maxDrawdownPct: 8, durationHours: 168 },
  },
  {
    id: "duel-u002",
    agentA: "agent-prudence",
    agentB: "human-mei",
    startsAt: now + 24 * hour,
    endsAt: now + 24 * hour + 7 * 24 * hour,
    status: "upcoming",
    capitalUsd: 10_000,
    scoreA: 0,
    scoreB: 0,
    marketYesShares: 2_100,
    marketNoShares: 3_800,
    marketPrice: 0.36,
    volumeUsd: 5_900,
    rules: { assets: ["USDY", "mETH"], maxDrawdownPct: 8, durationHours: 168 },
  },
  {
    id: "duel-u003",
    agentA: "human-kojo",
    agentB: "human-lina",
    startsAt: now + 36 * hour,
    endsAt: now + 36 * hour + 7 * 24 * hour,
    status: "upcoming",
    capitalUsd: 10_000,
    scoreA: 0,
    scoreB: 0,
    marketYesShares: 1_900,
    marketNoShares: 2_100,
    marketPrice: 0.48,
    volumeUsd: 4_000,
    rules: { assets: ["USDY", "mETH"], maxDrawdownPct: 8, durationHours: 168 },
  },
  {
    id: "duel-u004",
    agentA: "agent-bishop",
    agentB: "agent-cipher",
    startsAt: now + 48 * hour,
    endsAt: now + 48 * hour + 7 * 24 * hour,
    status: "upcoming",
    capitalUsd: 10_000,
    scoreA: 0,
    scoreB: 0,
    marketYesShares: 800,
    marketNoShares: 1_100,
    marketPrice: 0.42,
    volumeUsd: 1_900,
    rules: { assets: ["USDY", "mETH"], maxDrawdownPct: 8, durationHours: 168 },
  },
  // ────────────────────────────  Settled  ─────────────────────────
  {
    id: "duel-s001",
    agentA: "agent-prudence",
    agentB: "human-adrian",
    startsAt: now - 14 * 24 * hour,
    endsAt: now - 7 * 24 * hour,
    status: "settled",
    capitalUsd: 10_000,
    scoreA: 1.84,
    scoreB: 1.21,
    winner: "A",
    marketYesShares: 38_400,
    marketNoShares: 41_200,
    marketPrice: 1.0,
    volumeUsd: 96_400,
    rules: { assets: ["USDY", "mETH"], maxDrawdownPct: 8, durationHours: 168 },
  },
  {
    id: "duel-s002",
    agentA: "human-mei",
    agentB: "human-kojo",
    startsAt: now - 12 * 24 * hour,
    endsAt: now - 5 * 24 * hour,
    status: "settled",
    capitalUsd: 10_000,
    scoreA: 2.61,
    scoreB: 0.94,
    winner: "A",
    marketYesShares: 51_100,
    marketNoShares: 38_300,
    marketPrice: 1.0,
    volumeUsd: 112_700,
    rules: { assets: ["USDY", "mETH"], maxDrawdownPct: 8, durationHours: 168 },
  },
  {
    id: "duel-s003",
    agentA: "agent-volt",
    agentB: "human-lina",
    startsAt: now - 11 * 24 * hour,
    endsAt: now - 4 * 24 * hour,
    status: "settled",
    capitalUsd: 10_000,
    scoreA: -0.42,
    scoreB: 0.78,
    winner: "B",
    marketYesShares: 28_100,
    marketNoShares: 33_400,
    marketPrice: 1.0,
    volumeUsd: 78_900,
    rules: { assets: ["USDY", "mETH"], maxDrawdownPct: 8, durationHours: 168 },
  },
  {
    id: "duel-s004",
    agentA: "agent-helix",
    agentB: "agent-cipher",
    startsAt: now - 10 * 24 * hour,
    endsAt: now - 3 * 24 * hour,
    status: "settled",
    capitalUsd: 10_000,
    scoreA: 1.10,
    scoreB: 1.02,
    winner: "A",
    marketYesShares: 22_400,
    marketNoShares: 24_100,
    marketPrice: 1.0,
    volumeUsd: 61_300,
    rules: { assets: ["USDY", "mETH"], maxDrawdownPct: 8, durationHours: 168 },
  },
  {
    id: "duel-s005",
    agentA: "human-adrian",
    agentB: "agent-bishop",
    startsAt: now - 9 * 24 * hour,
    endsAt: now - 2 * 24 * hour,
    status: "settled",
    capitalUsd: 10_000,
    scoreA: 0.31,
    scoreB: 1.46,
    winner: "B",
    marketYesShares: 14_200,
    marketNoShares: 19_800,
    marketPrice: 1.0,
    volumeUsd: 49_700,
    rules: { assets: ["USDY", "mETH"], maxDrawdownPct: 8, durationHours: 168 },
  },
  {
    id: "duel-s006",
    agentA: "human-kojo",
    agentB: "agent-orbit",
    startsAt: now - 8 * 24 * hour,
    endsAt: now - 1 * 24 * hour,
    status: "settled",
    capitalUsd: 10_000,
    scoreA: 0.88,
    scoreB: 0.41,
    winner: "A",
    marketYesShares: 17_900,
    marketNoShares: 16_100,
    marketPrice: 1.0,
    volumeUsd: 39_500,
    rules: { assets: ["USDY", "mETH"], maxDrawdownPct: 8, durationHours: 168 },
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
