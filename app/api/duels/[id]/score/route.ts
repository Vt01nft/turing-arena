import { NextResponse } from "next/server";
import { getDuel } from "@/lib/mock-data";
import { refreshWhaleEngine } from "@/lib/whale-engine";
import { liveDuelScores } from "@/lib/live-stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/// GET /api/duels/[id]/score
/// Returns the live score for both contestants. Triggers a whale-engine
/// refresh so the numbers reflect the freshest BTC mainnet PnL.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const duel = getDuel(id);
  if (!duel) return NextResponse.json({ ok: false, reason: "duel not found" }, { status: 404 });
  // Refresh so live whale stats are current
  await refreshWhaleEngine();
  const score = liveDuelScores(duel.agentA, duel.agentB, duel.scoreA, duel.scoreB);
  return NextResponse.json({ ok: true, duelId: id, score });
}
