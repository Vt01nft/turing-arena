"use client";

import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import type { Subscription } from "@/lib/x402-store";

export function CopyTrade({ agentId, agentName }: { agentId: string; agentName: string }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync, isPending: signing } = useSignMessage();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll status whenever connected
  useEffect(() => {
    if (!address) {
      setSub(null);
      return;
    }
    let cancelled = false;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/x402/status?subscriber=${address}&agentId=${agentId}`);
        const json = await res.json();
        if (!cancelled) setSub(json.subscription);
      } catch {}
    };
    fetchStatus();
    const t = setInterval(fetchStatus, 8_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [address, agentId]);

  async function subscribe() {
    if (!address) return;
    setError(null);
    setBusy(true);
    try {
      const message =
        `x402-subscribe\nplatform: turing-arena\nagent: ${agentId}\nprice: 0.05 USDC per action\nsubscriber: ${address}\nnonce: ${Date.now()}`;
      const signature = await signMessageAsync({ message });
      const res = await fetch("/api/x402/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subscriber: address, agentId, signature }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "subscribe failed");
      setSub(json.subscription);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message.split("\n")[0] : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    if (!address) return;
    setBusy(true);
    try {
      const res = await fetch("/api/x402/cancel", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subscriber: address, agentId }),
      });
      const json = await res.json();
      setSub(json.subscription);
    } finally {
      setBusy(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="surface p-4 text-[12px] text-dim leading-relaxed">
        <div className="text-fg font-semibold mb-1.5 text-[13px]">
          Copy-trade <span className="text-warn">{agentName}</span>
        </div>
        Mirror this agent&apos;s allocation to your wallet. Billed per-action in USDC via{" "}
        <span className="mono text-fg">x402</span>.
        <button
          type="button"
          disabled
          className="mt-3 w-full py-2 rounded-md border border-[var(--color-border)] text-faint text-[13px] cursor-not-allowed"
        >
          Connect wallet to subscribe
        </button>
      </div>
    );
  }

  if (sub?.active) {
    return (
      <div className="surface p-4 text-[12px] leading-relaxed">
        <div className="flex items-center justify-between mb-2">
          <div className="text-fg font-semibold text-[13px]">
            Mirroring <span className="text-warn">{agentName}</span>
          </div>
          <span className="mono text-[9px] text-profit px-1 py-0.5 rounded border border-profit/30 flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-profit animate-pulse" />
            ACTIVE
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Stat label="actions billed" value={sub.actionsBilled.toString()} />
          <Stat label="paid" value={`$${sub.totalBilledUsdc.toFixed(2)}`} />
        </div>
        <div className="text-[10px] text-faint mb-3 mono break-all">
          {sub.id} · price ${sub.pricePerActionUsdc}/action
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={cancel}
          className="w-full py-2 rounded-md border border-[var(--color-border)] hover:border-loss/50 text-[13px] text-dim hover:text-loss transition-colors"
        >
          {busy ? "Cancelling…" : "Cancel subscription"}
        </button>
        <p className="mt-2 text-[10px] text-faint leading-relaxed">
          x402 payments are streamed per-action. Cancel anytime - no further billing.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-paper p-4 text-[13px] text-ink-2 leading-relaxed">
      <div className="flex items-center justify-between mb-2">
        <div className="text-ink font-semibold text-[14px]">
          Copy-trade <span style={{ color: "var(--vs-ochre-deep)" }}>{agentName}</span>
        </div>
        <span
          className="mono text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded"
          style={{ color: "var(--vs-machine-deep)", background: "var(--vs-machine-wash)" }}
        >
          x402
        </span>
      </div>
      Mirror allocations 1:1 to your wallet. Pay <span className="mono text-ink font-semibold">$0.05</span> per
      agent action via <span className="mono text-ink font-semibold">HTTP 402</span>. Stop paying = stop mirroring.
      {error && <div className="text-[12px] mt-2" style={{ color: "var(--vs-negative)" }}>{error}</div>}
      <button
        type="button"
        disabled={busy || signing}
        onClick={subscribe}
        className="mt-3 w-full py-2 rounded-md bg-fg text-bg font-semibold text-[13px] disabled:bg-[var(--color-surface)] disabled:text-faint transition-colors"
      >
        {signing ? "Sign in wallet…" : busy ? "Subscribing…" : "Subscribe via x402"}
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-ink-3 font-semibold">{label}</div>
      <div className="mono text-[15px] text-ink mt-1 font-medium">{value}</div>
    </div>
  );
}
