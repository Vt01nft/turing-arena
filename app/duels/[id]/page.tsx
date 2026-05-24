import { notFound } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Stat } from "@/components/stat";
import { AgentAvatar } from "@/components/agent-avatar";
import { DuelMarket } from "@/components/duel-market";
import { ShareButton } from "@/components/share-button";
import { DUELS, getDuel, getAgent } from "@/lib/mock-data";
import { fmtCountdown, fmtPct, fmtUsd } from "@/lib/format";

export function generateStaticParams() {
  return DUELS.map((d) => ({ id: d.id }));
}

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const d = getDuel(id);
  if (!d) return { title: "Duel — Turing Arena" };
  const a = getAgent(d.agentA);
  const b = getAgent(d.agentB);
  const title = `${a?.name} vs ${b?.name} — Turing Arena`;
  const description =
    d.status === "live"
      ? `Live duel: ${a?.name} (${(d.scoreA * 100).toFixed(0)} bps) vs ${b?.name} (${(d.scoreB * 100).toFixed(0)} bps). Stake on the outcome.`
      : `${a?.name} vs ${b?.name} — ${d.status} duel on USDY + mETH.`;
  const ogImage = `/api/og/duel/${id}`;
  return {
    title,
    description,
    openGraph: { title, description, images: [ogImage] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function DuelPage({ params }: { params: Params }) {
  const { id } = await params;
  const duel = getDuel(id);
  if (!duel) notFound();
  const a = getAgent(duel.agentA);
  const b = getAgent(duel.agentB);
  if (!a || !b) notFound();

  const leading = duel.scoreA > duel.scoreB ? "A" : duel.scoreB > duel.scoreA ? "B" : null;

  return (
    <>
      <Nav />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-8">
        <Link href="/duels" className="mono text-xs text-dim hover:text-fg">
          ← all duels
        </Link>

        <header className="mt-4 mb-8">
          <div className="flex items-center gap-2 mono text-[11px] mb-3">
            <span
              className={
                duel.status === "live"
                  ? "text-accent"
                  : duel.status === "upcoming"
                    ? "text-dim"
                    : "text-[var(--color-warn)]"
              }
            >
              ● {duel.status.toUpperCase()}
            </span>
            <span className="text-dim">·</span>
            <span className="text-dim">
              {duel.status === "live"
                ? `${fmtCountdown(duel.endsAt)} remaining`
                : duel.status === "upcoming"
                  ? `starts in ${fmtCountdown(duel.startsAt)}`
                  : `settled`}
            </span>
            <span className="text-dim">·</span>
            <span className="text-dim mono">{duel.id}</span>
          </div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              <Link href={`/agents/${a.id}`} className="hover:text-human">
                {a.name}
              </Link>{" "}
              <span className="text-dim">vs</span>{" "}
              <Link href={`/agents/${b.id}`} className="hover:text-ai">
                {b.name}
              </Link>
            </h1>
            <ShareButton
              text={`${a.name} vs ${b.name} on Turing Arena — bet on humans, or bet on the machines.`}
              url={`/duels/${duel.id}`}
            />
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-6">
            {/* Scoreboard */}
            <section className="panel p-6">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
                <div className="flex items-center gap-4">
                  <AgentAvatar letter={a.avatar} strategy={a.strategy} size="lg" />
                  <div>
                    <div className="font-semibold text-lg">{a.name}</div>
                    <div className="text-xs text-dim">{a.strategy}</div>
                    <div
                      className={`mono text-2xl mt-1 ${duel.scoreA >= 0 ? "text-accent" : "text-ai"} ${leading === "A" ? "font-semibold" : ""}`}
                    >
                      {fmtPct(duel.scoreA)}
                    </div>
                  </div>
                </div>
                <div className="text-dim mono">⚔</div>
                <div className="flex items-center gap-4 justify-end text-right">
                  <div>
                    <div className="font-semibold text-lg">{b.name}</div>
                    <div className="text-xs text-dim">{b.strategy}</div>
                    <div
                      className={`mono text-2xl mt-1 ${duel.scoreB >= 0 ? "text-accent" : "text-ai"} ${leading === "B" ? "font-semibold" : ""}`}
                    >
                      {fmtPct(duel.scoreB)}
                    </div>
                  </div>
                  <AgentAvatar letter={b.avatar} strategy={b.strategy} size="lg" />
                </div>
              </div>
            </section>

            {/* Rules */}
            <section>
              <h3 className="text-xs uppercase tracking-wider text-dim mono mb-3">Rules of engagement</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Starting capital" value={fmtUsd(duel.capitalUsd)} />
                <Stat label="Assets" value={duel.rules.assets.join(" + ")} />
                <Stat
                  label="Max drawdown"
                  value={`${duel.rules.maxDrawdownPct}%`}
                  hint="auto-liquidate"
                  tone="warn"
                />
                <Stat label="Duration" value={`${duel.rules.durationHours / 24} days`} />
              </div>
            </section>

            {/* Decision feed (mock) */}
            <section>
              <h3 className="text-xs uppercase tracking-wider text-dim mono mb-3">
                Decision feed
                <span className="ml-2 text-dim normal-case tracking-normal font-sans">
                  · logged to ERC-8004 ReputationRegistry every action
                </span>
              </h3>
              <div className="panel divide-y divide-[var(--color-border)]">
                <FeedRow agent={a.name} at="2h" tone="human">
                  rebalanced to <span className="mono">USDY 80% / mETH 20%</span> on falling funding rates
                </FeedRow>
                <FeedRow agent={b.name} at="3h" tone="ai">
                  opened leveraged mETH position <span className="mono">1.4x</span>, exit on +1.2% or -0.8%
                </FeedRow>
                <FeedRow agent={a.name} at="6h" tone="human">
                  claimed Ondo USDY accrual: <span className="mono text-accent">+$3.41</span>
                </FeedRow>
                <FeedRow agent={b.name} at="11h" tone="ai">
                  closed mETH position at <span className="mono text-accent">+1.21%</span>, rotated to USDY ladder
                </FeedRow>
                <FeedRow agent={a.name} at="22h" tone="human">
                  initial allocation set: <span className="mono">USDY 70% / mETH 30%</span>
                </FeedRow>
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <DuelMarket duel={duel} />
            <div className="panel p-4 text-xs text-dim leading-relaxed">
              <div className="text-fg font-semibold mb-2 text-sm">Copy-trade for $9.99/mo</div>
              Mirror this agent&apos;s allocation to your own wallet. Subscription billed in
              USDC via <span className="mono text-accent">x402</span>, settled per-block.
              Cancel anytime by stopping payment.
              <button className="mt-3 w-full py-2 rounded-md border border-[var(--color-border)] hover:border-[var(--color-accent-dim)] transition-colors text-fg">
                Subscribe
              </button>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

function FeedRow({
  agent,
  at,
  tone,
  children,
}: {
  agent: string;
  at: string;
  tone: "human" | "ai";
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3 flex gap-3 text-sm">
      <span className="mono text-[10px] text-dim w-10 pt-0.5">{at} ago</span>
      <span className={`mono text-xs ${tone === "human" ? "text-human" : "text-ai"} w-20 pt-0.5 shrink-0`}>
        {agent}
      </span>
      <span className="text-fg/90">{children}</span>
    </div>
  );
}
