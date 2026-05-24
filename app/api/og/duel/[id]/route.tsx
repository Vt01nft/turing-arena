import { ImageResponse } from "next/og";
import { getDuel, getAgent } from "@/lib/mock-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLORS = {
  bg: "#07080a",
  panel: "#14171d",
  border: "#1f242d",
  fg: "#f5f7fa",
  dim: "#8a93a6",
  accent: "#00e599",
  human: "#5b8cff",
  ai: "#ff4d8d",
  warn: "#ffb84d",
};

const STRATEGY_TINT: Record<string, string> = {
  conservative: "#5b8cff",
  aggressive: "#ff4d8d",
  contrarian: "#c084fc",
  macro: "#34d399",
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
    duel.status === "live" ? COLORS.accent : duel.status === "upcoming" ? COLORS.dim : COLORS.warn;

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
            background: `radial-gradient(circle, ${COLORS.accent}22, transparent 70%)`,
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
  const scoreColor = score >= 0 ? COLORS.accent : COLORS.ai;

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
