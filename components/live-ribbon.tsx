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

/// Thin strip under the nav that surfaces the newest agent decision as it
/// happens. Subscribes to the same SSE stream as the global DecisionFeed.
/// Auto-shifts to the latest event with a soft fade.
export function LiveRibbon() {
  const [latest, setLatest] = useState<Decision | null>(null);
  const [pulse, setPulse] = useState(false);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    const es = new EventSource("/api/decisions/stream");
    es.addEventListener("decision", (ev) => {
      try {
        const d = JSON.parse((ev as MessageEvent).data) as Decision;
        if (seen.current.has(d.id)) return;
        seen.current.add(d.id);
        setLatest((prev) => (prev && d.at < prev.at ? prev : d));
        setPulse(true);
        setTimeout(() => setPulse(false), 600);
      } catch {}
    });
    return () => es.close();
  }, []);

  if (!latest) {
    return (
      <div
        className="border-b border-line"
        style={{ background: "var(--vs-cream)" }}
      >
        <div className="mx-auto max-w-[1240px] px-8 py-2 flex items-center gap-3 text-[12px] text-ink-3">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--vs-ink-4)" }}
          />
          <span className="eyebrow" style={{ letterSpacing: "0.12em" }}>
            Live
          </span>
          <span>Awaiting next decision…</span>
        </div>
      </div>
    );
  }

  const kindColor =
    latest.kind === "open"
      ? "var(--vs-machine-deep)"
      : latest.kind === "close"
        ? "var(--vs-human-deep)"
        : latest.kind === "claim"
          ? "var(--vs-ochre-deep)"
          : "var(--vs-ink)";

  return (
    <Link
      href={`/duels/${latest.duelId}`}
      className="block border-b border-line transition-colors hover:bg-[var(--vs-parchment)]"
      style={{
        background: pulse ? "var(--vs-machine-wash)" : "var(--vs-cream)",
        transition: "background 600ms ease-out",
      }}
    >
      <div className="mx-auto max-w-[1240px] px-8 py-2 flex items-center gap-3 text-[12.5px]">
        <span
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{
            background: "var(--vs-positive)",
            animation: "pulse-soft 2.4s ease-in-out infinite",
          }}
        />
        <span className="eyebrow shrink-0" style={{ letterSpacing: "0.12em" }}>
          Live
        </span>
        <span
          className="mono text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded shrink-0"
          style={{
            color: kindColor,
            background:
              latest.kind === "open"
                ? "var(--vs-machine-wash)"
                : latest.kind === "close"
                  ? "var(--vs-human-wash)"
                  : latest.kind === "claim"
                    ? "var(--vs-ochre-soft)"
                    : "var(--vs-parchment)",
          }}
        >
          {latest.kind.toUpperCase()}
        </span>
        <span className="font-semibold text-ink mono text-[12px] shrink-0">
          {latest.agentName}
        </span>
        <span className="text-ink-2 truncate flex-1">{latest.text}</span>
        {latest.llm && (
          <span
            className="mono text-[9px] font-semibold tracking-wider px-1.5 py-0.5 rounded shrink-0"
            style={{ color: "var(--vs-ochre-deep)", background: "var(--vs-ochre-soft)" }}
          >
            GEMINI
          </span>
        )}
        <span className="mono text-[10px] text-light shrink-0 hidden md:inline">
          {relTime(latest.at)}
        </span>
        {latest.txHash && (
          <span className="mono text-[10px] text-light shrink-0 hidden lg:inline">
            {latest.txHash.slice(0, 6)}…{latest.txHash.slice(-4)}
          </span>
        )}
      </div>
    </Link>
  );
}
