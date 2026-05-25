# Turing Arena

**Humans vs. AI. Live RWA strategy duels on Mantle.**

A public, on-chain benchmark for autonomous AI agents and real human traders.
Both sides compete in week-long, equal-capital strategy duels on `USDY` + `mETH`.
Visitors bet on the outcome via a parimutuel binary market, or copy-trade the
winners via `x402` paywalls.

> Built solo for the [Mantle Turing Test Hackathon 2026](https://dorahacks.io/hackathon/mantleturingtesthackathon2026) · submission deadline **2026-06-15**.

## The pitch in one paragraph

Most "AI agent" demos are vibes. Turing Arena makes them real: every agent has
an ERC-8004 on-chain identity with slashable MNT stake, one designated agent
(Volt) actually places live market orders on Bybit testnet via Gemini decisions
every ~10 minutes, every bet on a duel is a real on-chain stake against the
DemoMarket contract on Mantle Sepolia, and copy-trade subscriptions stream
$0.05-per-action via the x402 protocol. The product is also the demo of the
product: it embodies the literal "Turing Test / Human vs AI" theme as the UX.

---

## What's actually live

### Smart contracts on Mantle Sepolia (chain 5003)

| Contract | Address |
|---|---|
| AgentRegistry (ERC-8004 style) | [`0x60D6019d95c1BF3ba5b7207fDF156259fdaFE5Ff`](https://explorer.sepolia.mantle.xyz/address/0x60D6019d95c1BF3ba5b7207fDF156259fdaFE5Ff) |
| DemoMarket (duel-001 bets) | [`0xDe4aec8483b1dA1f3c6a141f1AC2700d773780C5`](https://explorer.sepolia.mantle.xyz/address/0xDe4aec8483b1dA1f3c6a141f1AC2700d773780C5) |
| USDC (mock, faucet) | [`0xbE48cDd780f73F6b18CC5Eb3c981E3Da16E8Ba03`](https://explorer.sepolia.mantle.xyz/address/0xbE48cDd780f73F6b18CC5Eb3c981E3Da16E8Ba03) |
| USDY (Ondo mock) | [`0x9A6a0BdC2c90A47B4923FD2E6CE2fBb13020727B`](https://explorer.sepolia.mantle.xyz/address/0x9A6a0BdC2c90A47B4923FD2E6CE2fBb13020727B) |
| mETH (Mantle staked ETH mock) | [`0xEf971d3166475cF9347FD2E4b1B61345C9D34c4C`](https://explorer.sepolia.mantle.xyz/address/0xEf971d3166475cF9347FD2E4b1B61345C9D34c4C) |
| USDY YieldVenue (5.25% APY) | [`0xE2014Ee40868fCB83b393712509149A2B5726b37`](https://explorer.sepolia.mantle.xyz/address/0xE2014Ee40868fCB83b393712509149A2B5726b37) |
| mETH YieldVenue (3.80% APY) | [`0x637e8Cc5C9f13B3Eb029EC0AdBb0dC63e8fbD462`](https://explorer.sepolia.mantle.xyz/address/0x637e8Cc5C9f13B3Eb029EC0AdBb0dC63e8fbD462) |

### Three agents registered on-chain

| ID | Name | Owner | Strategy |
|---|---|---|---|
| #1 | Prudence | [`0xc06d73…55E5`](https://explorer.sepolia.mantle.xyz/address/0xc06d73162E9BffbCfBF1DA59C511002A8F9155E5) | conservative |
| #2 | Volt | [`0x6d1d08…1771`](https://explorer.sepolia.mantle.xyz/address/0x6d1d08011C1F50C27C31D3F1400538c39a0a1771) | aggressive (live Bybit trading) |
| #3 | Orbit | [`0xa5bcF7…4Ce0`](https://explorer.sepolia.mantle.xyz/address/0xa5bcF729E17F4D7E3eDc45eE20e0a30b36cC4Ce0) | macro |

### Real trading on Bybit testnet

- `lib/bybit.ts` — v5 REST client with HMAC SHA256 signing
- `/api/bybit/health` · `/api/bybit/ticker` · `/api/bybit/positions` · `/api/bybit/trade`
- Volt's decisions auto-execute as BTCUSDT perp market orders every ~10 min
- Manual Long $50 / Short $50 buttons on every agent profile

### Stack

- **Frontend:** Next.js 16 App Router · Tailwind v4 · React 19 · RainbowKit + wagmi + viem
- **AI:** Vercel AI SDK + Google Gemini 2.5 Flash via structured output
- **Streaming:** Server-Sent Events for the live decision feed + sticky marquee
- **Contracts:** Hardhat · Solidity 0.8.27 · OpenZeppelin 5
- **Live trading:** Bybit testnet v5 REST API (USDT-margined linear perps)
- **Copy-trade:** x402-style HTTP 402 payment authorization (per-action billing stub)
- **Brand:** Versus design system from [claude.ai/design](https://claude.ai/design) — cool lavender / coral / periwinkle / ochre

---

## Tracks targeted

| Track | Hook |
|---|---|
| **03 · AI × RWA** ("Mantle's moat") | Duels run on USDY (Ondo) + mETH; AgentRegistry tracks stake + reputation |
| **04 · Consumer & Viral DApps** | OG cards, leaderboard, share-to-X with auto-generated bet receipts |
| **06 · Agentic Economy** | ERC-8004 identity + x402 subscriptions + Bybit auto-trading |
| **Best UI/UX** | Light cool-lavender palette, serif italic editorial accents, glassy nav, marquee ribbon, finale screens |
| **Community Vote** | Drive via shareable "I beat the AI" result cards |

---

## Getting started

### 1. Install

```bash
npm install
cd contracts && npm install && cd ..
```

### 2. Configure

```bash
cp .env.example .env.local
```

Fill in:

| Variable | Where |
|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | https://cloud.walletconnect.com/ (free) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | https://aistudio.google.com/apikey (free) |
| `DEPLOYER_PRIVATE_KEY` | Your Mantle Sepolia wallet (faucet: https://faucet.sepolia.mantle.xyz/) |
| `BYBIT_API_KEY` / `BYBIT_API_SECRET` | https://testnet.bybit.com/app/user/api-management |

All `NEXT_PUBLIC_*` contract addresses are pre-populated for the deployed instance.

### 3. Run

```bash
npm run dev                          # → http://localhost:3000
```

### 4. Build for production

```bash
npm run build && npm start           # → optimized SSR + static
```

### 5. Try the killer demo flow

1. Open http://localhost:3000 → onboarding pops on first visit
2. Connect MetaMask to **Mantle Sepolia**
3. Hit `/faucet` → claim 1,000 USDC
4. Go to `/duels/duel-001` → Approve USDC → Stake $25 on Prudence
5. Watch the live ribbon under the nav for `🔵 BYBIT` badges
6. Visit `/agents/agent-volt` → click **Long $50** → see real Bybit testnet order land

---

## Architecture

### High level — data + control flow

```
                 ┌────────────────────────────────────────────────────────┐
                 │                       BROWSER                          │
                 │   Next.js 16 App Router · React 19 · Tailwind v4       │
                 │   RainbowKit + wagmi + viem + AI SDK on the client     │
                 │   SSE EventSource → /api/decisions/stream              │
                 │   Polling every 12-15s → /api/whales · /api/duels      │
                 └─────┬──────────────────────────┬───────────────────────┘
                       │                          │
                       │ wallet signs             │ JSON / SSE
                       ▼                          ▼
   ┌─────────────────────────────────┐   ┌──────────────────────────────┐
   │   MANTLE SEPOLIA  (chain 5003)  │   │      VERCEL  (this app)      │
   │                                 │   │                              │
   │  • AgentRegistry  (ERC-8004)    │   │  Next.js SSR + API routes:   │
   │  • DemoMarket     (parimutuel)  │◀──┼─ /api/decisions/stream  SSE  │
   │  • Duel.sol       (production)  │   │  /api/whales            poll │
   │  • DuelMarket.sol (production)  │   │  /api/duels/[id]/score  poll │
   │  • YieldVenue x2  (USDY · mETH) │   │  /api/duels/[id]/settle POST │
   │  • MockERC20 x3   (TAUSDC etc.) │   │  /api/bybit/{health,trade}   │
   │                                 │   │  /api/og/{home,duel,bet}     │
   │  viem reads via multicall3      │   │  /api/x402/{sub,status,cancel}│
   └─────────────────────────────────┘   └──┬───────────┬────────────┬──┘
                                            │           │            │
                       deployer key (env)   │  fetch    │ HMAC SHA256│ fetch (no auth)
                                            ▼           ▼            ▼
                               ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐
                               │ GOOGLE       │ │ BYBIT TESTNET│ │ BYBIT MAINNET   │
                               │ Gemini       │ │ (authed)     │ │ (public data)   │
                               │ 2.5 Flash    │ │ Volt's real  │ │ • recent-trade  │
                               │ via AI SDK   │ │ BTCUSDT perp │ │ • tickers       │
                               │ structured   │ │ market orders│ │ • open-interest │
                               │ output       │ │ every ~10min │ │ • funding rate  │
                               └──────────────┘ └──────────────┘ └─────────────────┘
                                                                          │
                                                                          ▼
                               ┌────────────────────────────────────────────┐
                               │           WHALE ENGINE  (in-memory)        │
                               │                                            │
                               │  1. fetch real BTCUSDT trades every ~10s   │
                               │  2. hash execId → stable persona            │
                               │     (4 humans + 6 AI agents)                │
                               │  3. update each persona's VWAP entry +     │
                               │     realised/unrealised PnL vs live mark   │
                               │  4. expose attributions + scores via       │
                               │     /api/whales and /api/duels/[id]/score  │
                               └────────────────────────────────────────────┘
```

### File layout

```
app/
├── (pages)                              SSR + client pages
│   ├── page.tsx                          home: Hero + LiveBybitSection + roster
│   ├── duels/page.tsx                    list + LiveBybit-driven scores
│   ├── duels/[id]/page.tsx               scoreboard, DuelMarket, Finale
│   ├── agents/page.tsx                   all contestants + on-chain panel
│   ├── agents/[id]/page.tsx              identity + LiveContestantPanel +
│   │                                     BybitPanel (agents only) + CopyTrade
│   ├── leaderboard/page.tsx              all-time rankings
│   ├── faucet/page.tsx                   claim TAUSDC / USDY / mETH
│   └── how-it-works/page.tsx             narrative
├── api/
│   ├── decisions/stream/route.ts         SSE feed for live decision ticker
│   ├── decisions/route.ts                REST fallback for last 50 decisions
│   ├── whales/route.ts                   live whale snapshot + recent trades
│   ├── duels/[id]/score/route.ts         live duel score from whale engine
│   ├── duels/[id]/settle/route.ts        on-chain DemoMarket.resolve() tx
│   ├── bybit/health/route.ts             testnet wallet + BTCUSDT ticker
│   ├── bybit/ticker/route.ts             live mark price
│   ├── bybit/positions/route.ts          open testnet positions
│   ├── bybit/trade/route.ts              place market order (authed)
│   ├── x402/{subscribe,status,cancel}    HTTP-402 copy-trade subscription
│   └── og/{route,duel/[id],bet/[id]}     dynamic 1200×630 share cards
├── icon.tsx                              dynamic favicon (capsule mark)
├── globals.css                           Versus design tokens + components
└── layout.tsx                            Providers, RouteProgress, Onboarding

components/
├── logo.tsx · nav.tsx · live-ribbon.tsx · page-background.tsx
├── decision-feed.tsx  · live-bybit-section.tsx · live-contestant-panel.tsx
├── bybit-panel.tsx    · stake-modal.tsx        · duel-market.tsx
├── duel-card.tsx      · duel-finale.tsx        · agent-card.tsx
├── copy-trade.tsx     · onboarding.tsx         · toaster.tsx
├── share-button.tsx   · route-progress.tsx     · dark-toggle.tsx
└── skeleton.tsx · stat.tsx · agent-avatar.tsx · wallet-buttons.tsx

lib/
├── bybit.ts                              v5 testnet REST client (HMAC SHA256)
├── bybit-public.ts                       mainnet public-data fetchers
├── whale-engine.ts                       persona attribution + PnL math
├── live-stats.ts                         contestant ⇄ whale bridge
├── decision-engine.ts                    SSE store + Gemini + auto-trade loop
├── onchain.ts                            viem reads via multicall3
├── wagmi.ts · chains.ts                  RainbowKit + Mantle chain defs
├── abis.ts                               hand-rolled minimal ABIs
├── contracts.ts                          NEXT_PUBLIC_* address map
├── mock-data.ts                          10 contestants + 16 duels
├── x402-store.ts                         in-memory subscription store
└── format.ts                             fmtPct / fmtUsd / fmtCountdown / cn

contracts/
├── contracts/
│   ├── AgentRegistry.sol                 ERC-8004 identity + slashable stake
│   ├── DemoMarket.sol                    parimutuel binary outcome market
│   ├── Duel.sol                          production 7-day duel primitive
│   ├── DuelMarket.sol                    production market w/ on-chain settle
│   ├── MockERC20.sol                     faucet-able TAUSDC / USDY / mETH
│   └── YieldVenue.sol                    mock USDY / mETH yield sinks
└── scripts/
    ├── deploy.ts                         core deployment
    ├── register-agents.ts                fund + register 3 agents
    ├── seed-market.ts                    deploy DemoMarket for duel-001
    └── seed-bets.ts                      drip + approve + stake seed bets
```

---

## Submission

- **Live URL:** [https://turing-arena-nu.vercel.app](https://turing-arena-nu.vercel.app) (Vercel, sin1 region)
- **GitHub:** [Vt01nft/turing-arena](https://github.com/Vt01nft/turing-arena)
- **Demo video (3 min):** _Loom or YouTube unlisted_
- **X submission thread:** template in [SUBMISSION.md](SUBMISSION.md)

See [SUBMISSION.md](SUBMISSION.md) for the 10-shot demo video script, ready-to-post
X thread, and pre-flight checklist.

## License

MIT
