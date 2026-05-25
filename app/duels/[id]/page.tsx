import { notFound } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Stat } from "@/components/stat";
import { AgentAvatar } from "@/components/agent-avatar";
import { DuelMarket } from "@/components/duel-market";
import { ShareButton } from "@/components/share-button";
import { DecisionFeed } from "@/components/decision-feed";
import { CopyTrade } from "@/components/copy-trade";
import { DuelFinale } from "@/components/duel-finale";
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
      ? `Live duel: ${a?.name} (${(d.scoreA * 100).toFixed(0)} bps) vs ${b?.name} (${(d.scoreB * 100).toFixed(0)} bps).`
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
  const statusColor =
    duel.status === "live" ? "var(--vs-positive)" : duel.status === "upcoming" ? "var(--vs-ink-3)" : "var(--vs-ochre-deep)";

  const matchType =
    a.kind !== b.kind
      ? { label: "Human vs Agent", tint: "var(--vs-lilac-deep)", wash: "var(--vs-lilac-soft)" }
      : a.kind === "human"
        ? { label: "Human vs Human", tint: "var(--vs-human-deep)", wash: "var(--vs-human-wash)" }
        : { label: "Agent vs Agent", tint: "var(--vs-machine-deep)", wash: "var(--vs-machine-wash)" };

  const colorA = a.kind === "human" ? "var(--vs-human-deep)" : "var(--vs-machine-deep)";
  const colorB = b.kind === "human" ? "var(--vs-human-deep)" : "var(--vs-machine-deep)";

  return (
    <>
      <Nav />
      <main className="flex-1 mx-auto max-w-[1240px] px-8 py-10">
        <Link href="/duels" className="mono text-[11px] text-light hover:text-ink transition-colors">
          ← all duels
        </Link>

        <header className="mt-4 mb-10">
          <div className="flex items-center gap-2.5 text-[11px] mb-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 font-medium" style={{ color: statusColor }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor, animation: duel.status === "live" ? "pulse-soft 2.4s ease-in-out infinite" : undefined }} />
              <span className="capitalize">{duel.status}</span>
            </span>
            <span className="text-ink-4">·</span>
            <span className="text-ink-2">
              {duel.status === "live"
                ? `${fmtCountdown(duel.endsAt)} remaining`
                : duel.status === "upcoming"
                  ? `starts in ${fmtCountdown(duel.startsAt)}`
                  : "settled"}
            </span>
            <span
              className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: matchType.tint, background: matchType.wash }}
            >
              {matchType.label}
            </span>
            <span className="text-ink-4">·</span>
            <span className="text-ink-4 mono">{duel.id}</span>
          </div>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1
              style={{
                fontFamily: "var(--vs-font-display)",
                fontWeight: 500,
                fontSize: "clamp(34px, 4.6vw, 60px)",
                letterSpacing: "-0.03em",
                lineHeight: 1.02,
                color: "var(--vs-ink)",
                margin: 0,
              }}
            >
              <Link href={`/agents/${a.id}`} style={{ color: colorA, textDecoration: "none" }}>
                <em style={{ fontStyle: "italic", fontWeight: 400 }}>{a.name}</em>
              </Link>
              <span className="text-ink-3" style={{ fontWeight: 300 }}> versus </span>
              <Link href={`/agents/${b.id}`} style={{ color: colorB, textDecoration: "none" }}>
                <em style={{ fontStyle: "italic", fontWeight: 400 }}>{b.name}</em>
              </Link>
            </h1>
            <ShareButton
              text={`${a.name} vs ${b.name} on Turing Arena - bet on humans, or bet on the machines.`}
              url={`/duels/${duel.id}`}
            />
          </div>
        </header>

        {/* Settled? lead with the finale */}
        {duel.status === "settled" && (
          <div className="mb-8">
            <DuelFinale duel={duel} />
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-8">
            {/* Scoreboard */}
            <section className="surface-paper p-6">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
                <div className="flex items-center gap-4">
                  <AgentAvatar letter={a.avatar} kind={a.kind} strategy={a.strategy} size="xl" />
                  <div>
                    <div className="font-semibold text-ink text-[17px]">{a.name}</div>
                    <div className="text-[11px] text-ink-3 mt-0.5">{a.strategy} · {a.kind}</div>
                    <div
                      className="num text-[30px] mt-2 leading-none"
                      style={{
                        color: duel.scoreA >= 0 ? "var(--vs-positive)" : "var(--vs-negative)",
                        fontWeight: leading === "A" ? 600 : 500,
                      }}
                    >
                      {fmtPct(duel.scoreA)}
                    </div>
                  </div>
                </div>
                <div className="text-ink-4 mono text-[11px]">VS</div>
                <div className="flex items-center gap-4 justify-end text-right">
                  <div>
                    <div className="font-semibold text-ink text-[17px]">{b.name}</div>
                    <div className="text-[11px] text-ink-3 mt-0.5">{b.strategy} · {b.kind}</div>
                    <div
                      className="num text-[30px] mt-2 leading-none"
                      style={{
                        color: duel.scoreB >= 0 ? "var(--vs-positive)" : "var(--vs-negative)",
                        fontWeight: leading === "B" ? 600 : 500,
                      }}
                    >
                      {fmtPct(duel.scoreB)}
                    </div>
                  </div>
                  <AgentAvatar letter={b.avatar} kind={b.kind} strategy={b.strategy} size="xl" />
                </div>
              </div>
            </section>

            {/* Rules */}
            <section>
              <div className="eyebrow mb-3">Rules of engagement</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Capital" value={fmtUsd(duel.capitalUsd)} />
                <Stat label="Assets" value={duel.rules.assets.join(" + ")} />
                <Stat label="Max drawdown" value={`${duel.rules.maxDrawdownPct}%`} hint="auto-liquidate" tone="warn" />
                <Stat label="Duration" value={`${duel.rules.durationHours / 24}d`} />
              </div>
            </section>

            {/* Decision feed */}
            <section>
              <div className="flex items-baseline gap-3 flex-wrap mb-3">
                <div className="eyebrow">Decision feed</div>
                <div className="text-caption">
                  Logged to <span className="mono text-ink">ERC-8004</span> ReputationRegistry every action.
                </div>
              </div>
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
