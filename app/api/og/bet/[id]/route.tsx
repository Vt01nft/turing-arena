import { ImageResponse } from "next/og";
import { getDuel, getAgent } from "@/lib/mock-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const C = {
  bone: "#E8EBF3",
  paper: "#FFFFFF",
  ink: "#1A1F2E",
  ink2: "#3A4256",
  ink3: "#6E7689",
  line: "#D4D8E5",
  positive: "#4A9E7F",
  negative: "#DD7368",
  ochre: "#E8A452",
};

function CapsuleMark() {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" style={{ display: "flex" }}>
      <defs>
        <linearGradient id="bm-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9396F0" />
          <stop offset="100%" stopColor="#5C5FCE" />
        </linearGradient>
        <linearGradient id="bm-bot" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F09A8C" />
          <stop offset="100%" stopColor="#C56353" />
        </linearGradient>
        <clipPath id="bm-clip">
          <rect x="20" y="6" width="24" height="52" rx="12" ry="12" />
        </clipPath>
      </defs>
      <g clipPath="url(#bm-clip)">
        <rect x="20" y="6" width="24" height="26" fill="url(#bm-top)" />
        <rect x="20" y="32" width="24" height="26" fill="url(#bm-bot)" />
      </g>
      <rect x="20" y="6" width="24" height="52" rx="12" ry="12" fill="none" stroke={C.ink} strokeWidth="2" />
      <circle cx="32" cy="32" r="4" fill={C.ochre} stroke={C.ink} strokeWidth="1.4" />
    </svg>
  );
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(req.url);
  const side = (url.searchParams.get("side") ?? "A").toUpperCase() as "A" | "B";
  const amount = parseFloat(url.searchParams.get("amount") ?? "25");
  const payout = parseFloat(url.searchParams.get("payout") ?? "58");
  const won = url.searchParams.get("won") !== "false";

  const duel = getDuel(id);
  if (!duel) {
    return new ImageResponse(
      (<div style={{ width: "100%", height: "100%", display: "flex", background: C.bone, color: C.ink, fontSize: 48, alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>Duel not found</div>),
      { width: 1200, height: 630 },
    );
  }

  const picked = side === "A" ? getAgent(duel.agentA)! : getAgent(duel.agentB)!;
  const other = side === "A" ? getAgent(duel.agentB)! : getAgent(duel.agentA)!;
  const profit = payout - amount;
  const profitColor = won ? C.positive : C.negative;
  const profitSign = profit >= 0 ? "+" : "";
  const roiPct = ((profit / amount) * 100).toFixed(0);

  const headline = won ? "I beat the AI." : "The AI got me.";
  const sub = won
    ? `Stacked $${amount.toFixed(0)} on ${picked.name} · cashed out $${payout.toFixed(2)}.`
    : `Bet $${amount.toFixed(0)} on ${picked.name} · ${other.name} took the duel.`;

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
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 80% 20%, ${profitColor}33, transparent 60%)`, filter: "blur(30px)", display: "flex" }} />

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
          <div style={{ display: "flex", fontSize: 14, letterSpacing: 2, color: C.ink3, fontFamily: "monospace" }}>
            {`DUEL #${id.slice(-3)} · MANTLE`}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1 }}>
            <span style={{ fontFamily: "serif", fontStyle: "italic", fontWeight: 400, color: profitColor }}>
              {headline}
            </span>
          </div>
          <div style={{ display: "flex", fontSize: 26, color: C.ink2, marginTop: 24, maxWidth: 900 }}>
            {sub}
          </div>

          <div style={{ marginTop: 48, display: "flex", gap: 16, alignItems: "stretch" }}>
            <Cell label="Staked" value={`$${amount.toFixed(2)}`} />
            <Cell label="Payout" value={`$${payout.toFixed(2)}`} tone={won ? "positive" : "dim"} />
            <Cell
              label="P&L"
              value={`${profitSign}$${profit.toFixed(2)}`}
              hint={`${profitSign}${roiPct}% ROI`}
              tone={won ? "positive" : "negative"}
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, borderTop: `1px solid ${C.line}`, fontFamily: "monospace", fontSize: 16, color: C.ink3 }}>
          <div style={{ display: "flex" }}>#MantleAIHackathon</div>
          <div style={{ display: "flex" }}>turing.arena</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

function Cell({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "positive" | "negative" | "dim" }) {
  const color =
    tone === "positive" ? C.positive
      : tone === "negative" ? C.negative
      : tone === "dim" ? C.ink3
      : C.ink;
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
      <div style={{ display: "flex", fontSize: 14, letterSpacing: 2, color: C.ink3, textTransform: "uppercase", fontWeight: 500 }}>{label}</div>
      <div style={{ display: "flex", fontSize: 48, fontWeight: 500, color, fontFamily: "monospace", letterSpacing: "-0.02em" }}>{value}</div>
      {hint && <div style={{ display: "flex", fontSize: 16, color: C.ink3, fontFamily: "monospace" }}>{hint}</div>}
    </div>
  );
}
