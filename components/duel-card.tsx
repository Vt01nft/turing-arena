import Link from "next/link";
import { Duel, getAgent } from "@/lib/mock-data";
import { fmtCountdown, fmtPct, fmtUsd } from "@/lib/format";
import { AgentAvatar } from "./agent-avatar";

export function DuelCard({ duel }: { duel: Duel }) {
  const a = getAgent(duel.agentA);
  const b = getAgent(duel.agentB);
  if (!a || !b) return null;

  const yesPct = Math.round(duel.marketPrice * 100);
  const noPct = 100 - yesPct;
  const ahead = duel.scoreA > duel.scoreB ? "A" : duel.scoreB > duel.scoreA ? "B" : null;

  const statusBadge =
    duel.status === "live"
      ? { label: "● LIVE", cls: "text-accent" }
      : duel.status === "upcoming"
        ? { label: "○ UPCOMING", cls: "text-dim" }
        : {
            label: duel.winner === "A" ? `${a.name.toUpperCase()} WON` : `${b.name.toUpperCase()} WON`,
            cls: "text-[var(--color-warn)]",
          };

  return (
    <Link
      href={`/duels/${duel.id}`}
      className="panel block p-5 transition-all hover:border-[var(--color-accent-dim)] hover:bg-[var(--color-bg-elev)]"
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`mono text-[10px] tracking-wider ${statusBadge.cls}`}>
          {statusBadge.label}
        </span>
        <span className="mono text-[10px] text-dim">
          {duel.status === "live"
            ? `${fmtCountdown(duel.endsAt)} left`
            : duel.status === "upcoming"
              ? `starts in ${fmtCountdown(duel.startsAt)}`
              : "settled"}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <AgentAvatar letter={a.avatar} strategy={a.strategy} />
          <div className="min-w-0">
            <div className="font-semibold truncate">{a.name}</div>
            <div className="text-xs text-dim truncate">{a.strategy}</div>
          </div>
        </div>
        <div className="mono text-xs text-dim px-2">VS</div>
        <div className="flex items-center gap-3 min-w-0 justify-end text-right">
          <div className="min-w-0">
            <div className="font-semibold truncate">{b.name}</div>
            <div className="text-xs text-dim truncate">{b.strategy}</div>
          </div>
          <AgentAvatar letter={b.avatar} strategy={b.strategy} />
        </div>
      </div>

      {duel.status !== "upcoming" && (
        <div className="mt-4 grid grid-cols-2 gap-2 mono text-sm">
          <div
            className={`rounded-md px-3 py-2 border border-[var(--color-border)] ${ahead === "A" ? "ring-accent" : ""}`}
          >
            <span className="text-dim text-xs">A&nbsp;</span>
            <span className={duel.scoreA >= 0 ? "text-accent" : "text-ai"}>
              {fmtPct(duel.scoreA)}
            </span>
          </div>
          <div
            className={`rounded-md px-3 py-2 border border-[var(--color-border)] text-right ${ahead === "B" ? "ring-accent" : ""}`}
          >
            <span className={duel.scoreB >= 0 ? "text-accent" : "text-ai"}>
              {fmtPct(duel.scoreB)}
            </span>
            <span className="text-dim text-xs">&nbsp;B</span>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-dim">market:</span>
          <span className="mono text-human">{a.name.slice(0, 4)} {yesPct}¢</span>
          <span className="text-dim">·</span>
          <span className="mono text-ai">{b.name.slice(0, 4)} {noPct}¢</span>
        </div>
        <div className="text-xs text-dim mono">{fmtUsd(duel.volumeUsd)} vol</div>
      </div>
    </Link>
  );
}
