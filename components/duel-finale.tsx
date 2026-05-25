import { Duel, getAgent } from "@/lib/mock-data";
import { fmtPct } from "@/lib/format";
import { AgentAvatar } from "./agent-avatar";
import { ShareButton } from "./share-button";

/// Big celebratory reveal for settled duels. Replaces the standard
/// scoreboard with a "X won" hero block when duel.status === 'settled'.
export function DuelFinale({ duel }: { duel: Duel }) {
  if (duel.status !== "settled") return null;
  const a = getAgent(duel.agentA);
  const b = getAgent(duel.agentB);
  if (!a || !b) return null;

  const winner = duel.winner === "A" ? a : b;
  const loser = duel.winner === "A" ? b : a;
  const winnerScore = duel.winner === "A" ? duel.scoreA : duel.scoreB;
  const loserScore = duel.winner === "A" ? duel.scoreB : duel.scoreA;
  const margin = winnerScore - loserScore;

  const winColor = winner.kind === "human" ? "var(--vs-human-deep)" : "var(--vs-machine-deep)";
  const winWash = winner.kind === "human" ? "var(--vs-human-wash)" : "var(--vs-machine-wash)";

  return (
    <section
      className="surface-paper p-8 sm:p-10 relative overflow-hidden"
      style={{ boxShadow: "var(--vs-shadow-2)" }}
    >
      {/* tinted wash behind */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 0%, ${winWash}, transparent 60%)`,
        }}
      />
      {/* trophy ribbon */}
      <div className="relative flex items-center justify-between mb-7 flex-wrap gap-3">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: "var(--vs-ochre-soft)", color: "var(--vs-ochre-deep)" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 4h10v3a5 5 0 0 1-10 0V4z" />
            <path d="M5 4H3v3a4 4 0 0 0 4 4M19 4h2v3a4 4 0 0 1-4 4" />
            <path d="M9 18h6M12 13v5" />
          </svg>
          <span className="text-[11px] font-semibold uppercase tracking-wider">Duel settled</span>
        </div>
        <ShareButton
          text={`${winner.name} just beat ${loser.name} on @TuringArena - ${fmtPct(margin)} margin.`}
          url={`/duels/${duel.id}`}
        />
      </div>

      <div className="relative grid lg:grid-cols-[1fr_auto] items-end gap-8">
        <div>
          <div className="eyebrow mb-3">The winner</div>
          <div className="flex items-end gap-5 mb-4 flex-wrap">
            <AgentAvatar letter={winner.avatar} kind={winner.kind} strategy={winner.strategy} size="xl" />
            <h1
              style={{
                fontFamily: "var(--vs-font-display)",
                fontWeight: 500,
                fontSize: "clamp(46px, 6.4vw, 96px)",
                letterSpacing: "-0.035em",
                lineHeight: 0.94,
                margin: 0,
                color: "var(--vs-ink)",
              }}
            >
              <em style={{ fontStyle: "italic", fontWeight: 400, color: winColor }}>{winner.name}</em>
              <span className="text-ink-3" style={{ fontWeight: 300 }}> won</span>
              <span style={{ color: "var(--vs-positive)" }}>.</span>
            </h1>
          </div>
          <p className="text-ink-2 text-[16px] leading-relaxed max-w-xl">
            {winner.kind === "human" ? "A real human" : "An autonomous agent"} closed the duel{" "}
            <em style={{ fontStyle: "italic", fontWeight: 500 }}>{fmtPct(margin, 2)}</em> ahead of {loser.name}.
            Reputation +50 on ERC-8004. Losing pool distributed pro-rata to winning stakers.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 min-w-[260px]">
          <Cell label={winner.name} value={fmtPct(winnerScore, 2)} tone="positive" highlight />
          <Cell label={loser.name} value={fmtPct(loserScore, 2)} tone={loserScore >= 0 ? "neutral" : "negative"} />
        </div>
      </div>
    </section>
  );
}

function Cell({
  label,
  value,
  tone,
  highlight,
}: {
  label: string;
  value: string;
  tone: "positive" | "negative" | "neutral";
  highlight?: boolean;
}) {
  const color =
    tone === "positive" ? "var(--vs-positive)" : tone === "negative" ? "var(--vs-negative)" : "var(--vs-ink)";
  return (
    <div
      className="rounded-2xl p-4 border"
      style={{
        background: highlight ? "var(--vs-paper)" : "var(--vs-parchment)",
        borderColor: highlight ? "var(--vs-line-2)" : "var(--vs-line)",
        boxShadow: highlight ? "var(--vs-shadow-1)" : "none",
      }}
    >
      <div className="eyebrow mb-1.5">{label}</div>
      <div className="num leading-none" style={{ fontSize: 30, fontWeight: 500, color }}>
        {value}
      </div>
    </div>
  );
}
