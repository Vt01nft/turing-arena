"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  useAccount,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatUnits, type Address } from "viem";
import { CONTRACTS, isDeployed } from "@/lib/contracts";
import { DEMO_MARKET_ABI, ERC20_ABI } from "@/lib/abis";
import { getDuel, getAgent } from "@/lib/mock-data";
import { fmtUsd } from "@/lib/format";
import { useToast } from "./toaster";
import { AgentAvatar } from "./agent-avatar";

const USDC_DECIMALS = 6;
const DUEL_ID = "duel-001"; // the one with an on-chain market

export function MyBets() {
  const { address, isConnected } = useAccount();
  const toast = useToast();
  const market = CONTRACTS.demoMarket001 as Address;
  const hasMarket = isDeployed(market);
  const duel = getDuel(DUEL_ID);

  const reads = useReadContracts({
    contracts:
      address && hasMarket
        ? [
            { address: CONTRACTS.usdc, abi: ERC20_ABI, functionName: "balanceOf", args: [address] },
            { address: market, abi: DEMO_MARKET_ABI, functionName: "sharesA", args: [address] },
            { address: market, abi: DEMO_MARKET_ABI, functionName: "sharesB", args: [address] },
            { address: market, abi: DEMO_MARKET_ABI, functionName: "poolA" },
            { address: market, abi: DEMO_MARKET_ABI, functionName: "poolB" },
            { address: market, abi: DEMO_MARKET_ABI, functionName: "resolved" },
            { address: market, abi: DEMO_MARKET_ABI, functionName: "winningSide" },
          ]
        : [],
    query: { enabled: !!address && hasMarket, refetchInterval: 10_000 },
  });

  const balance = (reads.data?.[0]?.result as bigint | undefined) ?? 0n;
  const sharesA = (reads.data?.[1]?.result as bigint | undefined) ?? 0n;
  const sharesB = (reads.data?.[2]?.result as bigint | undefined) ?? 0n;
  const poolA = (reads.data?.[3]?.result as bigint | undefined) ?? 0n;
  const poolB = (reads.data?.[4]?.result as bigint | undefined) ?? 0n;
  const resolved = (reads.data?.[5]?.result as boolean | undefined) ?? false;
  const winningSide = (reads.data?.[6]?.result as number | undefined) ?? 0;

  const claimTx = useWriteContract();
  const claimReceipt = useWaitForTransactionReceipt({ hash: claimTx.data });

  // On-chain bet history (real Stake events for this wallet)
  type HistoryBet = { side: number; amount: string; txHash: string; timestamp: number };
  const [history, setHistory] = useState<HistoryBet[]>([]);
  useEffect(() => {
    if (!address) {
      setHistory([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/bets/history?address=${address}`, { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && json.ok) setHistory(json.bets ?? []);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [address, claimReceipt.isSuccess]);

  const [prevBalance, setPrevBalance] = useState<bigint | null>(null);
  useEffect(() => {
    if (claimReceipt.isSuccess) {
      toast.push({ kind: "success", title: "Winnings claimed", body: "Your TAUSDC balance just went up." });
      reads.refetch();
    }
  }, [claimReceipt.isSuccess]);

  // Track balance increases for a celebratory toast
  useEffect(() => {
    if (prevBalance !== null && balance > prevBalance) {
      const delta = Number(formatUnits(balance - prevBalance, USDC_DECIMALS));
      if (delta > 0.01) {
        toast.push({ kind: "success", title: `+${fmtUsd(delta, 2)} TAUSDC`, body: "Balance increased." });
      }
    }
    setPrevBalance(balance);
  }, [balance]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!duel) return null;
  const cA = getAgent(duel.agentA);
  const cB = getAgent(duel.agentB);

  const hasBetA = sharesA > 0n;
  const hasBetB = sharesB > 0n;
  const hasAnyBet = hasBetA || hasBetB;

  const totalPool = poolA + poolB;
  function payoutFor(side: 1 | 2): bigint {
    const mine = side === 1 ? sharesA : sharesB;
    const winnerPool = side === 1 ? poolA : poolB;
    if (winnerPool === 0n) return 0n;
    return (mine * totalPool) / winnerPool;
  }

  if (!isConnected) {
    return (
      <div className="surface-paper p-8 text-center">
        <div className="text-ink font-semibold text-[18px] mb-2">Connect your wallet</div>
        <p className="text-ink-2 text-[14px] max-w-md mx-auto">
          Your bets, positions, and TAUSDC balance show up here once you connect a Mantle Sepolia wallet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance card */}
      <div className="surface-paper p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow mb-1.5">Turing Arena USDC balance</div>
          <div className="num text-ink" style={{ fontSize: 40, fontWeight: 500, lineHeight: 1 }}>
            {fmtUsd(Number(formatUnits(balance, USDC_DECIMALS)), 2)}
          </div>
          <div className="text-[12px] text-ink-3 mt-1.5">TAUSDC · demo token · zero real value</div>
        </div>
        <Link
          href="/faucet"
          className="px-5 py-2.5 rounded-full bg-paper border border-line-2 text-ink font-medium text-[14px] hover:bg-cream transition-colors"
        >
          Claim more TAUSDC
        </Link>
      </div>

      {/* Active bet */}
      <div>
        <div className="eyebrow mb-3">Your bets</div>
        {!hasAnyBet ? (
          <div className="surface-paper p-8 text-center">
            <p className="text-ink-2 text-[14px] max-w-md mx-auto">
              No open bets yet. Head to a{" "}
              <Link href="/duels" className="text-ink underline underline-offset-2">
                live duel
              </Link>{" "}
              and stake on a side — it&apos;ll appear here with live win/lose tracking.
            </p>
          </div>
        ) : (
          <div className="surface-paper p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink text-[15px]">
                  {cA?.name} vs {cB?.name}
                </span>
                <span className="mono text-[10px] text-ink-3">{DUEL_ID}</span>
              </div>
              {resolved ? (
                <span
                  className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ color: "var(--vs-ochre-deep)", background: "var(--vs-ochre-soft)" }}
                >
                  Settled · {winningSide === 1 ? cA?.name : cB?.name} won
                </span>
              ) : (
                <span
                  className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1.5"
                  style={{ color: "var(--vs-positive)", background: "rgba(74,158,127,0.12)" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--vs-positive)", animation: "pulse-soft 2.4s ease-in-out infinite" }} />
                  Live
                </span>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {hasBetA && (
                <BetRow
                  contestant={cA}
                  side="A"
                  staked={Number(formatUnits(sharesA, USDC_DECIMALS))}
                  resolved={resolved}
                  won={winningSide === 1}
                  payout={Number(formatUnits(payoutFor(1), USDC_DECIMALS))}
                />
              )}
              {hasBetB && (
                <BetRow
                  contestant={cB}
                  side="B"
                  staked={Number(formatUnits(sharesB, USDC_DECIMALS))}
                  resolved={resolved}
                  won={winningSide === 2}
                  payout={Number(formatUnits(payoutFor(2), USDC_DECIMALS))}
                />
              )}
            </div>

            {/* Claim */}
            {resolved && ((winningSide === 1 && hasBetA) || (winningSide === 2 && hasBetB)) && (
              <button
                type="button"
                disabled={claimTx.isPending || claimReceipt.isLoading || claimReceipt.isSuccess}
                onClick={() =>
                  claimTx.writeContract({ address: market, abi: DEMO_MARKET_ABI, functionName: "claim" })
                }
                className="mt-4 w-full py-2.5 rounded-full bg-ink text-paper font-semibold text-[14px] disabled:bg-cream disabled:text-ink-3 transition-colors"
              >
                {claimReceipt.isSuccess
                  ? "Claimed ✓ — balance updated"
                  : claimTx.isPending || claimReceipt.isLoading
                    ? "Claiming…"
                    : `Claim ${fmtUsd(Number(formatUnits(payoutFor(winningSide as 1 | 2), USDC_DECIMALS)), 2)} TAUSDC`}
              </button>
            )}
            {resolved && ((winningSide === 1 && !hasBetA && hasBetB) || (winningSide === 2 && !hasBetB && hasBetA)) && (
              <div className="mt-4 text-center text-[13px] text-ink-2">
                This duel went the other way — better luck on the next one.
              </div>
            )}
          </div>
        )}
      </div>

      {/* On-chain bet history */}
      <div>
        <div className="eyebrow mb-3">Bet history</div>
        {history.length === 0 ? (
          <div className="surface-paper p-6 text-caption">
            No past bets on-chain yet. Every stake you place on duel-001 is recorded here
            with its transaction hash.
          </div>
        ) : (
          <div className="surface-paper divide-y divide-line overflow-hidden">
            {history.map((h) => {
              const sideName = h.side === 1 ? cA?.name : cB?.name;
              const sideColor = h.side === 1 ? "var(--vs-machine-deep)" : "var(--vs-human-deep)";
              const when = h.timestamp ? new Date(h.timestamp * 1000).toLocaleString() : "";
              return (
                <a
                  key={h.txHash}
                  href={`https://explorer.sepolia.mantle.xyz/tx/${h.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--vs-parchment)] transition-colors no-underline"
                >
                  <span
                    className="mono text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-md shrink-0"
                    style={{ color: sideColor, background: h.side === 1 ? "var(--vs-machine-wash)" : "var(--vs-human-wash)" }}
                  >
                    {sideName}
                  </span>
                  <span className="text-ink text-[14px] font-medium">{fmtUsd(Number(h.amount), 2)} TAUSDC</span>
                  <span className="text-ink-3 text-[12px] flex-1 truncate">{when}</span>
                  <span className="mono text-[11px] text-ink-3 shrink-0">
                    {h.txHash.slice(0, 6)}…{h.txHash.slice(-4)} ↗
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function BetRow({
  contestant,
  side,
  staked,
  resolved,
  won,
  payout,
}: {
  contestant: { name: string; avatar: string; kind: "human" | "agent"; strategy: string } | undefined;
  side: "A" | "B";
  staked: number;
  resolved: boolean;
  won: boolean;
  payout: number;
}) {
  if (!contestant) return null;
  const profit = payout - staked;
  return (
    <div className="rounded-xl border border-line p-4">
      <div className="flex items-center gap-3 mb-3">
        <AgentAvatar letter={contestant.avatar} kind={contestant.kind} strategy={contestant.strategy} size="sm" />
        <div>
          <div className="font-semibold text-ink text-[14px]">{contestant.name}</div>
          <div className="text-[11px] text-ink-3">your side · {side}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mono text-[13px]">
        <div>
          <div className="text-[10px] text-ink-3 uppercase tracking-wider">Staked</div>
          <div className="num mt-0.5 text-ink">{fmtUsd(staked, 2)}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-ink-3 uppercase tracking-wider">
            {resolved ? (won ? "Payout" : "Result") : "If wins"}
          </div>
          <div
            className="num mt-0.5"
            style={{
              color: resolved ? (won ? "var(--vs-positive)" : "var(--vs-negative)") : "var(--vs-ink)",
            }}
          >
            {resolved ? (won ? `+${fmtUsd(profit, 2)}` : "Lost") : fmtUsd(payout, 2)}
          </div>
        </div>
      </div>
    </div>
  );
}

