"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Decision } from "@/lib/decision-engine";

function relTime(seconds: number): string {
  const now = Date.now() / 1000;
  const diff = Math.max(0, now - seconds);
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

const KIND_TINT: Record<Decision["kind"], { color: string; bg: string }> = {
  rebalance: { color: "var(--vs-ink)",          bg: "var(--vs-parchment)" },
  claim:     { color: "var(--vs-ochre-deep)",   bg: "var(--vs-ochre-soft)" },
  open:      { color: "var(--vs-machine-deep)", bg: "var(--vs-machine-wash)" },
  close:     { color: "var(--vs-human-deep)",   bg: "var(--vs-human-wash)" },
  hold:      { color: "var(--vs-ink-3)",        bg: "var(--vs-parchment)" },
};

/// Continuously-scrolling marquee under the nav. Sticky alongside the nav
/// so it stays visible while scrolling. New SSE events are prepended;
/// the track is duplicated so the loop is seamless. Pauses on hover.
export function LiveRibbon() {
  const [items, setItems] = useState<Decision[]>([]);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    const es = new EventSource("/api/decisions/stream");
    es.addEventListener("decision", (ev) => {
      try {
        const d = JSON.parse((ev as MessageEvent).data) as Decision;
        if (seen.current.has(d.id)) return;
        seen.current.add(d.id);
        setItems((prev) => [d, ...prev].slice(0, 14));
      } catch {}
    });
    return () => es.close();
  }, []);

  if (items.length === 0) {
    return (
      <div className="border-b border-line" style={{ background: "var(--vs-cream)" }}>
        <div className="mx-auto max-w-[1240px] px-8 py-2.5 flex items-center gap-3 text-[13px] text-ink-3">
          <Pulse />
          <span className="eyebrow" style={{ letterSpacing: "0.12em" }}>Live</span>
          <span>Awaiting next decision…</span>
        </div>
      </div>
    );
  }

  // Duplicate so the loop wraps seamlessly
  const track = [...items, ...items];

  return (
    <div
      className="border-b border-line relative overflow-hidden"
      style={{ background: "var(--vs-cream)" }}
    >
      {/* Fixed "LIVE" label sits on the left, above the track */}
      <div
        className="absolute left-0 top-0 bottom-0 z-10 flex items-center gap-2 px-4 pr-6"
        style={{
          background:
            "linear-gradient(90deg, var(--vs-cream) 70%, rgba(220,223,238,0))",
        }}
      >
        <Pulse />
        <span
          className="font-semibold uppercase text-ink"
          style={{ fontSize: 11, letterSpacing: "0.16em" }}
        >
          Live
        </span>
      </div>

      {/* Marquee track */}
      <div className="ribbon-marquee py-2.5" style={{ paddingLeft: 88 }}>
        <div className="ribbon-track flex items-center gap-7 will-change-transform">
          {track.map((d, i) => {
            const tint = KIND_TINT[d.kind];
            return (
              <Link
                key={`${d.id}-${i}`}
                href={`/duels/${d.duelId}`}
                className="inline-flex items-center gap-2.5 text-[14px] whitespace-nowrap text-ink-2 hover:text-ink transition-colors shrink-0"
              >
                <span
                  className="mono text-[11px] font-semibold tracking-wider px-2 py-0.5 rounded-md"
                  style={{ color: tint.color, background: tint.bg }}
                >
                  {d.kind.toUpperCase()}
                </span>
                <span className="font-semibold text-ink mono text-[13px]">{d.agentName}</span>
                <span className="text-ink-2">{d.text}</span>
                {d.bybit ? (
                  <span
                    className="mono text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded-md inline-flex items-center gap-1"
                    style={{ color: "white", background: "var(--vs-machine-deep)" }}
                    title={`real Bybit order · ${d.orderId ?? ""}`}
                  >
                    <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                    BYBIT
                  </span>
                ) : d.llm ? (
                  <span
                    className="mono text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded-md"
                    style={{ color: "var(--vs-ochre-deep)", background: "var(--vs-ochre-soft)" }}
                  >
                    GEMINI
                  </span>
                ) : null}
                <span className="mono text-[11px] text-light">· {relTime(d.at)}</span>
                <span aria-hidden className="text-ink-4 mx-3">●</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Pulse() {
  return (
    <span
      className="h-2 w-2 rounded-full shrink-0"
      style={{
        background: "var(--vs-positive)",
        animation: "pulse-soft 2.4s ease-in-out infinite",
      }}
    />
  );
}
