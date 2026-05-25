import { notFound } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Stat } from "@/components/stat";
import { AgentAvatar } from "@/components/agent-avatar";
import { DuelMarket } from "@/components/duel-market";
import { ShareButton } from "@/components/share-button";
import { DecisionFeed } from "@/components/decision-feed";
import { CopyTrade } from "@/components/copy-trade";
import { DUELS, getDuel, getAgent } from "@/lib/mock-data";
import { fmtCountdown, fmtPct, fmtUsd } from "@/lib/format";

export function generateStaticParams() {
  return DUELS.map((d) => ({ id: d.id }));
}

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const d = getDuel(id);
  if (!d) return { title: "Duel - Turing Arena" };
  const a = getAgent(d.agentA);
  const b = getAgent(d.agentB);
  const title = `${a?.name} vs ${b?.name} - Turing Arena`;
  const description =
    d.status === "live"
      ? `Live duel: ${a?.name} (${(d.scoreA * 100).toFixed(0)} bps) vs ${b?.name} (${(d.scoreB * 100).toFixed(0)} bps). Stake on the outcome.`
      : `${a?.name} vs ${b?.name} - ${d.status} duel on USDY + mETH.`;
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
  const statusTone =
    duel.status === "live" ? "text-profit" : duel.status === "upcoming" ? "text-dim" : "text-warn";
  const statusDot =
    duel.status === "live" ? "bg-profit animate-pulse" : duel.status === "upcoming" ? "bg-[var(--color-border-strong)]" : "bg-warn";

  return (
    <>
      <Nav />
      <main className="flex-1 mx-auto max-w-6xl px-6 py-10">
        <Link href="/duels" className="mono text-[11px] text-faint hover:text-fg transition-colors">
          ← all duels
        </Link>

        <header className="mt-4 mb-8">
          <div className="flex items-center gap-2 text-[11px] mb-3">
            <span className={`flex items-center gap-1.5 ${statusTone}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
              <span className="capitalize">{duel.status}</span>
            </span>
            <span className="text-faint">·</span>
            <span className="text-dim">
              {duel.status === "live"
                ? `${fmtCountdown(duel.endsAt)} remaining`
                : duel.status === "upcoming"
                  ? `starts in ${fmtCountdown(duel.startsAt)}`
                  : "settled"}
            </span>
            <span className="text-faint">·</span>
            <span className="text-faint mono">{duel.id}</span>
          </div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="text-[34px] md:text-[42px] font-semibold tracking-tight leading-none">
              <Link href={`/agents/${a.id}`} className="hover:text-human transition-colors">
                {a.name}
              </Link>
              <span className="text-faint font-light"> vs </span>
              <Link href={`/agents/${b.id}`} className="hover:text-ai transition-colors">
                {b.name}
              </Link>
            </h1>
            <ShareButton
              text={`${a.name} vs ${b.name} on Turing Arena - bet on humans, or bet on the machines.`}
              url={`/duels/${duel.id}`}
            />
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-8">
            {/* Scoreboard */}
            <section className="surface p-6">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
                <div className="flex items-center gap-4">
                  <AgentAvatar letter={a.avatar} strategy={a.strategy} size="xl" />
                  <div>
                    <div className="font-semibold text-[17px]">{a.name}</div>
                    <div className="text-[11px] text-dim mt-0.5">{a.strategy}</div>
                    <div
                      className={`mono text-[28px] mt-2 leading-none ${duel.scoreA >= 0 ? "text-profit" : "text-loss"} ${leading === "A" ? "font-semibold" : "font-medium"}`}
                    >
                      {fmtPct(duel.scoreA)}
                    </div>
                  </div>
                </div>
                <div className="text-faint mono text-[11px]">VS</div>
                <div className="flex items-center gap-4 justify-end text-right">
                  <div>
                    <div className="font-semibold text-[17px]">{b.name}</div>
                    <div className="text-[11px] text-dim mt-0.5">{b.strategy}</div>
                    <div
                      className={`mono text-[28px] mt-2 leading-none ${duel.scoreB >= 0 ? "text-profit" : "text-loss"} ${leading === "B" ? "font-semibold" : "font-medium"}`}
                    >
                      {fmtPct(duel.scoreB)}
                    </div>
                  </div>
                  <AgentAvatar letter={b.avatar} strategy={b.strategy} size="xl" />
                </div>
              </div>
            </section>

            {/* Rules */}
            <section>
              <h3 className="text-[11px] uppercase tracking-wider text-faint mono mb-3">Rules</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Capital" value={fmtUsd(duel.capitalUsd)} />
                <Stat label="Assets" value={duel.rules.assets.join(" + ")} />
                <Stat
                  label="Max drawdown"
                  value={`${duel.rules.maxDrawdownPct}%`}
                  hint="auto-liquidate"
                  tone="warn"
                />
                <Stat label="Duration" value={`${duel.rules.durationHours / 24}d`} />
              </div>
            </section>

            {/* Decision feed */}
            <section>
              <h3 className="text-[11px] uppercase tracking-wider text-faint mono mb-3">
                Decision feed
                <span className="ml-2 text-faint normal-case tracking-normal font-sans">
                  · logged to ERC-8004 ReputationRegistry every action
                </span>
              </h3>
              <DecisionFeed duelId={duel.id} />
            </section>
          </div>

          <aside className="space-y-4">
            <DuelMarket duel={duel} />
            <CopyTrade agentId={a.id} agentName={a.name} />
          </aside>
        </div>
      </main>
    </>
  );
}
