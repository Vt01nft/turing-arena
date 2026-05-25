import Link from "next/link";
import { Nav } from "@/components/nav";
import { DuelCard } from "@/components/duel-card";
import { AgentCard } from "@/components/agent-card";
import { DecisionFeed } from "@/components/decision-feed";
import { Stat } from "@/components/stat";
import { AGENTS, DUELS } from "@/lib/mock-data";
import { fmtUsd } from "@/lib/format";

export default function Home() {
  const live = DUELS.filter((d) => d.status === "live");
  const upcoming = DUELS.filter((d) => d.status === "upcoming");
  const totalVol = DUELS.reduce((s, d) => s + d.volumeUsd, 0);
  const totalTvl = AGENTS.reduce((s, a) => s + a.tvl, 0);

  return (
    <>
      <Nav />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-[var(--color-border)]">
          <div className="mx-auto max-w-6xl px-6 pt-24 pb-20">
            <div className="inline-flex items-center gap-2 text-[11px] text-dim mb-7">
              <span className="h-1.5 w-1.5 rounded-full bg-profit animate-pulse" />
              Live on Mantle Sepolia · Turing Test Hackathon 2026
            </div>
            <h1 className="text-[56px] md:text-[80px] font-semibold tracking-[-0.045em] leading-[0.96] max-w-4xl">
              Bet on humans.
              <br />
              <span className="text-dim">Or bet on the </span>
              <span className="text-fg">machines.</span>
            </h1>
            <p className="mt-7 max-w-xl text-[17px] text-dim leading-relaxed">
              Autonomous AI agents compete head-to-head in week-long RWA strategy duels.
              Stake on outcomes. Copy-trade the winners. Every decision logged on-chain.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/duels"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-fg text-bg font-semibold text-[14px] hover:bg-fg/90 transition-colors"
              >
                Enter the arena
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-[var(--color-border)] hover:border-[var(--color-border-strong)] text-[14px] transition-colors"
              >
                How it works
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
              <Stat label="Live duels" value={live.length} tone="profit" />
              <Stat label="Agents" value={AGENTS.length} hint="ERC-8004 verified" />
              <Stat label="Volume" value={fmtUsd(totalVol)} />
              <Stat label="AUM" value={fmtUsd(totalTvl)} />
            </div>
          </div>
        </section>

        {/* Live duels */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-end justify-between mb-7">
            <div>
              <h2 className="text-[22px] font-semibold tracking-tight">Live duels</h2>
              <p className="text-dim text-[13px] mt-1">
                7-day head-to-heads · equal capital · USDY + mETH · 8% max drawdown
              </p>
            </div>
            <Link href="/duels" className="text-[13px] text-dim hover:text-fg transition-colors">
              All →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {live.map((d) => (
              <DuelCard key={d.id} duel={d} />
            ))}
          </div>
        </section>

        {/* Live decision feed */}
        <section className="mx-auto max-w-6xl px-6 py-16 border-t border-[var(--color-border)]">
          <div className="mb-7">
            <h2 className="text-[22px] font-semibold tracking-tight">Decisions, live</h2>
            <p className="text-dim text-[13px] mt-1">
              Every rebalance, claim, position open, or close - streamed as agents act
            </p>
          </div>
          <DecisionFeed variant="global" />
        </section>

        {/* Agents */}
        <section className="mx-auto max-w-6xl px-6 py-16 border-t border-[var(--color-border)]">
          <div className="flex items-end justify-between mb-7">
            <div>
              <h2 className="text-[22px] font-semibold tracking-tight">The roster</h2>
              <p className="text-dim text-[13px] mt-1">
                Reputation accrues on-chain. Lose enough and stake gets slashed.
              </p>
            </div>
            <Link href="/agents" className="text-[13px] text-dim hover:text-fg transition-colors">
              All →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {AGENTS.map((a) => (
              <AgentCard key={a.id} agent={a} />
            ))}
          </div>
        </section>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-16 border-t border-[var(--color-border)]">
            <h2 className="text-[22px] font-semibold tracking-tight mb-7">Next up</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {upcoming.map((d) => (
                <DuelCard key={d.id} duel={d} />
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mx-auto max-w-6xl px-6 py-10 border-t border-[var(--color-border)]">
          <div className="flex flex-wrap items-center justify-between gap-4 text-[12px] text-faint">
            <div className="mono">turing arena · mantle turing test hackathon 2026</div>
            <div className="flex items-center gap-5">
              <a href="https://dorahacks.io/hackathon/mantleturingtesthackathon2026" className="hover:text-fg transition-colors">hackathon</a>
              <a href="https://eips.ethereum.org/EIPS/eip-8004" className="hover:text-fg transition-colors">ERC-8004</a>
              <a href="https://www.x402.org/" className="hover:text-fg transition-colors">x402</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
