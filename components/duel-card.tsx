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

  const status =
    duel.status === "live"
      ? { label: "Live", cls: "text-profit", dot: "bg-profit" }
      : duel.status === "upcoming"
        ? { label: "Upcoming", cls: "text-dim", dot: "bg-[var(--color-border-strong)]" }
        : {
            label: duel.winner === "A" ? `${a.name} won` : `${b.name} won`,
            cls: "text-warn",
            dot: "bg-warn",
          };

  return (
    <Link
      href={`/duels/${duel.id}`}
      className="surface block p-5 transition-colors hover:bg-[var(--color-surface-2)] hover:border-[var(--color-border-strong)]"
    >
      <div className="flex items-center justify-between mb-5">
        <div className={`flex items-center gap-1.5 text-[11px] ${status.cls}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot} ${duel.status === "live" ? "animate-pulse" : ""}`} />
          <span className="font-medium">{status.label}</span>
        </div>
        <span className="mono text-[10px] text-dim">
          {duel.status === "live"
            ? `${fmtCountdown(duel.endsAt)} left`
            : duel.status === "upcoming"
              ? `in ${fmtCountdown(duel.startsAt)}`
              : "settled"}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <AgentAvatar letter={a.avatar} strategy={a.strategy} />
          <div className="min-w-0">
            <div className="font-semibold text-[15px] truncate">{a.name}</div>
            <div className="text-[11px] text-dim truncate">{a.strategy}</div>
          </div>
        </div>
        <div className="text-faint text-[10px] mono px-2">VS</div>
        <div className="flex items-center gap-3 min-w-0 justify-end text-right">
          <div className="min-w-0">
            <div className="font-semibold text-[15px] truncate">{b.name}</div>
            <div className="text-[11px] text-dim truncate">{b.strategy}</div>
          </div>
          <AgentAvatar letter={b.avatar} strategy={b.strategy} />
        </div>
      </div>

      {duel.status !== "upcoming" && (
        <div className="mt-5 grid grid-cols-2 gap-2 mono text-[13px]">
          <div
            className={`rounded-md px-3 py-2 border border-[var(--color-border)] ${ahead === "A" ? "ring-human" : ""}`}
          >
            <span className="text-faint text-[10px]">A&nbsp;</span>
            <span className={duel.scoreA >= 0 ? "text-profit" : "text-loss"}>
              {fmtPct(duel.scoreA)}
            </span>
          </div>
          <div
            className={`rounded-md px-3 py-2 border border-[var(--color-border)] text-right ${ahead === "B" ? "ring-ai" : ""}`}
          >
            <span className={duel.scoreB >= 0 ? "text-profit" : "text-loss"}>
              {fmtPct(duel.scoreB)}
            </span>
            <span className="text-faint text-[10px]">&nbsp;B</span>
          </div>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-3 text-[12px]">
          <span className="mono text-human">{a.name.slice(0, 4)} {yesPct}¢</span>
          <span className="text-faint">·</span>
          <span className="mono text-ai">{b.name.slice(0, 4)} {noPct}¢</span>
        </div>
        <div className="text-[11px] text-dim mono">{fmtUsd(duel.volumeUsd)} vol</div>
      </div>
    </Link>
  );
}
