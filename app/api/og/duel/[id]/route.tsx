import { ImageResponse } from "next/og";
import { getDuel, getAgent } from "@/lib/mock-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const C = {
  bone: "#E8EBF3",
  paper: "#FFFFFF",
  parchment: "#F0F2F8",
  ink: "#1A1F2E",
  ink2: "#3A4256",
  ink3: "#6E7689",
  ink4: "#9CA3B5",
  line: "#D4D8E5",
  human: "#E68676",
  humanDeep: "#B45647",
  humanWash: "#FCE5E2",
  machine: "#7B7DEB",
  machineDeep: "#4A4DC0",
  machineWash: "#E0E3F8",
  ochre: "#E8A452",
  ochreDeep: "#B57F36",
  positive: "#4A9E7F",
  negative: "#DD7368",
};

function CapsuleMark() {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" style={{ display: "flex" }}>
      <defs>
        <linearGradient id="dm-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9396F0" />
          <stop offset="100%" stopColor="#5C5FCE" />
        </linearGradient>
        <linearGradient id="dm-bot" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F09A8C" />
          <stop offset="100%" stopColor="#C56353" />
        </linearGradient>
        <clipPath id="dm-clip">
          <rect x="20" y="6" width="24" height="52" rx="12" ry="12" />
        </clipPath>
      </defs>
      <g clipPath="url(#dm-clip)">
        <rect x="20" y="6" width="24" height="26" fill="url(#dm-top)" />
        <rect x="20" y="32" width="24" height="26" fill="url(#dm-bot)" />
      </g>
      <rect x="20" y="6" width="24" height="52" rx="12" ry="12" fill="none" stroke={C.ink} strokeWidth="2" />
      <circle cx="32" cy="32" r="4" fill={C.ochre} stroke={C.ink} strokeWidth="1.4" />
    </svg>
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const duel = getDuel(id);

  if (!duel) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: C.bone, color: C.ink, fontSize: 48, fontFamily: "sans-serif" }}>
          Duel not found
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }
  const a = getAgent(duel.agentA)!;
  const b = getAgent(duel.agentB)!;

  const statusLabel =
    duel.status === "live" ? "● LIVE"
      : duel.status === "upcoming" ? "○ UPCOMING"
      : duel.winner === "A" ? `${a.name.toUpperCase()} WON`
      : `${b.name.toUpperCase()} WON`;
  const statusColor =
    duel.status === "live" ? C.positive
      : duel.status === "upcoming" ? C.ink3
      : C.ochreDeep;

  const yesPct = Math.round(duel.marketPrice * 100);
  const noPct = 100 - yesPct;
  const matchType =
    a.kind !== b.kind ? "HUMAN vs AGENT" : a.kind === "human" ? "HUMAN vs HUMAN" : "AGENT vs AGENT";

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
          padding: 56,
          position: "relative",
        }}
      >
        <div style={{
          position: "absolute", top: -200, right: -200,
          width: 600, height: 600,
          background: `radial-gradient(circle, ${C.machine}44, transparent 70%)`,
          filter: "blur(40px)", display: "flex",
        }} />

        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <CapsuleMark />
            <div style={{ display: "flex", fontSize: 26, fontWeight: 600, letterSpacing: "-0.04em", gap: 5, alignItems: "baseline" }}>
              <span>turing</span>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: C.ochre, alignSelf: "center", display: "flex" }} />
              <span>arena</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div style={{ display: "flex", fontSize: 18, letterSpacing: 2, color: statusColor, fontWeight: 600 }}>{statusLabel}</div>
            <div style={{ display: "flex", fontSize: 12, letterSpacing: 2, color: C.ink3, fontWeight: 500 }}>{matchType}</div>
          </div>
        </div>

        {/* matchup */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 32 }}>
          <AgentBlock agent={a} score={duel.scoreA} status={duel.status} side="left" />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", fontFamily: "serif", fontStyle: "italic", fontSize: 64, color: C.ink3, fontWeight: 400 }}>vs</div>
            <div style={{ display: "flex", fontSize: 14, color: C.ink3, letterSpacing: 2, fontFamily: "monospace", fontWeight: 500 }}>
              {`${duel.rules.durationHours < 24 ? `${duel.rules.durationHours}H` : `${duel.rules.durationHours / 24}D`} · USDY+mETH · $${duel.capitalUsd.toLocaleString()}`}
            </div>
          </div>
          <AgentBlock agent={b} score={duel.scoreB} status={duel.status} side="right" />
        </div>

        {/* market footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, borderTop: `1px solid ${C.line}` }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <Pill color={a.kind === "human" ? C.humanDeep : C.machineDeep} bg={a.kind === "human" ? C.humanWash : C.machineWash} label={`${a.name} ${yesPct}¢`} />
            <Pill color={b.kind === "human" ? C.humanDeep : C.machineDeep} bg={b.kind === "human" ? C.humanWash : C.machineWash} label={`${b.name} ${noPct}¢`} />
            <div style={{ display: "flex", fontSize: 14, color: C.ink3, fontFamily: "monospace" }}>
              {`$${duel.volumeUsd.toLocaleString()} volume`}
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 14, color: C.ink3, fontFamily: "monospace" }}>
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
  const tintBg = agent.kind === "human" ? C.humanWash : C.machineWash;
  const tintBorder = agent.kind === "human" ? C.human : C.machine;
  const tintText = agent.kind === "human" ? C.humanDeep : C.machineDeep;
  const sign = score >= 0 ? "+" : "";
  const scoreColor = score >= 0 ? C.positive : C.negative;

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
          width: 132,
          height: 132,
          borderRadius: 24,
          background: tintBg,
          border: `2px solid ${tintBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
          fontWeight: 600,
          color: tintText,
          fontFamily: "sans-serif",
        }}
      >
        {agent.avatar}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: side === "left" ? "flex-start" : "flex-end" }}>
        <div style={{ display: "flex", fontSize: 46, fontWeight: 500, letterSpacing: "-0.02em", color: C.ink, fontStyle: "italic", fontFamily: "serif" }}>
          {agent.name}
        </div>
        <div style={{ display: "flex", fontSize: 16, color: C.ink3, fontFamily: "monospace" }}>
          {`${agent.kind} · ${agent.strategy} · ERC-8004 #${agent.erc8004Id}`}
        </div>
      </div>
      {status !== "upcoming" && (
        <div
          style={{
            display: "flex",
            fontSize: 52,
            fontWeight: 500,
            color: scoreColor,
            fontFamily: "monospace",
            letterSpacing: "-0.02em",
          }}
        >
          {`${sign}${score.toFixed(2)}%`}
        </div>
      )}
    </div>
  );
}

function Pill({ color, bg, label }: { color: string; bg: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        borderRadius: 999,
        background: bg,
        fontSize: 16,
        color,
        fontWeight: 600,
        fontFamily: "monospace",
      }}
    >
      <div style={{ width: 7, height: 7, borderRadius: 999, background: color, display: "flex" }} />
      <span>{label}</span>
    </div>
  );
}
