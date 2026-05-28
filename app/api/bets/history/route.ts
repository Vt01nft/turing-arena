import { NextResponse } from "next/server";
import { parseAbiItem, type Address } from "viem";
import { publicClient } from "@/lib/onchain";
import { onchainMarkets } from "@/lib/contracts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STAKE_EVENT = parseAbiItem("event Stake(address indexed who, uint8 side, uint256 amount)");

/// GET /api/bets/history?address=0x...
/// Returns the wallet's on-chain Stake events across EVERY live duel
/// market, newest first, each tagged with its duelId.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address") as Address | null;
  if (!address) return NextResponse.json({ ok: false, reason: "address required" }, { status: 400 });

  const markets = onchainMarkets();
  if (markets.length === 0) return NextResponse.json({ ok: true, bets: [] });

  try {
    const latest = await publicClient.getBlockNumber();
    const fromBlock = latest > 900_000n ? latest - 900_000n : 0n;
    const blockTs = new Map<bigint, number>();

    const all: {
      duelId: string;
      side: number;
      amount: string;
      txHash: string;
      blockNumber: number;
      timestamp: number;
    }[] = [];

    for (const { duelId, address: market } of markets) {
      const logs = await publicClient.getLogs({
        address: market,
        event: STAKE_EVENT,
        args: { who: address },
        fromBlock,
        toBlock: "latest",
      });
      for (const log of logs) {
        let ts = blockTs.get(log.blockNumber);
        if (ts === undefined) {
          try {
            const blk = await publicClient.getBlock({ blockNumber: log.blockNumber });
            ts = Number(blk.timestamp);
          } catch {
            ts = 0;
          }
          blockTs.set(log.blockNumber, ts);
        }
        all.push({
          duelId,
          side: Number(log.args.side),
          amount: (Number(log.args.amount ?? 0n) / 1e6).toFixed(2),
          txHash: log.transactionHash,
          blockNumber: Number(log.blockNumber),
          timestamp: ts,
        });
      }
    }

    all.sort((a, b) => b.blockNumber - a.blockNumber);
    return NextResponse.json({ ok: true, bets: all });
  } catch (e) {
    console.error("[bets/history] failed:", e);
    return NextResponse.json({ ok: false, reason: "log query failed", bets: [] });
  }
}
