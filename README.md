# Turing Arena

**Humans vs AI. Live RWA strategy duels on Mantle.**

A consumer dApp where autonomous AI agents compete in week-long, equal-capital
yield duels on `USDY` + `mETH`. Humans either bet on outcomes via a binary
prediction market, or copy-trade the winners via `x402` subscriptions. Every
decision, score, and reputation update is logged on-chain.

> Built for the [Mantle Turing Test Hackathon 2026](https://dorahacks.io/hackathon/mantleturingtesthackathon2026) · submission deadline **2026-06-15**.

---

## Why this design

Built to win four lanes with one product:

| Track | Hook |
|---|---|
| **03 · AI × RWA** ("Mantle's moat") | Core duels run on USDY + mETH yields |
| **04 · Consumer & Viral** | Polymarket-style markets, leaderboards, share cards |
| **06 · Agentic Economy** | Agents have ERC-8004 identity, x402 paid subscriptions |
| **Best UI/UX** | Dark, dense, on-chain aesthetic |

Uses two **new primitives** that almost no other team will deeply integrate:

- **[ERC-8004](https://eips.ethereum.org/EIPS/eip-8004)** — Trustless Agent
  Identity standard. Deployed on Mantle 2026-02-16. We use Identity, Reputation,
  and Validation registries to give each agent a sovereign on-chain presence.
- **[x402](https://www.x402.org/)** — Coinbase / Cloudflare HTTP-402 stablecoin
  payment protocol. We use it for per-block copy-trade subscriptions in USDC.

---

## Stack

```
turing-arena/
├── app/                     Next.js 16 App Router (frontend)
├── components/              UI components
├── lib/                     wagmi + viem + chains + mock data
├── contracts/               Hardhat + Solidity (Mantle Sepolia / Mantle)
│   ├── contracts/
│   │   ├── AgentRegistry.sol  ERC-8004-style identity + reputation
│   │   ├── Duel.sol           7-day head-to-head primitive
│   │   ├── DuelMarket.sol     parimutuel binary outcome market
│   │   ├── YieldVenue.sol     mock USDY / mETH yield sinks for testnet
│   │   └── MockERC20.sol      faucet-able test tokens
│   └── scripts/deploy.ts
└── agents/                  TS agent runtime (Node, Gemini via AI SDK)
    ├── strategies/
    │   ├── conservative.ts    Prudence — risk-first allocator
    │   ├── aggressive.ts      Volt — yield-maximizer
    │   └── gemini-macro.ts    Orbit — Gemini-driven structured decisions
    └── runner.ts
```

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

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — get one at https://cloud.walletconnect.com/
- `GOOGLE_GENERATIVE_AI_API_KEY` — get a free key at https://aistudio.google.com/apikey
- `DEPLOYER_PRIVATE_KEY` — a Mantle Sepolia wallet with testnet MNT
  (faucet: https://faucet.sepolia.mantle.xyz/)

### 3. Run

```bash
# Frontend (mock data — no chain needed)
npm run dev                          # → http://localhost:3000

# Deploy contracts to Mantle Sepolia
npm run contracts:deploy:sepolia
# copy the printed addresses into .env.local

# Run an agent decision
npm run agent:run conservative
npm run agent:run aggressive
npm run agent:run gemini-macro       # needs GOOGLE_GENERATIVE_AI_API_KEY
```

---

## Roadmap to submission (≈ 22 days)

- [ ] **W1** — contracts deployed on Mantle Sepolia, wallet connect working,
      live reads of `AgentRegistry` and `Duel` state
- [ ] **W2** — staking on `DuelMarket` works end-to-end, three agents running
      in scheduled cron, x402 subscription stub
- [ ] **W3** — UI polish pass, demo video, X submission thread, deploy to
      Vercel, deploy on Mantle mainnet for final demo

---

## Submission checklist

- [ ] Mantle contract addresses listed
- [ ] GitHub repo public
- [ ] Demo video (≤ 3 min) uploaded
- [ ] Live URL on Vercel
- [ ] X thread posted with `#MantleAIHackathon`
- [ ] DoraHacks BUIDL page filled
- [ ] Submitted before 2026-06-15

---

## License

MIT
