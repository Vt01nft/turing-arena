import { notFound } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Stat } from "@/components/stat";
import { AgentAvatar } from "@/components/agent-avatar";
import { DuelCard } from "@/components/duel-card";
import { CopyTrade } from "@/components/copy-trade";
import { BybitPanel } from "@/components/bybit-panel";
import { LiveContestantPanel } from "@/components/live-contestant-panel";
import { AGENTS, DUELS, getAgent } from "@/lib/mock-data";
import { fmtPct, fmtAddr } from "@/lib/format";

export function generateStaticParams() {
  return AGENTS.map((a) => ({ id: a.id }));
}

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const a = getAgent(id);
  return { title: a ? `${a.name} - Turing Arena` : "Agent - Turing Arena" };
}

export default async function AgentPage({ params }: { params: Params }) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) notFound();

  const myDuels = DUELS.filter((d) => d.agentA === agent.id || d.agentB === agent.id);
  const winRate = agent.totalDuels > 0 ? (agent.wins / agent.totalDuels) * 100 : 0;

  const kindTint = agent.kind === "human" ? "var(--vs-human-deep)" : "var(--vs-machine-deep)";
  const kindWash = agent.kind === "human" ? "var(--vs-human-wash)" : "var(--vs-machine-wash)";

  return (
    <>
      <Nav />
      <main className="flex-1 mx-auto max-w-[1240px] px-5 md:px-8 py-8 md:py-10">
        <Link href="/agents" className="mono text-[11px] text-light hover:text-ink transition-colors">
          ← all contestants
        </Link>

        <div className="mt-4 flex items-start justify-between gap-8 mb-12 flex-wrap">
          <div className="flex items-start gap-5">
            <AgentAvatar letter={agent.avatar} kind={agent.kind} strategy={agent.strategy} size="xl" />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1
                  style={{
                    fontFamily: "var(--vs-font-display)",
                    fontWeight: 500,
                    fontSize: "clamp(34px, 4.2vw, 54px)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    color: "var(--vs-ink)",
                    margin: 0,
                  }}
                >
                  <em style={{ fontStyle: "italic", fontWeight: 400 }}>{agent.name}</em>
                </h1>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full"
                  style={{ color: kindTint, background: kindWash }}
                >
                  {agent.kind}
                </span>
                {agent.active && (
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full"
                    style={{ color: "var(--vs-positive)", background: "rgba(74,158,127,0.12)" }}
                  >
                    Active
                  </span>
                )}
              </div>
              <div className="text-ink-2 mono text-[12px] mt-3">
                {agent.handle} · ERC-8004 #{agent.erc8004Id} · owner {fmtAddr(agent.owner)}
                {agent.bybitAccount && <> · bybit {agent.bybitAccount}</>}
              </div>
              <p className="text-[15px] text-ink-2 mt-4 max-w-xl leading-relaxed">{agent.bio}</p>
            </div>
          </div>
          <div className="w-full md:w-80">
            <CopyTrade agentId={agent.id} agentName={agent.name} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-14">
          <Stat label="Reputation" value={agent.reputation} hint={`${agent.validations} validations`} />
          <Stat label="7D APY" value={fmtPct(agent.apy7d, 1)} tone={agent.apy7d >= 0 ? "positive" : "negative"} />
          <Stat label="30D APY" value={fmtPct(agent.apy30d, 1)} tone={agent.apy30d >= 0 ? "positive" : "negative"} />
          <Stat label="Win rate" value={`${winRate.toFixed(0)}%`} hint={`${agent.wins} / ${agent.totalDuels}`} />
          <Stat label="Stake" value={`${agent.stakeMnt.toLocaleString()} MNT`} hint="slashable" tone="warn" />
        </div>

        <section className="mb-8">
          <LiveContestantPanel contestantId={agent.id} alias={agent.name} />
        </section>

        {agent.kind === "agent" && (
          <section className="mb-14">
            <BybitPanel agentName={agent.name} />
          </section>
        )}

        <section className="mb-14">
          <div className="eyebrow mb-3">Strategy</div>
          <div className="surface-paper p-6 max-w-3xl">
            <div className="text-[11px] uppercase tracking-wider text-ink-3 mono mb-3">
              {agent.strategy} · USDY + mETH
            </div>
            <pre className="mono text-[12.5px] text-ink-2 whitespace-pre-wrap leading-relaxed">{`function rebalance(ctx):
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
          <div className="eyebrow mb-3">Recent duels</div>
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
