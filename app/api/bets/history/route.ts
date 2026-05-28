import { NextResponse } from "next/server";
import { parseAbiItem, type Address } from "viem";
import { publicClient } from "@/lib/onchain";
import { CONTRACTS, isDeployed } from "@/lib/contracts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STAKE_EVENT = parseAbiItem("event Stake(address indexed who, uint8 side, uint256 amount)");

/// GET /api/bets/history?address=0x...
/// Returns the connected wallet's on-chain Stake events on the
/// duel-001 DemoMarket, newest first. This is the real bet history.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address") as Address | null;
  if (!address) return NextResponse.json({ ok: false, reason: "address required" }, { status: 400 });

  const market = CONTRACTS.demoMarket001 as Address;
  if (!isDeployed(market)) return NextResponse.json({ ok: true, bets: [] });

  try {
    const latest = await publicClient.getBlockNumber();
    // Mantle Sepolia ~2s blocks; look back ~900k blocks (~3 weeks) which
    // comfortably covers the market deployment.
    const fromBlock = latest > 900_000n ? latest - 900_000n : 0n;

    const logs = await publicClient.getLogs({
      address: market,
      event: STAKE_EVENT,
      args: { who: address },
      fromBlock,
      toBlock: "latest",
    });

    // Enrich each with the block timestamp
    const blocks = new Map<bigint, number>();
    const bets = [];
    for (const log of logs) {
      let ts = blocks.get(log.blockNumber);
      if (ts === undefined) {
        try {
          const blk = await publicClient.getBlock({ blockNumber: log.blockNumber });
          ts = Number(blk.timestamp);
          blocks.set(log.blockNumber, ts);
        } catch {
          ts = 0;
        }
      }
      bets.push({
        side: Number(log.args.side),
        amount: (Number(log.args.amount ?? 0n) / 1e6).toFixed(2),
        txHash: log.transactionHash,
        blockNumber: Number(log.blockNumber),
        timestamp: ts,
      });
    }
    bets.sort((a, b) => b.blockNumber - a.blockNumber);
    return NextResponse.json({ ok: true, bets });
  } catch (e) {
    console.error("[bets/history] failed:", e);
    return NextResponse.json({ ok: false, reason: "log query failed", bets: [] });
  }
}
