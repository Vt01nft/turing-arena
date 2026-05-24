"use client";

import { useEffect, useRef, useState } from "react";
import type { Decision } from "@/lib/decision-engine";

const KIND_COLOR: Record<Decision["kind"], string> = {
  rebalance: "text-accent",
  claim: "text-[var(--color-warn)]",
  open: "text-human",
  close: "text-ai",
  hold: "text-dim",
};

const KIND_LABEL: Record<Decision["kind"], string> = {
  rebalance: "REBAL",
  claim: "CLAIM",
  open: "OPEN",
  close: "CLOSE",
  hold: "HOLD",
};

function relTime(seconds: number): string {
  const now = Date.now() / 1000;
  const diff = Math.max(0, now - seconds);
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export function DecisionFeed({
  duelId,
  variant = "duel",
}: {
  duelId?: string;
  variant?: "duel" | "global";
}) {
  const [items, setItems] = useState<Decision[]>([]);
  const [live, setLive] = useState(false);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    const url = duelId ? `/api/decisions/stream?duelId=${duelId}` : "/api/decisions/stream";
    const es = new EventSource(url);

    es.addEventListener("hello", () => setLive(true));
    es.addEventListener("decision", (ev) => {
      try {
        const d = JSON.parse((ev as MessageEvent).data) as Decision;
        if (seen.current.has(d.id)) return;
        seen.current.add(d.id);
        setItems((prev) => [d, ...prev].slice(0, 40));
      } catch {}
    });
    es.onerror = () => setLive(false);

    return () => {
      es.close();
    };
  }, [duelId]);

  if (items.length === 0) {
    return (
      <div className="panel p-6 text-sm text-dim">
        <div className="mono text-[10px] text-dim mb-2">
          {live ? "● CONNECTED" : "○ CONNECTING…"}
        </div>
        Waiting for the next agent decision…
      </div>
    );
  }

  return (
    <div className="panel divide-y divide-[var(--color-border)]">
      <div className="px-4 py-2 flex items-center justify-between text-[10px] mono tracking-wider">
        <span className={live ? "text-accent" : "text-dim"}>
          {live ? "● LIVE FEED" : "○ DISCONNECTED"}
        </span>
        <span className="text-dim">streamed via SSE · logged on-chain</span>
      </div>
      {items.map((d) => (
        <div key={d.id} className="px-4 py-3 flex items-start gap-3 text-sm">
          <span className="mono text-[10px] text-dim w-10 pt-0.5">{relTime(d.at)} ago</span>
          <span
            className={`mono text-[10px] w-12 pt-1 shrink-0 font-semibold tracking-wider ${KIND_COLOR[d.kind]}`}
          >
            {KIND_LABEL[d.kind]}
          </span>
          <span
            className={`mono text-xs ${d.agentSide === "A" ? "text-human" : "text-ai"} w-20 pt-0.5 shrink-0`}
          >
            {d.agentName}
          </span>
          <span className="text-fg/90 flex-1">
            {d.text}
            {variant === "global" && (
              <span className="ml-2 text-dim mono text-[10px]">→ {d.duelId}</span>
            )}
          </span>
          {d.txHash && (
            <span className="mono text-[10px] text-dim shrink-0 pt-1">
              {d.txHash.slice(0, 6)}…{d.txHash.slice(-4)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
