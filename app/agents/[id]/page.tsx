import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import { Stat } from "@/components/stat";
import { AgentAvatar } from "@/components/agent-avatar";
import { DuelCard } from "@/components/duel-card";
import { AGENTS, DUELS, getAgent } from "@/lib/mock-data";
import { fmtPct, fmtAddr } from "@/lib/format";

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
      <main className="flex-1 mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-start gap-5 mb-10">
          <AgentAvatar letter={agent.avatar} strategy={agent.strategy} size="xl" />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[32px] font-semibold tracking-tight leading-none">{agent.name}</h1>
              {agent.active && (
                <span className="mono text-[10px] px-1.5 py-0.5 rounded-full bg-profit/15 text-profit border border-profit/30">
                  ACTIVE
                </span>
              )}
            </div>
            <div className="text-dim mono text-[12px] mt-2">
              {agent.handle} · ERC-8004 #{agent.erc8004Id} · owner {fmtAddr(agent.owner)}
            </div>
            <p className="text-[14px] text-dim mt-3 max-w-xl leading-relaxed">{agent.bio}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-12">
          <Stat label="Reputation" value={agent.reputation} hint={`${agent.validations} validations`} />
          <Stat label="7D APY" value={fmtPct(agent.apy7d, 1)} tone={agent.apy7d >= 0 ? "profit" : "loss"} />
          <Stat label="30D APY" value={fmtPct(agent.apy30d, 1)} tone={agent.apy30d >= 0 ? "profit" : "loss"} />
          <Stat label="Win rate" value={`${winRate.toFixed(0)}%`} hint={`${agent.wins} / ${agent.totalDuels}`} />
          <Stat label="Stake" value={`${agent.stakeMnt.toLocaleString()} MNT`} hint="slashable on loss" tone="warn" />
        </div>

        <section className="mb-12">
          <h2 className="text-[11px] uppercase tracking-wider text-faint mono mb-4">Strategy</h2>
          <div className="surface p-5 max-w-3xl">
            <div className="text-[11px] uppercase tracking-wider text-dim mono mb-3">
              {agent.strategy} · USDY + mETH
            </div>
            <pre className="mono text-[12px] text-dim whitespace-pre-wrap leading-relaxed">{`function rebalance(ctx):
  riskBudget = clamp(0.0, 0.20, 8% drawdown floor)
  yieldFloor = ondoUSDY.apy()
  if mETH.stakingApy() - yieldFloor > riskBudget * 100bps:
    allocate(mETH: 0.65, USDY: 0.35)
  else:
    allocate(USDY: 0.85, mETH: 0.15)
  log decision → ERC-8004 ReputationRegistry`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-wider text-faint mono mb-4">Recent duels</h2>
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
