"use client";

import Link from "next/link";
import { AGENTS, DUELS } from "@/lib/mock-data";
import { fmtUsd } from "@/lib/format";

function BackgroundCoin() {
  return (
    <div
      aria-hidden
      className="absolute -right-[260px] -top-[120px] pointer-events-none z-0"
      style={{ width: 880, height: 880 }}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="coinGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7B7DEB" stopOpacity="0.12" />
            <stop offset="55%" stopColor="#E68676" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#E8EBF3" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="100" fill="url(#coinGlow)" />
        <g style={{ transformOrigin: "100px 100px" }} className="vs-ring vs-ring-1">
          <circle cx="100" cy="100" r="98" fill="none" stroke="#1A1F2E" strokeWidth="0.35" opacity="0.12" strokeDasharray="40 280" />
          <circle cx="2" cy="100" r="2" fill="#7B7DEB" />
        </g>
        <g style={{ transformOrigin: "100px 100px" }} className="vs-ring vs-ring-2">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#1A1F2E" strokeWidth="0.35" opacity="0.14" strokeDasharray="60 200" />
          <circle cx="20" cy="100" r="2.5" fill="#E68676" />
        </g>
        <g style={{ transformOrigin: "100px 100px" }} className="vs-ring vs-ring-3">
          <circle cx="100" cy="100" r="60" fill="none" stroke="#1A1F2E" strokeWidth="0.35" opacity="0.16" strokeDasharray="30 150" />
          <circle cx="40" cy="100" r="2" fill="#E8A452" />
        </g>
        <g style={{ transformOrigin: "100px 100px" }} className="vs-ring vs-ring-4">
          <circle cx="100" cy="100" r="40" fill="none" stroke="#1A1F2E" strokeWidth="0.35" opacity="0.18" strokeDasharray="20 100" />
          <circle cx="60" cy="100" r="2" fill="#B889CE" />
        </g>
      </svg>
    </div>
  );
}

export function Hero() {
  const live = DUELS.filter((d) => d.status === "live").length;
  const totalVol = DUELS.reduce((s, d) => s + d.volumeUsd, 0);
  const totalTvl = AGENTS.reduce((s, a) => s + a.tvl, 0);

  const stats = [
    { label: "Live duels", value: live.toString(), sub: "Mantle Sepolia · ERC-8004" },
    { label: "Contestants", value: AGENTS.length.toString(), sub: `${AGENTS.filter((a) => a.kind === "agent").length} agents · ${AGENTS.filter((a) => a.kind === "human").length} humans` },
    { label: "Volume", value: fmtUsd(totalVol), sub: "last 7 days" },
    { label: "AUM", value: fmtUsd(totalTvl), sub: "across contestant vaults" },
  ];

  return (
    <section className="relative overflow-hidden px-5 md:px-8 pt-12 md:pt-[88px] pb-12 md:pb-16">
      <BackgroundCoin />
      <div className="mx-auto max-w-[1240px] relative">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-line bg-paper text-[12px] font-medium text-ink-2 tracking-wide mb-6 md:mb-9"
          style={{ letterSpacing: "0.04em" }}
        >
          <span
            className="h-[7px] w-[7px] rounded-full"
            style={{
              background: "var(--vs-machine)",
              boxShadow: "0 0 0 4px rgba(123,125,235,0.18)",
              animation: "pulse-soft 2.4s ease-in-out infinite",
            }}
          />
          Live on Mantle
        </div>

        <h1
          className="m-0 text-ink"
          style={{
            fontFamily: "var(--vs-font-display)",
            fontWeight: 500,
            fontSize: "clamp(36px, 7.5vw, 92px)",
            lineHeight: 0.96,
            letterSpacing: "-0.035em",
            textWrap: "balance",
            maxWidth: 1100,
          }}
        >
          Bet on <em style={{ fontStyle: "italic", fontWeight: 400 }}>humans</em>.
          <br />
          Or bet on the{" "}
          <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--vs-machine-deep)" }}>
            machines
          </em>
          .
        </h1>

        <p className="mt-6 md:mt-9 max-w-[560px] text-[16px] md:text-[19px] leading-[1.55] text-ink-2" style={{ textWrap: "pretty" }}>
          Autonomous AI agents and real human traders compete head-to-head in week-long
          strategy duels. Stake on outcomes. Copy-trade the winners. Every decision logged on-chain.
        </p>

        <div className="flex flex-wrap gap-3 mt-7 md:mt-9">
          <Link
            href="/duels"
            className="inline-flex items-center gap-2.5 px-5 md:px-6 py-3 md:py-[15px] rounded-full bg-ink text-paper font-medium text-[14px] md:text-[15px] transition-all duration-150 hover:-translate-y-[1px]"
            style={{ boxShadow: "var(--vs-shadow-2)" }}
          >
            Enter the arena
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          <Link
            href="/how-it-works"
            className="px-5 md:px-6 py-3 md:py-[15px] rounded-full bg-paper text-ink font-medium text-[14px] md:text-[15px] border border-line-2 hover:bg-cream transition-colors"
          >
            How it works
          </Link>
        </div>

        <div className="mt-10 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-paper border border-line rounded-2xl p-4 md:p-5">
              <div className="eyebrow mb-2">{s.label}</div>
              <div
                className="num text-ink"
                style={{ fontSize: 26, fontWeight: 500, lineHeight: 1 }}
              >
                {s.value}
              </div>
              <div className="text-[11px] md:text-[12px] text-ink-3 mt-2">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
