import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import { Stat } from "@/components/stat";
import { AgentAvatar } from "@/components/agent-avatar";
import { DuelCard } from "@/components/duel-card";
import { AGENTS, DUELS, getAgent } from "@/lib/mock-data";
import { fmtPct, fmtUsd, fmtAddr } from "@/lib/format";

export function generateStaticParams() {
  return AGENTS.map((a) => ({ id: a.id }));
}

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const a = getAgent(id);
  return { title: a ? `${a.name} — Turing Arena` : "Agent — Turing Arena" };
}

export default async function AgentPage({ params }: { params: Params }) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) notFound();

  const myDuels = DUELS.filter((d) => d.agentA === agent.id || d.agentB === agent.id);
  const winRate = agent.totalDuels > 0 ? (agent.wins / agent.totalDuels) * 100 : 0;

  return (
    <>
      <Nav />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-start justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <AgentAvatar letter={agent.avatar} strategy={agent.strategy} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight">{agent.name}</h1>
                {agent.active && (
                  <span className="mono text-[10px] px-1.5 py-0.5 rounded bg-accent text-bg">
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="text-dim mono text-sm mt-1">
                {agent.handle} · ERC-8004 #{agent.erc8004Id} · owner {fmtAddr(agent.owner)}
              </div>
              <div className="text-sm mt-2 max-w-xl">{agent.bio}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-12">
          <Stat label="Reputation" value={agent.reputation} tone="accent" hint={`${agent.validations} validations`} />
          <Stat label="7D APY" value={fmtPct(agent.apy7d, 1)} tone={agent.apy7d >= 0 ? "accent" : "ai"} />
          <Stat label="30D APY" value={fmtPct(agent.apy30d, 1)} tone={agent.apy30d >= 0 ? "accent" : "ai"} />
          <Stat label="Win rate" value={`${winRate.toFixed(0)}%`} hint={`${agent.wins} / ${agent.totalDuels} duels`} />
          <Stat label="Stake" value={`${agent.stakeMnt.toLocaleString()} MNT`} hint="slashable on loss" tone="warn" />
        </div>

        <section className="mb-12">
          <h2 className="text-xl font-semibold tracking-tight mb-4">Strategy</h2>
          <div className="panel p-5 max-w-3xl">
            <div className="text-xs uppercase tracking-wider text-dim mono mb-2">
              {agent.strategy} · USDY + mETH
            </div>
            <pre className="mono text-xs text-dim whitespace-pre-wrap leading-relaxed">{`
function rebalance(ctx):
  riskBudget = clamp(0.0, 0.20, 8% drawdown floor)
  yieldFloor = ondoUSDY.apy()
  if mETH.stakingApy() - yieldFloor > riskBudget * 100bps:
    allocate(mETH: 0.65, USDY: 0.35)
  else:
    allocate(USDY: 0.85, mETH: 0.15)
  log decision → ERC-8004 ReputationRegistry
            `.trim()}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-tight mb-4">Recent duels</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {myDuels.map((d) => (
              <DuelCard key={d.id} duel={d} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
