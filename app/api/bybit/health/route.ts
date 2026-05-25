import { NextResponse } from "next/server";
import { getWalletBalance, getTicker, hasBybitKeys } from "@/lib/bybit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasBybitKeys()) {
    return NextResponse.json({
      ok: false,
      reason: "BYBIT_API_KEY / BYBIT_API_SECRET not configured in .env.local",
    });
  }
  const [balance, ticker] = await Promise.all([getWalletBalance(), getTicker("BTCUSDT")]);
  if (!balance) {
    return NextResponse.json({
      ok: false,
      reason: "Bybit returned an error fetching wallet balance. Check server logs for retCode.",
    });
  }
  return NextResponse.json({
    ok: true,
    environment: "testnet",
    totalEquityUsd: balance.totalEquityUsd,
    totalAvailableBalanceUsd: balance.totalAvailableBalanceUsd,
    coins: balance.coins,
    btcusdt: ticker
      ? {
          lastPrice: ticker.lastPrice,
          change24hPct: ticker.price24hPcnt * 100,
          volume24h: ticker.volume24h,
        }
      : null,
  });
}
