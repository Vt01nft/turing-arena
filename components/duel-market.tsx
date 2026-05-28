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
import { CONTRACTS, marketFor } from "@/lib/contracts";
import { DEMO_MARKET_ABI, ERC20_ABI } from "@/lib/abis";

const USDC_DECIMALS = 6;

export function DuelMarket({ duel }: { duel: Duel }) {
  const onchainAddr = duel.onchain ? marketFor(duel.id) : undefined;

  return onchainAddr ? (
    <OnchainMarket duel={duel} marketAddr={onchainAddr} />
  ) : (
    <MockMarket duel={duel} />
  );
}

// ────────────────────────────────────────────────────────────────────────────
// On-chain market (real bet flow)
// ────────────────────────────────────────────────────────────────────────────

function OnchainMarket({ duel, marketAddr }: { duel: Duel; marketAddr: Address }) {
  const a = getAgent(duel.agentA)!;
  const b = getAgent(duel.agentB)!;
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [side, setSide] = useState<"A" | "B">("A");
  const [amount, setAmount] = useState("25");

  const marketReads = useReadContracts({
    contracts: [
      { address: marketAddr, abi: DEMO_MARKET_ABI, functionName: "poolA" },
      { address: marketAddr, abi: DEMO_MARKET_ABI, functionName: "poolB" },
      { address: marketAddr, abi: DEMO_MARKET_ABI, functionName: "priceA" },
      { address: marketAddr, abi: DEMO_MARKET_ABI, functionName: "resolved" },
      { address: marketAddr, abi: DEMO_MARKET_ABI, functionName: "winningSide" },
      { address: marketAddr, abi: DEMO_MARKET_ABI, functionName: "isOpen" },
    ],
    query: { refetchInterval: 12_000 },
  });

  const userReads = useReadContracts({
    contracts: address
      ? [
          {
            address: CONTRACTS.usdc,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [address],
          },
          {
            address: CONTRACTS.usdc,
            abi: [
              {
                type: "function",
                name: "allowance",
                stateMutability: "view",
                inputs: [{ type: "address" }, { type: "address" }],
                outputs: [{ type: "uint256" }],
              },
            ] as const,
            functionName: "allowance",
            args: [address, marketAddr],
          },
          {
            address: marketAddr,
            abi: DEMO_MARKET_ABI,
            functionName: "sharesA",
            args: [address],
          },
          {
            address: marketAddr,
            abi: DEMO_MARKET_ABI,
            functionName: "sharesB",
            args: [address],
          },
        ]
      : [],
    query: { enabled: !!address, refetchInterval: 12_000 },
  });

  const poolA = (marketReads.data?.[0]?.result as bigint | undefined) ?? 0n;
  const poolB = (marketReads.data?.[1]?.result as bigint | undefined) ?? 0n;
  const priceABps = (marketReads.data?.[2]?.result as bigint | undefined) ?? 5000n;
  const resolved = (marketReads.data?.[3]?.result as boolean | undefined) ?? false;
  const winner = (marketReads.data?.[4]?.result as number | undefined) ?? 0;
  const isOpen = (marketReads.data?.[5]?.result as boolean | undefined) ?? true;

  const usdcBalance = (userReads.data?.[0]?.result as bigint | undefined) ?? 0n;
  const allowance = (userReads.data?.[1]?.result as bigint | undefined) ?? 0n;
  const userSharesA = (userReads.data?.[2]?.result as bigint | undefined) ?? 0n;
  const userSharesB = (userReads.data?.[3]?.result as bigint | undefined) ?? 0n;

  const dollar = parseFloat(amount) || 0;
  const amountWei = parseUnits(amount || "0", USDC_DECIMALS);
  const priceA = Number(priceABps) / 10_000;
  const priceB = 1 - priceA;
  const price = side === "A" ? priceA : priceB;
  const shares = price > 0 ? dollar / price : 0;
  const payout = shares;
  const profit = payout - dollar;

  const sideColor = side === "A" ? "var(--color-human)" : "var(--color-ai)";
  const needsApproval = isConnected && allowance < amountWei && amountWei > 0n;

  // Tx state machines
  const approveTx = useWriteContract();
  const approveReceipt = useWaitForTransactionReceipt({ hash: approveTx.data });
  const stakeTx = useWriteContract();
  const stakeReceipt = useWaitForTransactionReceipt({ hash: stakeTx.data });
  const claimTx = useWriteContract();
  const claimReceipt = useWaitForTransactionReceipt({ hash: claimTx.data });

  // Refetch reads when any tx confirms
  useEffect(() => {
    if (approveReceipt.isSuccess || stakeReceipt.isSuccess || claimReceipt.isSuccess) {
      marketReads.refetch();
      userReads.refetch();
    }
  }, [approveReceipt.isSuccess, stakeReceipt.isSuccess, claimReceipt.isSuccess]);

  const approving = approveTx.isPending || approveReceipt.isLoading;
  const staking = stakeTx.isPending || stakeReceipt.isLoading;
  const claiming = claimTx.isPending || claimReceipt.isLoading;

  // Resolved view
  if (resolved && winner > 0) {
    const winName = winner === 1 ? a.name : b.name;
    const winColor = winner === 1 ? "text-human" : "text-ai";
    const userWon = winner === 1 ? userSharesA > 0n : userSharesB > 0n;
    const myShares = winner === 1 ? userSharesA : userSharesB;
    const winnerPool = winner === 1 ? poolA : poolB;
    const totalPool = poolA + poolB;
    const myPayout =
      winnerPool > 0n ? (myShares * totalPool) / winnerPool : 0n;

    return (
      <div className="surface-2 p-5">
        <div className="text-[11px] uppercase tracking-wider text-faint mono mb-2">Market resolved</div>
        <div className={`text-[22px] font-semibold ${winColor} mb-3`}>{winName} won</div>
        {userWon ? (
          <>
            <div className="mono text-[12px] text-dim mb-3">
              Your payout: <span className="text-profit">{fmtUsd(Number(formatUnits(myPayout, USDC_DECIMALS)), 2)}</span>
            </div>
            <button
              type="button"
              disabled={!isConnected || claiming || myShares === 0n}
              onClick={() =>
                claimTx.writeContract({
                  abi: DEMO_MARKET_ABI,
                  address: marketAddr,
                  functionName: "claim",
                })
              }
              className="w-full py-2.5 rounded-md bg-fg text-bg font-semibold text-[14px] disabled:bg-[var(--color-surface)] disabled:text-faint transition-colors"
            >
              {claimReceipt.isSuccess
                ? "Claimed ✓"
                : claiming
                  ? "Claiming…"
                  : myShares === 0n
                    ? "Nothing to claim"
                    : "Claim payout"}
            </button>
          </>
        ) : (
          <div className="text-[12px] text-dim">
            You didn&apos;t hold winning shares.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="surface-2 p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[13px] font-semibold tracking-tight">Stake on outcome</div>
        <span className="text-[10px] mono text-profit flex items-center gap-1">
          <span className="h-1 w-1 rounded-full bg-profit animate-pulse" /> ON-CHAIN
        </span>
      </div>
      <div className="mono text-[12px] text-ink-3 mb-4">
        ${(Number(formatUnits(poolA + poolB, USDC_DECIMALS))).toFixed(2)} volume · {fmtAddr(marketAddr)}
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
          {userSharesA > 0n && (
            <div className="text-[10px] text-faint mono mt-0.5">
              you: ${Number(formatUnits(userSharesA, USDC_DECIMALS)).toFixed(2)}
            </div>
          )}
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
          {userSharesB > 0n && (
            <div className="text-[10px] text-faint mono mt-0.5">
              you: ${Number(formatUnits(userSharesB, USDC_DECIMALS)).toFixed(2)}
            </div>
          )}
        </button>
      </div>

      <label className="block eyebrow mb-2">
        Amount (TAUSDC)
        {isConnected && (
          <span className="float-right mono text-ink-3 normal-case tracking-normal text-[12px] font-medium">
            bal: {Number(formatUnits(usdcBalance, USDC_DECIMALS)).toFixed(2)}
          </span>
        )}
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

      <div className="rounded-md border border-[var(--color-border)] px-3 py-2 mb-4 mono text-[13px] divide-y divide-[var(--color-border)]">
        <Row label="Shares" value={shares.toFixed(2)} />
        <Row label="If correct" value={fmtUsd(payout, 2)} tone="profit" />
        <Row label="P&L" value={fmtUsd(profit, 2)} tone={profit >= 0 ? "profit" : "loss"} />
      </div>

      {(approveTx.error || stakeTx.error || claimTx.error) && (
        <div className="text-[11px] text-loss mb-3 break-all">
          {(approveTx.error || stakeTx.error || claimTx.error)?.message.split("\n")[0]}
        </div>
      )}

      {!isConnected ? (
        <button
          type="button"
          onClick={() => openConnectModal?.()}
          className="w-full py-2.5 rounded-md bg-fg text-bg font-semibold text-[14px] hover:opacity-90 transition-opacity"
        >
          Connect wallet to stake
        </button>
      ) : !isOpen ? (
        <button
          type="button"
          disabled
          className="w-full py-2.5 rounded-md bg-[var(--color-surface)] text-faint font-semibold text-[14px] cursor-not-allowed"
        >
          Market closed
        </button>
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
          className="w-full py-2.5 rounded-md bg-fg text-bg font-semibold text-[14px] disabled:bg-[var(--color-surface)] disabled:text-faint transition-colors"
        >
          {approving ? "Approving USDC…" : "Approve USDC"}
        </button>
      ) : (
        <button
          type="button"
          disabled={staking || dollar <= 0 || usdcBalance < amountWei}
          style={{ backgroundColor: staking || dollar <= 0 || usdcBalance < amountWei ? undefined : sideColor }}
          onClick={() =>
            stakeTx.writeContract({
              abi: DEMO_MARKET_ABI,
              address: marketAddr,
              functionName: "stake",
              args: [side === "A" ? 1 : 2, amountWei],
            })
          }
          className={cn(
            "w-full py-2.5 rounded-md font-semibold text-[14px] transition-all",
            staking || dollar <= 0 || usdcBalance < amountWei
              ? "bg-[var(--color-surface)] text-faint cursor-not-allowed"
              : "text-bg hover:opacity-90",
          )}
        >
          {staking
            ? "Confirming…"
            : usdcBalance < amountWei
              ? "Insufficient USDC (drip on /faucet)"
              : `Stake ${fmtUsd(dollar, 2)} on ${side === "A" ? a.name : b.name}`}
        </button>
      )}

      <p className="mt-3 text-caption">
        Parimutuel pool · winners split losers&apos; stakes pro-rata · resolves on-chain when the duel ends.
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Mock market (for duels without an on-chain counterpart)
// ────────────────────────────────────────────────────────────────────────────

function MockMarket({ duel }: { duel: Duel }) {
  const a = getAgent(duel.agentA)!;
  const b = getAgent(duel.agentB)!;
  const [side, setSide] = useState<"A" | "B">("A");
  const [amount, setAmount] = useState("25");
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const priceA = duel.marketPrice;
  const priceB = 1 - duel.marketPrice;
  const price = side === "A" ? priceA : priceB;
  const dollar = parseFloat(amount) || 0;
  const shares = price > 0 ? dollar / price : 0;
  const payout = shares;
  const profit = payout - dollar;

  const disabled = duel.status !== "live" || (isConnected && dollar <= 0);
  const sideColor = side === "A" ? "var(--color-human)" : "var(--color-ai)";

  return (
    <div className="surface-2 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13px] font-semibold tracking-tight">Stake on outcome</div>
        <div className="mono text-[10px] text-faint">{fmtUsd(duel.volumeUsd)} vol · mock</div>
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

      <label className="block eyebrow mb-2">Amount (USDC)</label>
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

      <div className="rounded-md border border-[var(--color-border)] px-3 py-2 mb-4 mono text-[13px] divide-y divide-[var(--color-border)]">
        <Row label="Shares" value={shares.toFixed(2)} />
        <Row label="If correct" value={fmtUsd(payout, 2)} tone="profit" />
        <Row label="P&L" value={fmtUsd(profit, 2)} tone={profit >= 0 ? "profit" : "loss"} />
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={!isConnected ? () => openConnectModal?.() : undefined}
        style={{ backgroundColor: disabled || !isConnected ? undefined : sideColor }}
        className={cn(
          "w-full py-2.5 rounded-md font-semibold text-[14px] transition-all",
          disabled
            ? "bg-[var(--color-surface)] text-faint cursor-not-allowed"
            : !isConnected
              ? "bg-fg text-bg hover:opacity-90"
              : "text-bg hover:opacity-90",
        )}
      >
        {!isConnected
          ? "Connect wallet"
          : duel.status !== "live"
            ? "Market closed"
            : `Stake ${fmtUsd(dollar, 2)} on ${side === "A" ? a.name : b.name}`}
      </button>

      <p className="mt-3 text-caption">
        This duel uses mock prices - only duel-001 has a live on-chain market for now.
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

function fmtAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
