"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Duel, getAgent } from "@/lib/mock-data";
import { fmtUsd, cn } from "@/lib/format";

export function DuelMarket({ duel }: { duel: Duel }) {
  const a = getAgent(duel.agentA)!;
  const b = getAgent(duel.agentB)!;
  const [side, setSide] = useState<"A" | "B">("A");
  const [amount, setAmount] = useState("25");
  const { isConnected } = useAccount();

  const priceA = duel.marketPrice;
  const priceB = 1 - duel.marketPrice;
  const price = side === "A" ? priceA : priceB;
  const dollar = parseFloat(amount) || 0;
  const shares = price > 0 ? dollar / price : 0;
  const payout = shares;
  const profit = payout - dollar;

  const disabled = duel.status !== "live" || !isConnected || dollar <= 0;
  const sideColor = side === "A" ? "var(--color-human)" : "var(--color-ai)";

  return (
    <div className="surface-2 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13px] font-semibold tracking-tight">Stake on outcome</div>
        <div className="mono text-[10px] text-faint">
          {fmtUsd(duel.volumeUsd)} vol
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-5">
        <button
          type="button"
          onClick={() => setSide("A")}
          className={cn(
            "rounded-md py-2.5 px-3 border transition-all text-left",
            side === "A"
              ? "border-[var(--color-human)] bg-[rgba(106,141,255,0.08)]"
              : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
          )}
        >
          <div className="text-[11px] text-dim">{a.name}</div>
          <div className="mono text-[20px] font-semibold text-human leading-tight mt-0.5">
            {Math.round(priceA * 100)}¢
          </div>
        </button>
        <button
          type="button"
          onClick={() => setSide("B")}
          className={cn(
            "rounded-md py-2.5 px-3 border transition-all text-left",
            side === "B"
              ? "border-[var(--color-ai)] bg-[rgba(255,91,141,0.08)]"
              : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
          )}
        >
          <div className="text-[11px] text-dim">{b.name}</div>
          <div className="mono text-[20px] font-semibold text-ai leading-tight mt-0.5">
            {Math.round(priceB * 100)}¢
          </div>
        </button>
      </div>

      <label className="block text-[10px] text-faint uppercase tracking-wider mb-2">
        Amount (USDC)
      </label>
      <div className="flex gap-2 mb-3">
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          className="flex-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2 mono text-[16px] focus:outline-none focus:border-[var(--color-border-strong)]"
        />
        {[10, 50, 250].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setAmount(String(v))}
            className="px-2.5 rounded-md border border-[var(--color-border)] mono text-[11px] text-dim hover:text-fg hover:border-[var(--color-border-strong)] transition-colors"
          >
            ${v}
          </button>
        ))}
      </div>

      <div className="rounded-md border border-[var(--color-border)] px-3 py-2 mb-4 mono text-[11px] divide-y divide-[var(--color-border)]">
        <Row label="Shares" value={shares.toFixed(2)} />
        <Row label="If correct" value={fmtUsd(payout, 2)} tone="profit" />
        <Row label="P&L" value={fmtUsd(profit, 2)} tone={profit >= 0 ? "profit" : "loss"} />
      </div>

      <button
        type="button"
        disabled={disabled}
        style={{ backgroundColor: disabled ? undefined : sideColor }}
        className={cn(
          "w-full py-2.5 rounded-md font-semibold text-[14px] transition-all",
          disabled
            ? "bg-[var(--color-surface)] text-faint cursor-not-allowed"
            : "text-bg hover:opacity-90",
        )}
      >
        {!isConnected
          ? "Connect wallet to stake"
          : duel.status !== "live"
            ? "Market closed"
            : `Stake ${fmtUsd(dollar, 2)} on ${side === "A" ? a.name : b.name}`}
      </button>

      <p className="mt-3 text-[10px] text-faint leading-relaxed">
        Outcome resolves via on-chain settlement. Capital + stake escrowed in DuelMarket; winners claim pro-rata.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "profit" | "loss";
}) {
  return (
    <div className="flex justify-between py-1.5 first:pt-0 last:pb-0">
      <span className="text-faint">{label}</span>
      <span className={tone === "profit" ? "text-profit" : tone === "loss" ? "text-loss" : ""}>
        {value}
      </span>
    </div>
  );
}
