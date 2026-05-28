"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { formatUnits, parseUnits, maxUint256, type Address } from "viem";
import { Duel, getAgent } from "@/lib/mock-data";
import { fmtUsd, cn } from "@/lib/format";
import { CONTRACTS } from "@/lib/contracts";
import { DEMO_MARKET_ABI, ERC20_ABI } from "@/lib/abis";
import { useToast } from "./toaster";
import { AgentAvatar } from "./agent-avatar";

const USDC_DECIMALS = 6;

type Props = {
  duel: Duel;
  marketAddr: Address;
  open: boolean;
  initialSide: "A" | "B";
  initialAmount: string;
  onClose: () => void;
};

/// Slide-up modal that mirrors the inline DuelMarket flow but with more
/// space for the payout simulation, transaction status, and a "share" CTA
/// after confirmation. This is the moment we want a judge / viewer to see
/// during the demo video.
export function StakeModal({ duel, marketAddr, open, initialSide, initialAmount, onClose }: Props) {
  const a = getAgent(duel.agentA)!;
  const b = getAgent(duel.agentB)!;
  const toast = useToast();
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [side, setSide] = useState<"A" | "B">(initialSide);
  const [amount, setAmount] = useState(initialAmount);

  useEffect(() => {
    if (open) {
      setSide(initialSide);
      setAmount(initialAmount);
    }
  }, [open, initialSide, initialAmount]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const reads = useReadContracts({
    contracts: address
      ? [
          { address: marketAddr, abi: DEMO_MARKET_ABI, functionName: "priceA" },
          { address: marketAddr, abi: DEMO_MARKET_ABI, functionName: "poolA" },
          { address: marketAddr, abi: DEMO_MARKET_ABI, functionName: "poolB" },
          { address: CONTRACTS.usdc, abi: ERC20_ABI, functionName: "balanceOf", args: [address] },
          {
            address: CONTRACTS.usdc,
            abi: [{
              type: "function",
              name: "allowance",
              stateMutability: "view",
              inputs: [{ type: "address" }, { type: "address" }],
              outputs: [{ type: "uint256" }],
            }] as const,
            functionName: "allowance",
            args: [address, marketAddr],
          },
        ]
      : [],
    query: { enabled: !!address && open, refetchInterval: 6_000 },
  });

  const priceABps = (reads.data?.[0]?.result as bigint | undefined) ?? 5000n;
  const poolA = (reads.data?.[1]?.result as bigint | undefined) ?? 0n;
  const poolB = (reads.data?.[2]?.result as bigint | undefined) ?? 0n;
  const usdcBalance = (reads.data?.[3]?.result as bigint | undefined) ?? 0n;
  const allowance = (reads.data?.[4]?.result as bigint | undefined) ?? 0n;

  const priceA = Number(priceABps) / 10_000;
  const priceB = 1 - priceA;
  const price = side === "A" ? priceA : priceB;
  const dollar = parseFloat(amount) || 0;
  const amountWei = dollar > 0 ? parseUnits(amount || "0", USDC_DECIMALS) : 0n;
  const shares = price > 0 ? dollar / price : 0;
  const payout = shares;
  const profit = payout - dollar;

  const approveTx = useWriteContract();
  const approveReceipt = useWaitForTransactionReceipt({ hash: approveTx.data });
  const stakeTx = useWriteContract();
  const stakeReceipt = useWaitForTransactionReceipt({ hash: stakeTx.data });

  useEffect(() => {
    if (approveReceipt.isSuccess) {
      toast.push({ kind: "success", title: "USDC approved", body: "Ready to stake." });
      reads.refetch();
    }
  }, [approveReceipt.isSuccess]);

  useEffect(() => {
    if (stakeReceipt.isSuccess) {
      toast.push({
        kind: "success",
        title: `Staked ${fmtUsd(dollar, 2)} on ${side === "A" ? a.name : b.name}`,
        body: stakeTx.data ? `tx ${stakeTx.data.slice(0, 10)}…` : undefined,
        href: stakeTx.data ? `https://explorer.sepolia.mantle.xyz/tx/${stakeTx.data}` : undefined,
      });
      reads.refetch();
    }
  }, [stakeReceipt.isSuccess]);

  const needsApproval = isConnected && allowance < amountWei && amountWei > 0n;
  const approving = approveTx.isPending || approveReceipt.isLoading;
  const staking = stakeTx.isPending || stakeReceipt.isLoading;
  const insufficient = isConnected && usdcBalance < amountWei && amountWei > 0n;
  const sideAgent = side === "A" ? a : b;
  const sideColor = side === "A" ? "var(--vs-machine)" : "var(--vs-human)";

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Stake on duel outcome"
      className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center p-0 sm:p-5 animate-overlay"
      style={{ background: "rgba(26,31,46,0.42)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="surface-paper w-full sm:max-w-[460px] p-6 sm:p-7 animate-modal rounded-t-3xl sm:rounded-3xl"
        style={{ boxShadow: "var(--vs-shadow-3)" }}
      >
        {/* header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="eyebrow mb-1.5">Stake on outcome</div>
            <div className="text-ink text-[18px] font-semibold tracking-tight leading-tight">
              <span style={{ color: a.kind === "human" ? "var(--vs-human-deep)" : "var(--vs-machine-deep)" }}>
                <em style={{ fontStyle: "italic", fontWeight: 400 }}>{a.name}</em>
              </span>
              <span className="text-ink-3" style={{ fontWeight: 300 }}> vs </span>
              <span style={{ color: b.kind === "human" ? "var(--vs-human-deep)" : "var(--vs-machine-deep)" }}>
                <em style={{ fontStyle: "italic", fontWeight: 400 }}>{b.name}</em>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-ink-3 hover:text-ink transition-colors -mr-2 -mt-1 p-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        {/* side picker with avatars */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {(["A", "B"] as const).map((s) => {
            const ag = s === "A" ? a : b;
            const selected = side === s;
            const tint = ag.kind === "human" ? "var(--vs-human)" : "var(--vs-machine)";
            const wash = ag.kind === "human" ? "var(--vs-human-wash)" : "var(--vs-machine-wash)";
            const deep = ag.kind === "human" ? "var(--vs-human-deep)" : "var(--vs-machine-deep)";
            const price = s === "A" ? priceA : priceB;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className="rounded-2xl p-3.5 border text-left transition-all duration-150"
                style={{
                  background: selected ? wash : "var(--vs-parchment)",
                  borderColor: selected ? tint : "var(--vs-line)",
                  boxShadow: selected ? `0 0 0 3px ${wash}` : "none",
                }}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <AgentAvatar letter={ag.avatar} kind={ag.kind} strategy={ag.strategy} size="sm" />
                  <div className="text-[12.5px] font-semibold text-ink truncate">{ag.name}</div>
                </div>
                <div className="num leading-none" style={{ fontSize: 24, fontWeight: 500, color: deep }}>
                  {Math.round(price * 100)}¢
                </div>
              </button>
            );
          })}
        </div>

        {/* amount */}
        <label className="eyebrow block mb-2">
          Amount (USDC)
          {isConnected && (
            <span className="float-right mono text-light normal-case tracking-normal">
              bal: {Number(formatUnits(usdcBalance, USDC_DECIMALS)).toFixed(2)}
            </span>
          )}
        </label>
        <div className="flex gap-2 mb-4">
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            className="flex-1 rounded-xl border border-line bg-paper px-3.5 py-3 mono text-[18px] text-ink focus:outline-none focus:border-line-2"
          />
          {[10, 50, 250].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAmount(String(v))}
              className="px-3 rounded-xl border border-line mono text-[11px] text-ink-2 hover:text-ink hover:border-line-2 transition-colors"
            >
              ${v}
            </button>
          ))}
        </div>

        {/* payout simulator */}
        <div className="rounded-2xl border border-line bg-parchment p-4 mb-5">
          <div className="eyebrow mb-3">Payout simulator</div>
          <SimRow label="Shares" value={shares.toFixed(2)} />
          <SimRow label="If correct, payout" value={fmtUsd(payout, 2)} tone="positive" />
          <SimRow label="P&L" value={fmtUsd(profit, 2)} tone={profit >= 0 ? "positive" : "negative"} />
          <SimRow label="Market pool" value={fmtUsd(Number(formatUnits(poolA + poolB, USDC_DECIMALS)), 2)} />
        </div>

        {/* error */}
        {(approveTx.error || stakeTx.error) && (
          <div className="text-[12px] text-negative mb-3 break-words">
            {(approveTx.error || stakeTx.error)?.message.split("\n")[0]}
          </div>
        )}

        {/* CTA */}
        {!isConnected ? (
          <button
            type="button"
            onClick={() => openConnectModal?.()}
            className="rk-cta-primary w-full justify-center"
          >
            Connect wallet to stake
          </button>
        ) : insufficient ? (
          <a
            href="/faucet"
            className="rk-cta-primary w-full justify-center"
            style={{ background: "var(--vs-ochre-deep)" }}
          >
            Need USDC → claim from faucet
          </a>
        ) : needsApproval ? (
          <button
            type="button"
            disabled={approving || dollar <= 0}
            onClick={() =>
              approveTx.writeContract({
                abi: ERC20_ABI,
                address: CONTRACTS.usdc,
                functionName: "approve",
                args: [marketAddr, maxUint256],
              })
            }
            className="rk-cta-primary w-full justify-center"
          >
            {approving ? "Approving USDC…" : "Approve USDC"}
          </button>
        ) : (
          <button
            type="button"
            disabled={staking || dollar <= 0}
            onClick={() =>
              stakeTx.writeContract({
                abi: DEMO_MARKET_ABI,
                address: marketAddr,
                functionName: "stake",
                args: [side === "A" ? 1 : 2, amountWei],
              })
            }
            className="rk-cta-primary w-full justify-center"
            style={{ background: sideColor, color: "white" }}
          >
            {staking
              ? "Confirming…"
              : stakeReceipt.isSuccess
                ? "Staked ✓"
                : `Stake ${fmtUsd(dollar, 2)} on ${sideAgent.name}`}
          </button>
        )}

        <p className="text-[11px] text-ink-3 mt-3 leading-relaxed text-center">
          Parimutuel · winners split losers&apos; stakes pro-rata · resolves on-chain when the duel ends.
        </p>
      </div>
    </div>
  );
}

function SimRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="flex justify-between py-1 first:pt-0 last:pb-0 text-[13px] mono">
      <span className="text-ink-3">{label}</span>
      <span
        className="num"
        style={{
          color:
            tone === "positive"
              ? "var(--vs-positive)"
              : tone === "negative"
                ? "var(--vs-negative)"
                : "var(--vs-ink)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
