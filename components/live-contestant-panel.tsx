"use client";

import { useEffect, useState } from "react";

type WhaleState = {
  id: string;
  kind: "human" | "agent";
  alias: string;
  netSize: number;
  avgEntry: number;
  notionalTraded: number;
  trades: number;
  realisedPnl: number;
  unrealisedPnl: number;
  totalPnl: number;
  pnlPct: number;
};

type Attribution = {
  whaleId: string;
  action: string;
  narrative: string;
  trade: {
    id: string;
    price: number;
    size: number;
    side: "Buy" | "Sell";
    time: number;
    block: boolean;
  };
};

/// Live whale snapshot for a specific contestant, polled every 12s.
/// Shows position direction, equity-like total PnL, trade count, and
/// the recent trades the engine attributed to this contestant.
export function LiveContestantPanel({
  contestantId,
  alias,
}: {
  contestantId: string;
  alias: string;
}) {
  const [state, setState] = useState<WhaleState | null>(null);
  const [trades, setTrades] = useState<Attribution[]>([]);
  const [mark, setMark] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const res = await fetch("/api/whales", { cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        const whaleId = contestantId
          .replace(/^human-/, "whale-")
          .replace(/^agent-/, "whale-");
        const w = (json.whales as WhaleState[]).find((x) => x.id === whaleId) ?? null;
        const t = (json.attributions as Attribution[]).filter((a) => a.whaleId === whaleId);
        setState(w);
        setTrades(t);
        setMark(json.mark);
        setConnected(true);
      } catch {
        if (!cancelled) setConnected(false);
      }
    }
    tick();
    const timer = setInterval(tick, 12_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [contestantId]);

  if (!state) {
    return (
      <section className="surface-paper p-5">
        <div className="eyebrow mb-2">Live · Bybit mainnet</div>
        <div className="text-caption">Connecting to the live feed…</div>
      </section>
    );
  }

  const positionLabel =
    Math.abs(state.netSize) < 0.001 ? "FLAT" : state.netSize > 0 ? "LONG" : "SHORT";
  const positive = state.totalPnl >= 0;
  const positionColor =
    positionLabel === "FLAT"
      ? "var(--vs-ink-3)"
      : positionLabel === "LONG"
        ? "var(--vs-positive)"
        : "var(--vs-negative)";

  return (
    <section className="surface-paper p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="eyebrow mb-1.5 flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: connected ? "var(--vs-positive)" : "var(--vs-ink-4)",
                animation: connected ? "pulse-soft 2.4s ease-in-out infinite" : undefined,
              }}
            />
            Live · Bybit mainnet
          </div>
          <h3 className="text-ink text-[16px] font-semibold">
            <span className="text-ink-3">Trade flow attributed to</span>{" "}
            <em style={{ fontStyle: "italic", fontWeight: 500 }}>{alias}</em>
          </h3>
        </div>
        {mark && (
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-ink-3 font-semibold">BTCUSDT</div>
            <div className="num text-[18px] font-medium text-ink mt-0.5">
              ${mark.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        <Cell label="Position" value={positionLabel} color={positionColor} />
        <Cell
          label="Net size"
          value={`${Math.abs(state.netSize).toFixed(3)} BTC`}
        />
        <Cell label="Trades 24h" value={state.trades.toString()} />
        <Cell
          label="PnL"
          value={`${positive ? "+" : ""}$${state.totalPnl.toFixed(2)}`}
          color={positive ? "var(--vs-positive)" : "var(--vs-negative)"}
        />
      </div>

      <div className="mb-2 eyebrow">Recent attributed orders</div>
      {trades.length === 0 ? (
        <div className="text-caption">No attributed trades in this window yet — waiting on the next match.</div>
      ) : (
        <div className="rounded-xl border border-line divide-y divide-line">
          {trades.slice(0, 8).map((a) => {
            const ago = Math.max(0, Math.floor((Date.now() - a.trade.time) / 1000));
            const agoStr = ago < 60 ? `${ago}s` : `${Math.floor(ago / 60)}m`;
            const sideColor = a.trade.side === "Buy" ? "var(--vs-positive)" : "var(--vs-negative)";
            return (
              <div key={a.trade.id} className="px-4 py-2.5 flex items-center gap-3 text-[13px]">
                <span className="mono text-[11px] text-ink-3 w-10 shrink-0">{agoStr} ago</span>
                <span
                  className="mono text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded-md shrink-0"
                  style={{
                    color: sideColor,
                    background:
                      a.trade.side === "Buy" ? "rgba(74,158,127,0.12)" : "rgba(221,115,104,0.12)",
                  }}
                >
                  {a.trade.side === "Buy" ? "LONG" : "SHORT"}
                </span>
                <span className="text-ink-2 flex-1 truncate">{a.narrative}</span>
                {a.trade.block && (
                  <span
                    className="mono text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded-md shrink-0"
                    style={{ color: "var(--vs-ochre-deep)", background: "var(--vs-ochre-soft)" }}
                  >
                    BLOCK
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Cell({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-line p-3 bg-parchment">
      <div className="text-[10px] uppercase tracking-wider text-ink-3 font-semibold">{label}</div>
      <div className="num mt-1 font-semibold" style={{ fontSize: 18, color: color ?? "var(--vs-ink)" }}>
        {value}
      </div>
    </div>
  );
}
