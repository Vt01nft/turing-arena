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
};

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

  const pickedAgent = side === "A" ? getAgent(duel.agentA)! : getAgent(duel.agentB)!;
  const otherAgent = side === "A" ? getAgent(duel.agentB)! : getAgent(duel.agentA)!;

  const profit = payout - amount;
  const profitColor = won ? COLORS.profit : COLORS.loss;
  const profitSign = profit >= 0 ? "+" : "";
  const roiPct = ((profit / amount) * 100).toFixed(0);

  const headline = won ? "I beat the AI." : "The AI got me.";
  const sub = won
    ? `Stacked $${amount.toFixed(0)} on ${pickedAgent.name} · cashed out $${payout.toFixed(2)}.`
    : `Bet $${amount.toFixed(0)} on ${pickedAgent.name} · ${otherAgent.name} took the duel.`;

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
            background: `radial-gradient(circle at 80% 20%, ${profitColor}22, transparent 60%)`,
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
            <div style={{ display: "flex", fontSize: 28, fontWeight: 600, letterSpacing: -0.6, gap: 4 }}>
              <span>turing</span>
              <span style={{ color: COLORS.faint, fontWeight: 300 }}>·</span>
              <span>arena</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 15,
              letterSpacing: 2,
              color: COLORS.dim,
              fontFamily: "monospace",
            }}
          >
            {`DUEL #${id.slice(-3)} · MANTLE`}
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
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: -3,
              lineHeight: 1.0,
            }}
          >
            {headline}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: COLORS.dim,
              marginTop: 20,
              maxWidth: 900,
            }}
          >
            {sub}
          </div>

          <div
            style={{
              marginTop: 48,
              display: "flex",
              gap: 16,
              alignItems: "stretch",
            }}
          >
            <ReceiptCell label="Staked" value={`$${amount.toFixed(2)}`} />
            <ReceiptCell label="Payout" value={`$${payout.toFixed(2)}`} tone={won ? "accent" : "dim"} />
            <ReceiptCell
              label="P&L"
              value={`${profitSign}$${profit.toFixed(2)}`}
              hint={`${profitSign}${roiPct}% ROI`}
              tone={won ? "accent" : "ai"}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 24,
            borderTop: `1px solid ${COLORS.border}`,
            fontFamily: "monospace",
            fontSize: 18,
            color: COLORS.dim,
          }}
        >
          <div style={{ display: "flex" }}>#MantleAIHackathon</div>
          <div style={{ display: "flex" }}>turing.arena</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

function ReceiptCell({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "accent" | "ai" | "dim";
}) {
  const color =
    tone === "accent" ? COLORS.profit : tone === "ai" ? COLORS.loss : tone === "dim" ? COLORS.dim : COLORS.fg;
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
          fontSize: 14,
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
          fontSize: 48,
          fontWeight: 700,
          color,
          fontFamily: "monospace",
          letterSpacing: -1,
        }}
      >
        {value}
      </div>
      {hint && (
        <div
          style={{
            display: "flex",
            fontSize: 16,
            color: COLORS.dim,
            fontFamily: "monospace",
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
