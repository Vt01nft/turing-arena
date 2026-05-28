import { NextResponse } from "next/server";
import { createWalletClient, http, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mantleSepolia } from "@/lib/chains";
import { DEMO_MARKET_ABI } from "@/lib/abis";
import { marketFor } from "@/lib/contracts";
import { getDuel } from "@/lib/mock-data";
import { refreshWhaleEngine } from "@/lib/whale-engine";
import { liveDuelScores } from "@/lib/live-stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/// POST /api/duels/[id]/settle
/// Idempotent settlement endpoint. If the duel's endsAt has passed AND
/// the duel has an on-chain market AND the market isn't already
/// resolved, computes the winner from the live whale PnL and calls
/// DemoMarket.resolve(side) using the deployer key.
///
/// Anyone can hit this in dev. In production we'd lock it down behind
/// a Vercel Cron with a shared secret.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const duel = getDuel(id);
  if (!duel) return NextResponse.json({ ok: false, reason: "duel not found" }, { status: 404 });

  const now = Math.floor(Date.now() / 1000);
  if (duel.endsAt > now) {
    return NextResponse.json({
      ok: false,
      reason: `not over yet (${duel.endsAt - now}s remaining)`,
    });
  }

  const marketAddr = marketFor(id);
  if (!marketAddr) {
    return NextResponse.json({ ok: false, reason: "no on-chain market for this duel" });
  }

  const pk = process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) {
    return NextResponse.json(
      { ok: false, reason: "DEPLOYER_PRIVATE_KEY missing in .env.local" },
      { status: 500 },
    );
  }

  // Compute the winner from live whale PnL
  await refreshWhaleEngine();
  const score = liveDuelScores(duel.agentA, duel.agentB, duel.scoreA, duel.scoreB);
  const winningSide: 1 | 2 = score.scoreA >= score.scoreB ? 1 : 2;

  const account = privateKeyToAccount(pk as Hex);
  const client = createWalletClient({
    account,
    chain: mantleSepolia,
    transport: http(),
  });

  try {
    const hash = await client.writeContract({
      address: marketAddr,
      abi: DEMO_MARKET_ABI,
      functionName: "resolve",
      args: [winningSide],
    });
    return NextResponse.json({
      ok: true,
      duelId: id,
      winningSide,
      winner: winningSide === 1 ? duel.agentA : duel.agentB,
      scoreA: score.scoreA,
      scoreB: score.scoreB,
      txHash: hash,
      explorer: `https://explorer.sepolia.mantle.xyz/tx/${hash}`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Most common failure: already resolved
    if (msg.includes("AlreadyResolved") || msg.includes("already")) {
      return NextResponse.json({ ok: true, reason: "already resolved" });
    }
    return NextResponse.json({ ok: false, reason: msg.split("\n")[0] }, { status: 502 });
  }
}
