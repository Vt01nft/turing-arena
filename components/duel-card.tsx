"use client";

import { useState } from "react";
import Link from "next/link";
import { Duel, getAgent } from "@/lib/mock-data";
import { fmtCountdown, fmtPct, fmtUsd } from "@/lib/format";
import { CONTRACTS, isDeployed } from "@/lib/contracts";
import { AgentAvatar } from "./agent-avatar";
import { StakeModal } from "./stake-modal";

export function DuelCard({ duel }: { duel: Duel }) {
  const [stakeOpen, setStakeOpen] = useState(false);
  const onchainAddr =
    duel.onchainMarket && isDeployed(CONTRACTS[duel.onchainMarket])
      ? CONTRACTS[duel.onchainMarket]
      : undefined;
  const a = getAgent(duel.agentA);
  const b = getAgent(duel.agentB);
  if (!a || !b) return null;

  const yesPct = Math.round(duel.marketPrice * 100);
  const noPct = 100 - yesPct;
  const ahead = duel.scoreA > duel.scoreB ? "A" : duel.scoreB > duel.scoreA ? "B" : null;

  const status =
    duel.status === "live"
      ? { label: "Live", color: "var(--vs-positive)" }
      : duel.status === "upcoming"
        ? { label: "Upcoming", color: "var(--vs-ink-3)" }
        : {
            label: duel.winner === "A" ? `${a.name} won` : `${b.name} won`,
            color: "var(--vs-ochre-deep)",
          };

  const matchTag =
    a.kind !== b.kind
      ? { label: "Human vs Agent", color: "var(--vs-lilac-deep)", bg: "var(--vs-lilac-soft)" }
      : a.kind === "human"
        ? { label: "Human vs Human", color: "var(--vs-human-deep)", bg: "var(--vs-human-wash)" }
        : { label: "Agent vs Agent", color: "var(--vs-machine-deep)", bg: "var(--vs-machine-wash)" };

  return (
    <>
    <Link
      href={`/duels/${duel.id}`}
      className="surface-paper block p-5 transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[var(--vs-shadow-2)]"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-medium"
            style={{ color: status.color }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: status.color }}
            />
            {status.label}
          </span>
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
            style={{ color: matchTag.color, background: matchTag.bg }}
          >
            {matchTag.label}
          </span>
        </div>
        <span className="mono text-[10px] text-light">
          {duel.status === "live"
            ? `${fmtCountdown(duel.endsAt)} left`
            : duel.status === "upcoming"
              ? `in ${fmtCountdown(duel.startsAt)}`
              : "settled"}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <AgentAvatar letter={a.avatar} kind={a.kind} strategy={a.strategy} />
          <div className="min-w-0">
            <div className="font-semibold text-[15px] truncate text-ink">{a.name}</div>
            <div className="text-[11px] text-ink-3 truncate">{a.strategy}</div>
          </div>
        </div>
        <div
          className="text-[10px] mono px-2"
          style={{ color: "var(--vs-ink-4)" }}
        >
          VS
        </div>
        <div className="flex items-center gap-3 min-w-0 justify-end text-right">
          <div className="min-w-0">
            <div className="font-semibold text-[15px] truncate text-ink">{b.name}</div>
            <div className="text-[11px] text-ink-3 truncate">{b.strategy}</div>
          </div>
          <AgentAvatar letter={b.avatar} kind={b.kind} strategy={b.strategy} />
        </div>
      </div>

      {duel.status !== "upcoming" && (
        <div className="mt-5 grid grid-cols-2 gap-2 mono text-[13px]">
          <div
            className="rounded-md px-3 py-2 border"
            style={{
              borderColor: ahead === "A" ? "var(--vs-machine)" : "var(--vs-line)",
              background: ahead === "A" ? "var(--vs-machine-wash)" : "transparent",
            }}
          >
            <span className="text-light text-[10px]">A&nbsp;</span>
            <span style={{ color: duel.scoreA >= 0 ? "var(--vs-positive)" : "var(--vs-negative)" }}>
              {fmtPct(duel.scoreA)}
            </span>
          </div>
          <div
            className="rounded-md px-3 py-2 border text-right"
            style={{
              borderColor: ahead === "B" ? "var(--vs-human)" : "var(--vs-line)",
              background: ahead === "B" ? "var(--vs-human-wash)" : "transparent",
            }}
          >
            <span style={{ color: duel.scoreB >= 0 ? "var(--vs-positive)" : "var(--vs-negative)" }}>
              {fmtPct(duel.scoreB)}
            </span>
            <span className="text-light text-[10px]">&nbsp;B</span>
          </div>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-line flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-[12px]">
          <span className="mono" style={{ color: "var(--vs-machine-deep)" }}>
            {a.name.slice(0, 4)} {yesPct}¢
          </span>
          <span className="text-light">·</span>
          <span className="mono" style={{ color: "var(--vs-human-deep)" }}>
            {b.name.slice(0, 4)} {noPct}¢
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[11px] text-light mono">{fmtUsd(duel.volumeUsd)} vol</div>
          {duel.status === "live" && onchainAddr && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setStakeOpen(true);
              }}
              className="ml-1 px-3 py-1 rounded-full bg-ink text-paper text-[11px] font-semibold hover:bg-ink-2 transition-colors"
            >
              Stake
            </button>
          )}
        </div>
      </div>
    </Link>
    {onchainAddr && (
      <StakeModal
        duel={duel}
        marketAddr={onchainAddr}
        open={stakeOpen}
        initialSide="A"
        initialAmount="25"
        onClose={() => setStakeOpen(false)}
      />
    )}
    </>
  );
}
