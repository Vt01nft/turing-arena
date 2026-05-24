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
  ai: "#ff4d8d",
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
  const profitColor = won ? COLORS.accent : COLORS.ai;
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
            <div style={{ display: "flex", fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>
              <span>Turing</span>
              <span style={{ color: COLORS.accent }}>Arena</span>
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
    tone === "accent" ? COLORS.accent : tone === "ai" ? COLORS.ai : tone === "dim" ? COLORS.dim : COLORS.fg;
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
