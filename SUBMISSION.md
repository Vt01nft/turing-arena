# Submission checklist · Turing Arena

Last build day before lock-in. Use this as the single source of truth for
what goes into the X thread, the DoraHacks BUIDL form, and the demo video.

---

## 60-second pitch (for video / Slack / dev intro)

Turing Arena is a public, on-chain benchmark for autonomous AI agents on
Mantle. Three agents (Prudence, Volt, Orbit) compete head-to-head in
week-long, equal-capital duels on USDY + mETH. Humans either bet on the
outcome via a Polymarket-style market or copy-trade the winners through an
x402 paywall. Every agent decision and every bet is logged on-chain via an
ERC-8004-style registry.

## Tracks targeted

- **Track 03 · AI × RWA** ("Mantle's moat") — duels run on USDY + mETH
- **Track 04 · Consumer & Viral DApps** — OG share cards, leaderboard
- **Track 06 · Agentic Economy** — ERC-8004 identity, x402 subscriptions
- **Best UI/UX**
- **Community Vote** (drive via shareable result cards)

## Live URLs

- Web (dev): `http://localhost:3000`
- Web (prod): _fill after `vercel deploy`_

## Mantle Sepolia deployments (chain 5003)

| Contract | Address |
|---|---|
| **AgentRegistry** | [0x60D6019d95c1BF3ba5b7207fDF156259fdaFE5Ff](https://explorer.sepolia.mantle.xyz/address/0x60D6019d95c1BF3ba5b7207fDF156259fdaFE5Ff) |
| **DemoMarket · duel-001** | [0xDe4aec8483b1dA1f3c6a141f1AC2700d773780C5](https://explorer.sepolia.mantle.xyz/address/0xDe4aec8483b1dA1f3c6a141f1AC2700d773780C5) |
| USDC (mock) | [0xbE48cDd780f73F6b18CC5Eb3c981E3Da16E8Ba03](https://explorer.sepolia.mantle.xyz/address/0xbE48cDd780f73F6b18CC5Eb3c981E3Da16E8Ba03) |
| USDY (mock) | [0x9A6a0BdC2c90A47B4923FD2E6CE2fBb13020727B](https://explorer.sepolia.mantle.xyz/address/0x9A6a0BdC2c90A47B4923FD2E6CE2fBb13020727B) |
| mETH (mock) | [0xEf971d3166475cF9347FD2E4b1B61345C9D34c4C](https://explorer.sepolia.mantle.xyz/address/0xEf971d3166475cF9347FD2E4b1B61345C9D34c4C) |
| USDY venue | [0xE2014Ee40868fCB83b393712509149A2B5726b37](https://explorer.sepolia.mantle.xyz/address/0xE2014Ee40868fCB83b393712509149A2B5726b37) |
| mETH venue | [0x637e8Cc5C9f13B3Eb029EC0AdBb0dC63e8fbD462](https://explorer.sepolia.mantle.xyz/address/0x637e8Cc5C9f13B3Eb029EC0AdBb0dC63e8fbD462) |

**Registered agents (on-chain):**

| ID | Name | Owner |
|---|---|---|
| #1 | Prudence | [0xc06d73162E9BffbCfBF1DA59C511002A8F9155E5](https://explorer.sepolia.mantle.xyz/address/0xc06d73162E9BffbCfBF1DA59C511002A8F9155E5) |
| #2 | Volt | [0x6d1d08011C1F50C27C31D3F1400538c39a0a1771](https://explorer.sepolia.mantle.xyz/address/0x6d1d08011C1F50C27C31D3F1400538c39a0a1771) |
| #3 | Orbit | [0xa5bcF729E17F4D7E3eDc45eE20e0a30b36cC4Ce0](https://explorer.sepolia.mantle.xyz/address/0xa5bcF729E17F4D7E3eDc45eE20e0a30b36cC4Ce0) |

---

## Demo video — 3-minute shot list

Record at **1920×1080**, dark mode, full-screen Chrome (no devtools bar).
Pre-load MetaMask with a funded Mantle Sepolia wallet that already holds
USDC from `/faucet`.

| # | Time | Shot | Voice-over |
|---|---|---|---|
| 1 | 0:00–0:08 | Static title card · TuringArena logo · "Bet on humans. Or bet on the machines." | Cold open, one beat |
| 2 | 0:08–0:25 | Slow scroll of `/` home page · Hero → stats → live duels | "Autonomous AI agents compete head-to-head in week-long RWA duels on Mantle." |
| 3 | 0:25–0:45 | Click into `/duels` · linger on Live, Upcoming, Settled sections | "Two agents. Ten thousand dollars synthetic capital. Seven days. Eight percent max drawdown. Highest return wins." |
| 4 | 0:45–1:05 | Click `/agents` · hover the "● 3 agents verified on-chain" panel · click owner address → opens Mantle explorer in new tab | "Every agent has on-chain identity. We're using ERC-8004 — the new trustless agent standard Mantle deployed in February." |
| 5 | 1:05–1:25 | Cut to `/duels/duel-001` · scoreboard · highlight ON-CHAIN badge on the market | "Markets are real. Parimutuel binary outcome contracts. Settled on-chain." |
| 6 | 1:25–1:55 | Click Approve → MetaMask confirm → wait → click Stake $25 on Volt → confirm → watch the price tick up | "I'm staking 25 USDC on Volt. Watch the price move." |
| 7 | 1:55–2:15 | Show the live decision feed below · point at GEMINI badge when one ticks in | "Every agent action is streamed live. Yellow GEMINI badge means it came from a real LLM call." |
| 8 | 2:15–2:35 | Navigate to `/agents/agent-volt` · click Subscribe via x402 → MetaMask sign → "MIRRORING ACTIVE" state appears | "Copy-trade is x402-native. Sign once, billed per agent action. Cancel anytime." |
| 9 | 2:35–2:50 | `/leaderboard` · slow scroll · linger on bettors table | "Reputation compounds on-chain. Wins earn it. Losses slash MNT stake." |
| 10 | 2:50–3:00 | Click Share on duel page · X compose modal opens with prefilled tweet + auto-rendered OG card | "Ship it. Tag #MantleAIHackathon." |

**Recording tools:** OBS (free), Loom (paid), or Screen.studio (paid). Aim for
crisp clicks, no mouse-jiggle. Trim with CapCut.

---

## X submission thread

Post from your personal X. Each numbered line is a separate tweet.

```
1/

i built turing arena for the @Mantle_Official Turing Test Hackathon.

a public on-chain benchmark for autonomous AI agents managing real-world
asset capital. humans bet on outcomes. or copy-trade the winners.

#MantleAIHackathon

[attach demo video]

—

2/

three agents — Prudence, Volt, Orbit — compete in week-long head-to-heads
on USDY + mETH. equal capital. 8% max drawdown. highest return wins.

every decision streamed live and logged on-chain.

—

3/

agent identity is real, not vibes. all three agents are registered on-chain
under an ERC-8004-style registry on Mantle Sepolia.

each one stakes MNT collateral that's slashable on loss.

→ explorer.sepolia.mantle.xyz/address/0x60D6019d95c1BF3ba5b7207fDF156259fdaFE5Ff

—

4/

bets are real too. parimutuel binary markets, USDC stakes, on-chain settlement.

connect a wallet, claim test USDC, stake on Prudence or Volt. price ticks
as orders come in.

→ duel-001 market: explorer.sepolia.mantle.xyz/address/0xDe4aec8483b1dA1f3c6a141f1AC2700d773780C5

—

5/

copy-trading is x402-native. sign once. pay $0.05 per agent action via
HTTP 402. mirror Volt's allocations to your wallet. cancel by stopping
payment.

shipping for the agentic economy is shipping the payment rail too.

—

6/

stack:
• mantle sepolia (and ready for mainnet)
• ERC-8004 (Feb 2026 mantle deployment)
• x402 (Coinbase/Cloudflare)
• next.js 16 · viem · wagmi · rainbowkit
• gemini 2.5 flash in the decision loop

—

7/

repo: github.com/<you>/turing-arena
live: turing-arena.vercel.app

built solo · @Mantle_Official @byrealxyz @bybit_official @blockchainforgoodalliance — would love to chat.

#MantleAIHackathon
```

---

## DoraHacks BUIDL form fields

- **Project name:** Turing Arena
- **Tagline:** Bet on humans. Or bet on the machines.
- **Long description:** copy the 60-second pitch above
- **Tracks:** AI × RWA · Consumer & Viral DApps · Agentic Economy · Best UI/UX
- **Tech used:** Next.js 16, viem, wagmi, RainbowKit, Solidity 0.8.27, Hardhat, Vercel AI SDK, Google Gemini 2.5 Flash, ERC-8004, x402
- **GitHub:** _your repo URL_
- **Demo URL:** _your Vercel URL_
- **Demo video:** _YouTube unlisted or Loom_
- **Mantle contract address:** `0x60D6019d95c1BF3ba5b7207fDF156259fdaFE5Ff` (AgentRegistry — primary)

---

## Pre-flight checklist (run morning of submission)

- [ ] `npm run dev` boots clean
- [ ] `/api/og`, `/api/og/duel/duel-001`, `/api/og/bet/duel-000` all return 200 PNG
- [ ] AgentRegistry still has 3 agents (verify on explorer)
- [ ] DemoMarket has volume (re-run `seed-bets.ts` if it got reset)
- [ ] `.env.local` not committed (`git check-ignore .env.local`)
- [ ] `keys.txt` not committed
- [ ] README has correct repo URL after push
- [ ] Rotate the Gemini API key if you ever pasted it anywhere public
- [ ] `vercel --prod` deploys cleanly
- [ ] Submit X thread BEFORE 2026-06-15 16:59 UTC (the DoraHacks deadline)
