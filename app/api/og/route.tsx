import { ImageResponse } from "next/og";
import { AGENTS, DUELS } from "@/lib/mock-data";

export const runtime = "nodejs";

const C = {
  bone: "#E8EBF3",
  cream: "#DCDFEE",
  paper: "#FFFFFF",
  ink: "#1A1F2E",
  ink2: "#3A4256",
  ink3: "#6E7689",
  ink4: "#9CA3B5",
  line: "#D4D8E5",
  human: "#E68676",
  humanDeep: "#B45647",
  machine: "#7B7DEB",
  machineDeep: "#4A4DC0",
  ochre: "#E8A452",
  ochreDeep: "#B57F36",
};

function CapsuleMark() {
  return (
    <svg width="56" height="56" viewBox="0 0 64 64" style={{ display: "flex" }}>
      <defs>
        <linearGradient id="ogm-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9396F0" />
          <stop offset="100%" stopColor="#5C5FCE" />
        </linearGradient>
        <linearGradient id="ogm-bot" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F09A8C" />
          <stop offset="100%" stopColor="#C56353" />
        </linearGradient>
        <clipPath id="ogm-clip">
          <rect x="20" y="6" width="24" height="52" rx="12" ry="12" />
        </clipPath>
      </defs>
      <g clipPath="url(#ogm-clip)">
        <rect x="20" y="6" width="24" height="26" fill="url(#ogm-top)" />
        <rect x="20" y="32" width="24" height="26" fill="url(#ogm-bot)" />
        <line x1="20" y1="32" x2="44" y2="32" stroke={C.ink} strokeWidth="1.5" opacity="0.55" />
      </g>
      <rect x="20" y="6" width="24" height="52" rx="12" ry="12" fill="none" stroke={C.ink} strokeWidth="2" />
      <circle cx="32" cy="32" r="4.5" fill={C.ochre} stroke={C.ink} strokeWidth="1.4" />
    </svg>
  );
}

export async function GET() {
  const live = DUELS.filter((d) => d.status === "live").length;
  const totalVol = DUELS.reduce((s, d) => s + d.volumeUsd, 0);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: C.bone,
          color: C.ink,
          fontFamily: "sans-serif",
          padding: 72,
          position: "relative",
        }}
      >
        {/* drift blob */}
        <div
          style={{
            position: "absolute",
            top: -180,
            left: -180,
            width: 680,
            height: 680,
            background: `radial-gradient(circle, ${C.machine}44, transparent 70%)`,
            filter: "blur(40px)",
            display: "flex",
          }}
        />

        {/* brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <CapsuleMark />
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600, letterSpacing: "-0.04em", gap: 6, alignItems: "baseline" }}>
            <span>turing</span>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: C.ochre,
                alignSelf: "center",
                display: "flex",
              }}
            />
            <span>arena</span>
          </div>
        </div>

        {/* hero */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              fontSize: 100,
              fontWeight: 500,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
            }}
          >
            <span>Bet on </span>
            <span style={{ fontStyle: "italic", color: C.humanDeep, fontFamily: "serif", fontWeight: 400 }}>
              humans
            </span>
            <span>.</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 100,
              fontWeight: 500,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
              marginTop: 8,
            }}
          >
            <span style={{ color: C.ink2 }}>Or bet on the </span>
            <span style={{ fontStyle: "italic", color: C.machineDeep, fontFamily: "serif", fontWeight: 400 }}>
              machines
            </span>
            <span style={{ color: C.ink2 }}>.</span>
          </div>
          <div style={{ display: "flex", fontSize: 24, color: C.ink2, marginTop: 28, maxWidth: 950 }}>
            Live duels on USDY + mETH. ERC-8004 identity. x402 payments.
          </div>
        </div>

        {/* stats */}
        <div style={{ display: "flex", gap: 16 }}>
          <Stat label="Live duels" value={String(live)} tone="positive" />
          <Stat label="Contestants" value={String(AGENTS.length)} />
          <Stat label="Volume" value={`$${(totalVol / 1000).toFixed(1)}k`} />
          <Stat label="Hackathon" value="Turing Test '26" />
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "positive" }) {
  const color = tone === "positive" ? "#4A9E7F" : C.ink;
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "22px 26px",
        background: C.paper,
        border: `1px solid ${C.line}`,
        borderRadius: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 12,
          letterSpacing: 2,
          color: C.ink3,
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 38,
          fontWeight: 500,
          color,
          fontFamily: "monospace",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
    </div>
  );
}
