"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Nav } from "@/components/nav";
import { ERC20_ABI } from "@/lib/abis";
import { CONTRACTS } from "@/lib/contracts";
import { useState } from "react";

const TOKENS = [
  { key: "usdc" as const, addr: CONTRACTS.usdc, label: "USDC", amount: "1,000", note: "test stablecoin · 6 decimals" },
  { key: "usdy" as const, addr: CONTRACTS.usdy, label: "USDY", amount: "1,000", note: "Ondo mock · 5.25% APY" },
  { key: "meth" as const, addr: CONTRACTS.meth, label: "mETH", amount: "0.5", note: "Mantle staked ETH mock · 3.80% APY" },
];

export default function FaucetPage() {
  return (
    <>
      <Nav />
      <main className="flex-1 mx-auto max-w-3xl px-6 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Testnet faucet</h1>
          <p className="text-dim mt-1">
            Claim test tokens to stake on duels or deposit into yield venues. Each token has its own
            faucet on Mantle Sepolia. Need testnet MNT? →{" "}
            <a className="text-accent hover:underline" href="https://faucet.sepolia.mantle.xyz/">
              official Mantle faucet
            </a>
          </p>
        </header>

        <div className="grid gap-4">
          {TOKENS.map((t) => (
            <FaucetRow key={t.key} {...t} />
          ))}
        </div>
      </main>
    </>
  );
}

function FaucetRow({ addr, label, amount, note }: { addr: string; label: string; amount: string; note: string }) {
  const { isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const [clicked, setClicked] = useState(false);

  const isZero = addr === "0x0000000000000000000000000000000000000000";

  return (
    <div className="panel p-5 flex items-center gap-4">
      <div className="h-12 w-12 grid place-items-center rounded-md bg-[var(--color-bg-elev)] border border-[var(--color-border)] mono font-semibold text-accent">
        {label.slice(0, 1)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{label}</span>
          <span className="mono text-[10px] text-dim">
            {isZero ? "not deployed yet" : `${addr.slice(0, 6)}…${addr.slice(-4)}`}
          </span>
        </div>
        <div className="text-dim text-xs">{note}</div>
        {error && <div className="text-ai text-xs mt-1">{error.message.split("\n")[0]}</div>}
        {isSuccess && <div className="text-accent text-xs mt-1">✓ {amount} {label} dripped</div>}
      </div>
      <button
        type="button"
        disabled={!isConnected || isZero || isPending || confirming}
        onClick={() => {
          setClicked(true);
          writeContract({
            abi: ERC20_ABI,
            address: addr as `0x${string}`,
            functionName: "drip",
          });
        }}
        className="px-4 py-2 rounded-md bg-accent text-bg font-semibold disabled:bg-[var(--color-panel)] disabled:text-dim transition-colors"
      >
        {!isConnected
          ? "Connect wallet"
          : isZero
            ? "Unavailable"
            : isPending
              ? "Confirm in wallet…"
              : confirming
                ? "Pending…"
                : clicked && isSuccess
                  ? "Claim again"
                  : `Claim ${amount}`}
      </button>
    </div>
  );
}
