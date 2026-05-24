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

  return (
    <div className="panel-elev p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold tracking-tight">Stake on outcome</div>
        <div className="mono text-[10px] text-dim">
          {fmtUsd(duel.volumeUsd)} volume · {Math.round(duel.marketYesShares + duel.marketNoShares).toLocaleString()} shares
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          type="button"
          onClick={() => setSide("A")}
          className={cn(
            "rounded-md py-3 border transition-all text-left px-3",
            side === "A"
              ? "border-[var(--color-human)] bg-[var(--color-human)]/10 ring-1 ring-[var(--color-human)]/50"
              : "border-[var(--color-border)] hover:border-[var(--color-fg-dim)]",
          )}
        >
          <div className="text-xs text-dim">{a.name} wins</div>
          <div className="mono text-xl font-semibold text-human">
            {Math.round(priceA * 100)}¢
          </div>
        </button>
        <button
          type="button"
          onClick={() => setSide("B")}
          className={cn(
            "rounded-md py-3 border transition-all text-left px-3",
            side === "B"
              ? "border-[var(--color-ai)] bg-[var(--color-ai)]/10 ring-1 ring-[var(--color-ai)]/50"
              : "border-[var(--color-border)] hover:border-[var(--color-fg-dim)]",
          )}
        >
          <div className="text-xs text-dim">{b.name} wins</div>
          <div className="mono text-xl font-semibold text-ai">
            {Math.round(priceB * 100)}¢
          </div>
        </button>
      </div>

      <label className="block text-xs text-dim uppercase tracking-wider mono mb-2">
        Amount (USDC)
      </label>
      <div className="flex gap-2 mb-3">
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          className="flex-1 panel px-3 py-2.5 mono text-lg focus:outline-none focus:border-[var(--color-accent)]"
        />
        {[10, 50, 250].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setAmount(String(v))}
            className="px-3 py-2 rounded-md border border-[var(--color-border)] mono text-xs text-dim hover:text-fg hover:border-[var(--color-fg-dim)] transition-colors"
          >
            ${v}
          </button>
        ))}
      </div>

      <div className="panel px-3 py-2.5 mb-4 mono text-xs">
        <Row label="Shares" value={shares.toFixed(2)} />
        <Row label="If correct, payout" value={fmtUsd(payout, 2)} tone="accent" />
        <Row label="Profit" value={fmtUsd(profit, 2)} tone={profit >= 0 ? "accent" : "ai"} />
      </div>

      <button
        type="button"
        disabled={disabled}
        className={cn(
          "w-full py-3 rounded-md font-semibold transition-all",
          disabled
            ? "bg-[var(--color-panel)] text-dim cursor-not-allowed"
            : "bg-accent text-bg hover:opacity-90",
        )}
      >
        {!isConnected
          ? "Connect wallet to stake"
          : duel.status !== "live"
            ? "Market closed"
            : `Stake ${fmtUsd(dollar, 2)} on ${side === "A" ? a.name : b.name}`}
      </button>

      <p className="mt-3 text-[11px] text-dim leading-relaxed">
        Outcome resolves via on-chain settlement when the duel ends. Capital and stake
        are escrowed in the DuelMarket contract; winners claim pro-rata.
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
  tone?: "accent" | "ai";
}) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-dim">{label}</span>
      <span className={tone === "accent" ? "text-accent" : tone === "ai" ? "text-ai" : ""}>
        {value}
      </span>
    </div>
  );
}
