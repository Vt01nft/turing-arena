"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Nav } from "@/components/nav";
import { ERC20_ABI } from "@/lib/abis";
import { CONTRACTS, isDeployed } from "@/lib/contracts";
import { useState } from "react";

const TOKENS = [
  {
    id: "tausdc" as const,
    addr: CONTRACTS.usdc,
    label: "TAUSDC",
    longLabel: "Turing Arena USDC",
    amount: "1,000",
    note: "Stake on duels. Demo-only · zero real value · 6 decimals",
  },
  {
    id: "usdy" as const,
    addr: CONTRACTS.usdy,
    label: "USDY",
    longLabel: "USDY (Ondo mock)",
    amount: "1,000",
    note: "Ondo yield-bearing mock · 5.25% APY",
  },
  {
    id: "meth" as const,
    addr: CONTRACTS.meth,
    label: "mETH",
    longLabel: "Mantle staked ETH (mock)",
    amount: "0.5",
    note: "Mantle staked ETH mock · 3.80% APY",
  },
];

export default function FaucetPage() {
  return (
    <>
      <Nav />
      <main className="flex-1 mx-auto max-w-3xl px-5 md:px-6 py-10 md:py-12">
        <header className="mb-10">
          <h1 className="text-[32px] font-semibold tracking-tight">Testnet faucet</h1>
          <p className="text-dim mt-1.5 text-[14px] leading-relaxed">
            Claim test tokens to stake on duels or deposit into yield venues. Need testnet MNT for
            gas? →{" "}
            <a className="text-fg underline underline-offset-2 hover:text-human transition-colors" href="https://faucet.sepolia.mantle.xyz/">
              official Mantle faucet
            </a>
          </p>
        </header>

        <div className="grid gap-3">
          {TOKENS.map(({ id, ...rest }) => (
            <FaucetRow key={id} {...rest} />
          ))}
        </div>
      </main>
    </>
  );
}

function FaucetRow({
  addr,
  label,
  longLabel,
  amount,
  note,
}: {
  addr: string;
  label: string;
  longLabel: string;
  amount: string;
  note: string;
}) {
  const { isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const [clicked, setClicked] = useState(false);

  const deployed = isDeployed(addr as `0x${string}`);

  return (
    <div className="surface p-5 flex items-center gap-4">
      <div className="h-11 w-11 grid place-items-center rounded-md surface-2 mono font-semibold">
        {label.slice(0, 1)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[15px]">{longLabel}</span>
          <span
            className="mono text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded"
            style={{ color: "var(--vs-ink-3)", background: "var(--vs-cream)" }}
          >
            {label}
          </span>
          <a
            href={deployed ? `https://explorer.sepolia.mantle.xyz/address/${addr}` : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-[10px] text-faint hover:text-fg transition-colors"
          >
            {deployed ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "not deployed"}
          </a>
        </div>
        <div className="text-dim text-[11px] mt-0.5">{note}</div>
        {error && <div className="text-loss text-[11px] mt-1">{error.message.split("\n")[0]}</div>}
        {isSuccess && <div className="text-profit text-[11px] mt-1">✓ {amount} {label} dripped</div>}
      </div>
      <button
        type="button"
        disabled={!isConnected || !deployed || isPending || confirming}
        onClick={() => {
          setClicked(true);
          writeContract({
            abi: ERC20_ABI,
            address: addr as `0x${string}`,
            functionName: "drip",
          });
        }}
        className="px-4 py-2 rounded-md bg-fg text-bg font-semibold text-[13px] disabled:bg-[var(--color-surface)] disabled:text-faint transition-colors"
      >
        {!isConnected
          ? "Connect wallet"
          : !deployed
            ? "Unavailable"
            : isPending
              ? "Confirm…"
              : confirming
                ? "Pending…"
                : clicked && isSuccess
                  ? "Claim again"
                  : `Claim ${amount}`}
      </button>
    </div>
  );
}
