import { ImageResponse } from "next/og";
import { getDuel, getAgent } from "@/lib/mock-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLORS = {
  bg: "#0a0b0f",
  panel: "#13151c",
  border: "#262a35",
  fg: "#f5f6f8",
  dim: "#9097a5",
  faint: "#5d6373",
  human: "#6a8dff",
  ai: "#ff5b8d",
  profit: "#1cb988",
  loss: "#ff5252",
  warn: "#f7c14b",
};

const STRATEGY_TINT: Record<string, string> = {
  conservative: "#6a8dff",
  aggressive: "#ff5b8d",
  contrarian: "#c084fc",
  macro: "#5ed4a8",
  momentum: "#fbbf24",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const duel = getDuel(id);

  if (!duel) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: COLORS.bg,
            color: COLORS.fg,
            fontSize: 48,
            fontFamily: "sans-serif",
          }}
        >
          Duel not found
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }
  const a = getAgent(duel.agentA)!;
  const b = getAgent(duel.agentB)!;

  const statusLabel =
    duel.status === "live"
      ? "● LIVE"
      : duel.status === "upcoming"
        ? "○ UPCOMING"
        : duel.winner === "A"
          ? `${a.name.toUpperCase()} WON`
          : `${b.name.toUpperCase()} WON`;
  const statusColor =
    duel.status === "live" ? COLORS.profit : duel.status === "upcoming" ? COLORS.dim : COLORS.warn;

  const yesPct = Math.round(duel.marketPrice * 100);
  const noPct = 100 - yesPct;

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
          padding: 64,
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
            right: -200,
            width: 600,
            height: 600,
            background: `radial-gradient(circle, ${COLORS.human}22, transparent 70%)`,
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="44" height="44" viewBox="0 0 32 32">
              <rect width="32" height="32" rx="7" fill={COLORS.panel} />
              <path d="M 4.5 27.5 L 4.5 4.5 L 27.5 27.5 Z" fill={COLORS.human} />
              <path d="M 27.5 4.5 L 27.5 27.5 L 4.5 4.5 Z" fill={COLORS.ai} />
              <path
                d="M 4.5 4.5 L 27.5 27.5"
                stroke={COLORS.panel}
                strokeWidth="1.25"
                strokeLinecap="round"
              />
            </svg>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 600, letterSpacing: -0.6, gap: 4 }}>
              <span>turing</span>
              <span style={{ color: COLORS.faint, fontWeight: 300 }}>·</span>
              <span>arena</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 18,
              letterSpacing: 2,
              color: statusColor,
              fontWeight: 600,
            }}
          >
            {statusLabel}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 40,
          }}
        >
          <AgentBlock agent={a} score={duel.scoreA} status={duel.status} side="left" />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 64,
                color: COLORS.dim,
                fontWeight: 200,
                letterSpacing: 8,
              }}
            >
              VS
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 14,
                color: COLORS.dim,
                letterSpacing: 2,
                fontFamily: "monospace",
              }}
            >
              {`${duel.rules.durationHours / 24}D · USDY+mETH · $${duel.capitalUsd.toLocaleString()}`}
            </div>
          </div>
          <AgentBlock agent={b} score={duel.scoreB} status={duel.status} side="right" />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 24,
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <Pill color={COLORS.human} label={`${a.name} ${yesPct}¢`} />
            <Pill color={COLORS.ai} label={`${b.name} ${noPct}¢`} />
            <div
              style={{
                display: "flex",
                fontSize: 16,
                color: COLORS.dim,
                fontFamily: "monospace",
              }}
            >
              {`$${duel.volumeUsd.toLocaleString()} volume`}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 18,
              color: COLORS.dim,
              fontFamily: "monospace",
            }}
          >
            {`turing.arena/duels/${duel.id}`}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

function AgentBlock({
  agent,
  score,
  status,
  side,
}: {
  agent: ReturnType<typeof getAgent>;
  score: number;
  status: string;
  side: "left" | "right";
}) {
  if (!agent) return <div style={{ display: "flex" }} />;
  const tint = STRATEGY_TINT[agent.strategy] ?? COLORS.fg;
  const sign = score >= 0 ? "+" : "";
  const scoreColor = score >= 0 ? COLORS.profit : COLORS.loss;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: side === "left" ? "flex-start" : "flex-end",
        gap: 18,
        width: 360,
      }}
    >
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: 20,
          background: `linear-gradient(135deg, ${tint}40, ${tint}10)`,
          border: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 80,
          fontWeight: 800,
          color: tint,
          fontFamily: "monospace",
        }}
      >
        {agent.avatar}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          alignItems: side === "left" ? "flex-start" : "flex-end",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: -1,
          }}
        >
          {agent.name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 18,
            color: COLORS.dim,
            fontFamily: "monospace",
          }}
        >
          {`${agent.strategy} · ERC-8004 #${agent.erc8004Id}`}
        </div>
      </div>
      {status !== "upcoming" && (
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 800,
            color: scoreColor,
            fontFamily: "monospace",
            letterSpacing: -2,
          }}
        >
          {`${sign}${score.toFixed(2)}%`}
        </div>
      )}
    </div>
  );
}

function Pill({ color, label }: { color: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        borderRadius: 999,
        border: `1px solid ${color}40`,
        background: `${color}10`,
        fontSize: 18,
        color,
        fontWeight: 600,
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: color,
          display: "flex",
        }}
      />
      <span>{label}</span>
    </div>
  );
}
