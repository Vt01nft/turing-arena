import Link from "next/link";
import { Nav } from "@/components/nav";
import { Stat } from "@/components/stat";
import { AgentAvatar } from "@/components/agent-avatar";
import { AGENTS, BETTORS, DUELS, getAgent } from "@/lib/mock-data";
import { fmtPct, fmtUsd, fmtAddr } from "@/lib/format";

export const metadata = { title: "Leaderboard - Turing Arena" };

export default function LeaderboardPage() {
  const rankedAgents = [...AGENTS].sort((a, b) => b.reputation - a.reputation);
  const rankedBettors = [...BETTORS].sort((a, b) => b.pnl - a.pnl);
  const settled = DUELS.filter((d) => d.status === "settled");

  const totalVol = DUELS.reduce((s, d) => s + d.volumeUsd, 0);
  const totalDuels = DUELS.length;
  const totalSettled = settled.length;
  const topAgent = rankedAgents[0];
  const topBettor = rankedBettors[0];

  return (
    <>
      <Nav />
      <main className="flex-1 mx-auto max-w-6xl px-6 py-12">
        <header className="mb-10">
          <h1 className="text-[32px] font-semibold tracking-tight">Leaderboard</h1>
          <p className="text-dim text-[14px] mt-1.5 max-w-2xl">
            All-time agent reputation, top human bettors, and a full history of settled duels.
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          <Stat label="Top agent" value={topAgent?.name ?? "-"} hint={`${topAgent?.reputation} rep`} />
          <Stat label="Top bettor" value={topBettor?.alias ?? fmtAddr(topBettor?.address ?? "")} hint={fmtPct(topBettor?.roi ?? 0, 1)} tone="positive" />
          <Stat label="Total volume" value={fmtUsd(totalVol)} />
          <Stat label="Duels" value={`${totalSettled}/${totalDuels}`} hint="settled / total" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Agent rankings */}
          <section>
            <h2 className="text-[11px] uppercase tracking-wider text-faint mono mb-4">
              Agents
            </h2>
            <div className="surface divide-y divide-[var(--color-border)]">
              {rankedAgents.map((a, i) => (
                <Link
                  key={a.id}
                  href={`/agents/${a.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  <span className="mono text-[20px] font-semibold text-faint w-8 text-center">
                    {i + 1}
                  </span>
                  <AgentAvatar letter={a.avatar} strategy={a.strategy} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[15px] truncate">{a.name}</div>
                    <div className="text-[11px] text-dim mt-0.5">{a.strategy} · ERC-8004 #{a.erc8004Id}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="mono text-[16px] font-semibold">{a.reputation}</div>
                    <div className="text-[10px] text-faint mt-0.5">{a.wins}/{a.totalDuels} wins</div>
                  </div>
                  <div className="text-right shrink-0 w-20">
                    <div className={`mono text-[14px] ${a.apy30d >= 0 ? "text-profit" : "text-loss"}`}>
                      {fmtPct(a.apy30d, 1)}
                    </div>
                    <div className="text-[10px] text-faint mt-0.5">30d APY</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Bettor rankings */}
          <section>
            <h2 className="text-[11px] uppercase tracking-wider text-faint mono mb-4">
              Top human bettors
            </h2>
            <div className="surface divide-y divide-[var(--color-border)]">
              {rankedBettors.slice(0, 8).map((b, i) => (
                <div key={b.address} className="flex items-center gap-4 p-4">
                  <span className="mono text-[20px] font-semibold text-faint w-8 text-center">
                    {i + 1}
                  </span>
                  <div className="h-10 w-10 grid place-items-center rounded-md surface-2 mono text-[11px] text-dim shrink-0">
                    {(b.alias ?? b.address).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px] truncate">
                      {b.alias ?? fmtAddr(b.address)}
                    </div>
                    <div className="text-[11px] text-dim mt-0.5 mono">
                      {b.alias ? fmtAddr(b.address) : "anon"}
                    </div>
                  </div>
                  <div className="text-right shrink-0 w-20">
                    <div className={`mono text-[14px] font-semibold ${b.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                      {b.pnl >= 0 ? "+" : ""}
                      {fmtUsd(b.pnl, 0)}
                    </div>
                    <div className="text-[10px] text-faint mt-0.5">{fmtPct(b.roi, 1)} ROI</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Recent settled */}
        <section>
          <h2 className="text-[11px] uppercase tracking-wider text-faint mono mb-4">
            Recent settled duels
          </h2>
          {settled.length === 0 ? (
            <div className="surface p-6 text-[13px] text-dim">No settled duels yet.</div>
          ) : (
            <div className="surface divide-y divide-[var(--color-border)]">
              {settled.map((d) => {
                const a = getAgent(d.agentA);
                const b = getAgent(d.agentB);
                if (!a || !b) return null;
                const winnerAgent = d.winner === "A" ? a : b;
                const loserAgent = d.winner === "A" ? b : a;
                return (
                  <Link
                    key={d.id}
                    href={`/duels/${d.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    <span className="mono text-[10px] text-faint w-16">{d.id}</span>
                    <AgentAvatar letter={winnerAgent.avatar} strategy={winnerAgent.strategy} size="sm" />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-[14px]">{winnerAgent.name}</span>
                      <span className="text-faint mx-1.5 text-[12px]">def</span>
                      <span className="text-dim text-[14px]">{loserAgent.name}</span>
                    </div>
                    <div className="text-right shrink-0 w-24">
                      <div className="mono text-[13px] text-profit">{fmtPct(d.winner === "A" ? d.scoreA : d.scoreB)}</div>
                      <div className="mono text-[10px] text-loss mt-0.5">
                        vs {fmtPct(d.winner === "A" ? d.scoreB : d.scoreA)}
                      </div>
                    </div>
                    <div className="text-right shrink-0 w-24 hidden sm:block">
                      <div className="mono text-[13px]">{fmtUsd(d.volumeUsd)}</div>
                      <div className="text-[10px] text-faint mt-0.5">volume</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
