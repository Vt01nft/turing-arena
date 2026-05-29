"use client";

import { useEffect, useState } from "react";
import { useToast } from "./toaster";

type Health = {
  ok: boolean;
  reason?: string;
  totalEquityUsd?: number;
  totalAvailableBalanceUsd?: number;
  coins?: { coin: string; equity: number; usdValue: number }[];
  btcusdt?: { lastPrice: number; change24hPct: number; volume24h: number } | null;
};

type Position = {
  symbol: string;
  side: "Buy" | "Sell" | "None";
  size: number;
  entryPrice: number;
  markPrice: number;
  positionValue: number;
  unrealisedPnl: number;
  leverage: number;
};

/// Surface live Bybit testnet data on the agent profile.
/// Pulls /api/bybit/health + /api/bybit/positions every 12s.
export function BybitPanel({ agentName }: { agentName: string }) {
  const toast = useToast();
  const [health, setHealth] = useState<Health | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trading, setTrading] = useState<"Buy" | "Sell" | null>(null);

  async function refetch() {
    try {
      const [h, p] = await Promise.all([
        fetch("/api/bybit/health", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/bybit/positions?symbol=BTCUSDT", { cache: "no-store" }).then((r) => r.json()),
      ]);
      setHealth(h);
      setPositions(p?.positions ?? []);
    } catch {}
  }

  useEffect(() => {
    refetch();
    const t = setInterval(refetch, 12_000);
    return () => clearInterval(t);
  }, []);

  async function trade(side: "Buy" | "Sell") {
    setTrading(side);
    try {
      const res = await fetch("/api/bybit/trade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ side, notionalUsdt: 50 }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.push({
          kind: "success",
          title: `${agentName} ${side === "Buy" ? "LONG" : "SHORT"} BTCUSDT`,
          body: `${json.qty} BTC · orderId ${json.orderId.slice(0, 10)}…`,
        });
        setTimeout(refetch, 1200);
      } else {
        toast.push({
          kind: "error",
          title: "Order rejected",
          body: json.reason ?? "Check server logs.",
        });
      }
    } catch (e) {
      toast.push({ kind: "error", title: "Network error", body: String(e) });
    } finally {
      setTrading(null);
    }
  }

  if (!health) {
    return (
      <section className="surface-paper p-5">
        <div className="eyebrow mb-2">Live trading · Bybit testnet</div>
        <div className="text-caption">Connecting…</div>
      </section>
    );
  }

  if (!health.ok) {
    return (
      <section className="surface-paper p-5">
        <div className="eyebrow mb-2">Live trading · Bybit testnet</div>
        <div className="text-caption">
          <span style={{ color: "var(--vs-negative)" }}>Disconnected.</span>{" "}
          {health.reason}
        </div>
      </section>
    );
  }

  const empty = (health.totalEquityUsd ?? 0) < 1;

  return (
    <section className="surface-paper p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="eyebrow mb-1">Live trading · Bybit testnet</div>
          <div className="text-caption">
            Real account · real positions · real PnL · paper money.
          </div>
        </div>
        <span
          className="mono text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1.5"
          style={{ color: "var(--vs-positive)", background: "rgba(74,158,127,0.12)" }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--vs-positive)", animation: "pulse-soft 2.4s ease-in-out infinite" }}
          />
          CONNECTED
        </span>
      </div>

      {/* Balance row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat label="Equity (USDT)" value={`$${(health.totalEquityUsd ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
        <Stat label="Available" value={`$${(health.totalAvailableBalanceUsd ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
        <Stat
          label="BTCUSDT"
          value={`$${health.btcusdt?.lastPrice?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? "-"}`}
          hint={
            health.btcusdt
              ? `${health.btcusdt.change24hPct >= 0 ? "+" : ""}${health.btcusdt.change24hPct.toFixed(2)}% 24h`
              : undefined
          }
          tone={
            health.btcusdt && health.btcusdt.change24hPct >= 0 ? "positive" : "negative"
          }
        />
      </div>

      {/* Open positions */}
      <div className="eyebrow mb-2">Open positions</div>
      {positions.length === 0 ? (
        <div className="text-caption mb-4">
          {empty
            ? "Wallet empty - claim demo funds at testnet.bybit.com (Request Demo Funds)."
            : "No open positions. Click Long / Short below to place a 50 USDT market order."}
        </div>
      ) : (
        <div className="rounded-xl border border-line divide-y divide-line mb-4">
          {positions.map((p) => (
            <div key={p.symbol + p.side} className="px-4 py-3 grid grid-cols-[1fr_auto] items-center gap-3 text-[13px]">
              <div>
                <div className="font-semibold text-ink">
                  {p.symbol}{" "}
                  <span
                    className="mono text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded ml-1.5"
                    style={{
                      color: p.side === "Buy" ? "var(--vs-positive)" : "var(--vs-negative)",
                      background:
                        p.side === "Buy" ? "rgba(74,158,127,0.12)" : "rgba(221,115,104,0.12)",
                    }}
                  >
                    {p.side === "Buy" ? "LONG" : "SHORT"} {p.leverage}x
                  </span>
                </div>
                <div className="text-caption mt-0.5">
                  {p.size} @ ${p.entryPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} · mark $
                  {p.markPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-right">
                <div
                  className="num font-semibold"
                  style={{
                    fontSize: 16,
                    color: p.unrealisedPnl >= 0 ? "var(--vs-positive)" : "var(--vs-negative)",
                  }}
                >
                  {p.unrealisedPnl >= 0 ? "+" : ""}${p.unrealisedPnl.toFixed(2)}
                </div>
                <div className="text-caption">unrealized</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trade buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!!trading || empty}
          onClick={() => trade("Buy")}
          className="py-2.5 rounded-full font-semibold text-[13px] transition-all disabled:cursor-not-allowed"
          style={{
            background: "var(--vs-positive)",
            color: "white",
            opacity: trading === "Buy" ? 0.6 : empty ? 0.4 : 1,
          }}
        >
          {trading === "Buy" ? "Sending…" : "Long $50"}
        </button>
        <button
          type="button"
          disabled={!!trading || empty}
          onClick={() => trade("Sell")}
          className="py-2.5 rounded-full font-semibold text-[13px] transition-all disabled:cursor-not-allowed"
          style={{
            background: "var(--vs-negative)",
            color: "white",
            opacity: trading === "Sell" ? 0.6 : empty ? 0.4 : 1,
          }}
        >
          {trading === "Sell" ? "Sending…" : "Short $50"}
        </button>
      </div>
      <p className="text-caption mt-3">
        Each click places a real market order on Bybit testnet. Position +
        PnL above refresh every 12s. No real money.
      </p>
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "positive" | "negative";
}) {
  const color =
    tone === "positive" ? "var(--vs-positive)" : tone === "negative" ? "var(--vs-negative)" : "var(--vs-ink)";
  return (
    <div className="rounded-xl border border-line p-3 bg-parchment">
      <div className="text-[10px] uppercase tracking-wider text-ink-3 font-semibold">{label}</div>
      <div className="num mt-1 font-medium" style={{ fontSize: 18, color }}>
        {value}
      </div>
      {hint && <div className="text-[11px] text-ink-3 mt-0.5">{hint}</div>}
    </div>
  );
}
