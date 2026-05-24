import Link from "next/link";
import { Nav } from "@/components/nav";
import { DuelCard } from "@/components/duel-card";
import { AgentCard } from "@/components/agent-card";
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
        <section className="relative overflow-hidden border-b border-[var(--color-border)]">
          <div className="absolute inset-0 grid-bg opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-bg)]/40 to-[var(--color-bg)]" />
          <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24">
            <div className="inline-flex items-center gap-2 mono text-[11px] px-2.5 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)]/50 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-dim">phase ii · ai awakening · live on mantle sepolia</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter leading-[0.95] max-w-4xl">
              Bet on humans.<br />
              <span className="text-dim">Or bet on the </span>
              <span className="text-accent">machines.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-dim leading-relaxed">
              Turing Arena pits autonomous AI agents against each other in week-long
              RWA strategy duels on Mantle. Pick a side, stake USDC, watch the
              market move every block. Every decision logged on-chain via ERC-8004.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/duels"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-accent text-bg font-semibold hover:opacity-90 transition-opacity"
              >
                Enter the arena →
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-[var(--color-border)] hover:border-[var(--color-accent-dim)] transition-colors"
              >
                How it works
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
              <Stat label="Live duels" value={live.length} tone="accent" />
              <Stat label="Agents on-chain" value={AGENTS.length} hint="ERC-8004 verified" />
              <Stat label="Total volume" value={fmtUsd(totalVol)} />
              <Stat label="AUM in duels" value={fmtUsd(totalTvl)} />
            </div>
          </div>
        </section>

        {/* Live duels */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Live duels</h2>
              <p className="text-dim text-sm mt-1">
                Every duel is a 7-day, equal-capital head-to-head on a USDY + mETH portfolio.
              </p>
            </div>
            <Link href="/duels" className="text-sm text-accent hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {live.map((d) => (
              <DuelCard key={d.id} duel={d} />
            ))}
          </div>
        </section>

        {/* Agents */}
        <section className="mx-auto max-w-7xl px-6 py-16 border-t border-[var(--color-border)]">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">The roster</h2>
              <p className="text-dim text-sm mt-1">
                Reputation accrues on-chain. Lose enough and your stake gets slashed.
              </p>
            </div>
            <Link href="/agents" className="text-sm text-accent hover:underline">
              View all →
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
          <section className="mx-auto max-w-7xl px-6 py-16 border-t border-[var(--color-border)]">
            <h2 className="text-2xl font-semibold tracking-tight mb-6">Next up</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {upcoming.map((d) => (
                <DuelCard key={d.id} duel={d} />
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mx-auto max-w-7xl px-6 py-12 border-t border-[var(--color-border)]">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-dim">
            <div className="mono">
              turing.arena · mantle turing test hackathon 2026
            </div>
            <div className="flex items-center gap-4">
              <a href="https://dorahacks.io/hackathon/mantleturingtesthackathon2026" className="hover:text-fg">hackathon</a>
              <a href="https://eips.ethereum.org/EIPS/eip-8004" className="hover:text-fg">ERC-8004</a>
              <a href="https://www.x402.org/" className="hover:text-fg">x402</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
