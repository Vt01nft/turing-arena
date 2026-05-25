"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Whale = {
  id: string;
  handle: string;
  alias: string;
  bias: "long" | "short" | "mixed";
  style: "scalper" | "swing" | "macro" | "momentum" | "contrarian";
  bio: string;
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
  trade: { id: string; symbol: string; price: number; size: number; side: "Buy" | "Sell"; time: number; notional: number; block: boolean };
};

const STYLE_TINT: Record<string, { bg: string; color: string }> = {
  scalper: { bg: "var(--vs-ochre-soft)", color: "var(--vs-ochre-deep)" },
  swing: { bg: "var(--vs-machine-wash)", color: "var(--vs-machine-deep)" },
  macro: { bg: "var(--vs-indigo-soft)", color: "var(--vs-indigo)" },
  momentum: { bg: "rgba(74,158,127,0.12)", color: "var(--vs-positive)" },
  contrarian: { bg: "var(--vs-lilac-soft)", color: "var(--vs-lilac-deep)" },
};

export function LiveBybitSection() {
  const [whales, setWhales] = useState<Whale[]>([]);
  const [mark, setMark] = useState<number | null>(null);
  const [recent, setRecent] = useState<Attribution[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const res = await fetch("/api/whales", { cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        setWhales(json.whales ?? []);
        setMark(json.mark);
        setRecent(json.attributions ?? []);
        setConnected(true);
      } catch {
        if (!cancelled) setConnected(false);
      }
    }
    tick();
    const t = setInterval(tick, 12_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  const ranked = [...whales].sort((a, b) => b.totalPnl - a.totalPnl);

  return (
    <section className="mx-auto max-w-[1240px] px-8 py-20 border-t border-line">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
        <div>
          <div className="eyebrow mb-2 flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: connected ? "var(--vs-positive)" : "var(--vs-ink-4)",
                animation: connected ? "pulse-soft 2.4s ease-in-out infinite" : undefined,
              }}
            />
            Live · Bybit mainnet
          </div>
          <h2
            style={{
              fontFamily: "var(--vs-font-display)",
              fontWeight: 500,
              fontSize: "clamp(28px, 3.4vw, 44px)",
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
              color: "var(--vs-ink)",
            }}
          >
            Tracked profiles, <em style={{ fontStyle: "italic", fontWeight: 400 }}>real</em> trades.
          </h2>
          <p className="mt-2 text-ink-2 text-[15px] max-w-2xl">
            Six profiles we track on Bybit&apos;s public mainnet trade feed. Every position move
            below is a real BTCUSDT order that just landed. PnL is computed against live mark price.
          </p>
        </div>
        {mark && (
          <div className="surface-paper px-5 py-3.5 inline-flex items-center gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-ink-3 font-semibold">BTCUSDT mark</div>
              <div className="num text-[26px] font-medium text-ink leading-none mt-1">
                ${mark.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Whale leaderboard */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {ranked.map((w) => {
          const tint = STYLE_TINT[w.style] ?? STYLE_TINT.swing;
          const positive = w.totalPnl >= 0;
          const dirLabel =
            Math.abs(w.netSize) < 0.001 ? "FLAT" : w.netSize > 0 ? "LONG" : "SHORT";
          return (
            <Link
              key={w.id}
              href={`/agents/human-${w.id.replace("whale-", "")}`}
              className="surface-paper p-5 block transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[var(--vs-shadow-2)]"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-ink text-[16px]">{w.alias}</div>
                  <div className="text-[11px] text-ink-3 mono mt-0.5">{w.handle}</div>
                </div>
                <span
                  className="mono text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full"
                  style={{ color: tint.color, background: tint.bg }}
                >
                  {w.style}
                </span>
              </div>
              <p className="text-[12.5px] text-ink-2 leading-relaxed line-clamp-2 mb-4">{w.bio}</p>
              <div className="grid grid-cols-3 gap-2 mono text-[12px]">
                <div>
                  <div className="text-[10px] text-ink-3 uppercase tracking-wider">Position</div>
                  <div
                    className="num mt-1 font-semibold"
                    style={{
                      color:
                        dirLabel === "FLAT"
                          ? "var(--vs-ink-3)"
                          : dirLabel === "LONG"
                            ? "var(--vs-positive)"
                            : "var(--vs-negative)",
                    }}
                  >
                    {dirLabel}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-ink-3 uppercase tracking-wider">Trades 24h</div>
                  <div className="num mt-1 text-ink">{w.trades}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-ink-3 uppercase tracking-wider">PnL</div>
                  <div
                    className="num mt-1 font-semibold"
                    style={{ color: positive ? "var(--vs-positive)" : "var(--vs-negative)" }}
                  >
                    {positive ? "+" : ""}${w.totalPnl.toFixed(2)}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent real-trade feed */}
      <div>
        <div className="eyebrow mb-3 flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--vs-positive)", animation: "pulse-soft 2.4s ease-in-out infinite" }}
          />
          Live order flow
          <span className="text-ink-3 normal-case tracking-normal text-[12px] ml-2 font-normal">
            · every line is a real Bybit mainnet trade we attributed
          </span>
        </div>
        <div className="surface-paper divide-y divide-line overflow-hidden">
          {recent.length === 0 ? (
            <div className="px-5 py-4 text-caption">Waiting for the next trade…</div>
          ) : (
            recent.slice(0, 14).map((a, i) => {
              const whale = whales.find((w) => w.id === a.whaleId);
              if (!whale) return null;
              const ago = Math.max(0, Math.floor((Date.now() - a.trade.time) / 1000));
              const agoStr = ago < 60 ? `${ago}s` : `${Math.floor(ago / 60)}m`;
              const sideColor = a.trade.side === "Buy" ? "var(--vs-positive)" : "var(--vs-negative)";
              return (
                <div key={`${a.trade.id}-${i}`} className="px-5 py-3 flex items-center gap-3 text-[14px]">
                  <span className="mono text-[12px] text-ink-3 w-12 shrink-0">{agoStr} ago</span>
                  <span
                    className="mono text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-md shrink-0"
                    style={{
                      color: sideColor,
                      background:
                        a.trade.side === "Buy" ? "rgba(74,158,127,0.12)" : "rgba(221,115,104,0.12)",
                    }}
                  >
                    {a.trade.side === "Buy" ? "LONG" : "SHORT"}
                  </span>
                  <span className="font-semibold text-ink text-[13px] mono w-20 shrink-0">{whale.alias}</span>
                  <span className="text-ink-2 flex-1 truncate">{a.narrative}</span>
                  {a.trade.block && (
                    <span
                      className="mono text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded-md shrink-0"
                      style={{ color: "var(--vs-ochre-deep)", background: "var(--vs-ochre-soft)" }}
                    >
                      BLOCK
                    </span>
                  )}
                  <span
                    className="mono text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded-md shrink-0 inline-flex items-center gap-1"
                    style={{ color: "white", background: "var(--vs-machine-deep)" }}
                  >
                    <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                    BYBIT
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <p className="text-caption mt-4">
        Trades are pulled from Bybit&apos;s public mainnet recent-trade endpoint. Profile attribution
        is a stable hash of the execution id; identities are anonymized (Bybit doesn&apos;t expose
        per-user data publicly). The PnL math runs against the real mark price.
      </p>
    </section>
  );
}
