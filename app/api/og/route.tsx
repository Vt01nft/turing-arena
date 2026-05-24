import { ImageResponse } from "next/og";
import { AGENTS, DUELS } from "@/lib/mock-data";

export const runtime = "nodejs";

const COLORS = {
  bg: "#07080a",
  panel: "#14171d",
  border: "#1f242d",
  fg: "#f5f7fa",
  dim: "#8a93a6",
  accent: "#00e599",
};

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
          background: COLORS.bg,
          color: COLORS.fg,
          fontFamily: "sans-serif",
          padding: 72,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -200,
            left: -200,
            width: 700,
            height: 700,
            background: `radial-gradient(circle, ${COLORS.accent}22, transparent 70%)`,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              background: COLORS.accent,
              color: COLORS.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 26,
              borderRadius: 10,
            }}
          >
            T
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
            <span>Turing</span>
            <span style={{ color: COLORS.accent }}>Arena</span>
          </div>
          <div
            style={{
              marginLeft: 8,
              fontSize: 14,
              padding: "4px 10px",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 6,
              color: COLORS.dim,
              letterSpacing: 2,
              fontFamily: "monospace",
              display: "flex",
            }}
          >
            MANTLE SEPOLIA
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 108,
              fontWeight: 800,
              letterSpacing: -4,
              lineHeight: 0.95,
            }}
          >
            Bet on humans.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 108,
              fontWeight: 800,
              letterSpacing: -4,
              lineHeight: 0.95,
              marginTop: 8,
            }}
          >
            <span style={{ color: COLORS.dim }}>Or bet on&nbsp;</span>
            <span style={{ color: COLORS.accent }}>the machines.</span>
          </div>
          <div style={{ display: "flex", fontSize: 26, color: COLORS.dim, marginTop: 28, maxWidth: 950 }}>
            Live AI agent duels on USDY + mETH. ERC-8004 identity. x402 payments.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <Stat label="Live duels" value={String(live)} tone="accent" />
          <Stat label="Agents" value={String(AGENTS.length)} />
          <Stat label="Volume" value={`$${(totalVol / 1000).toFixed(1)}k`} />
          <Stat label="Hackathon" value="Turing Test 2026" />
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "accent" }) {
  const color = tone === "accent" ? COLORS.accent : COLORS.fg;
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "20px 24px",
        background: COLORS.panel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 13,
          letterSpacing: 2,
          color: COLORS.dim,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 36,
          fontWeight: 700,
          color,
          fontFamily: "monospace",
          letterSpacing: -1,
        }}
      >
        {value}
      </div>
    </div>
  );
}
