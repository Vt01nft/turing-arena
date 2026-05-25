import { NextResponse } from "next/server";
import { placeOrder, hasBybitKeys, getTicker } from "@/lib/bybit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/// POST /api/bybit/trade
/// Body: { side: "Buy" | "Sell", symbol?: string, notionalUsdt?: number, qty?: string }
///
/// If qty is omitted, computes contract size from notionalUsdt / lastPrice.
/// Defaults to 50 USDT notional on BTCUSDT perp.
export async function POST(req: Request) {
  if (!hasBybitKeys()) {
    return NextResponse.json({ ok: false, reason: "no keys" }, { status: 400 });
  }
  const body = await req.json().catch(() => ({}));
  const side = body.side === "Sell" ? "Sell" : "Buy";
  const symbol = (body.symbol as string) || "BTCUSDT";
  const notional = Number(body.notionalUsdt ?? 50);
  let qty: string | undefined = body.qty;

  if (!qty) {
    const t = await getTicker(symbol);
    if (!t) {
      return NextResponse.json({ ok: false, reason: "ticker fetch failed" }, { status: 502 });
    }
    // round to 3 decimals (BTC lot size = 0.001 on testnet)
    const computed = notional / t.lastPrice;
    qty = (Math.max(0.001, Math.round(computed * 1000) / 1000)).toFixed(3);
  }

  const result = await placeOrder({ symbol, side, orderType: "Market", qty, category: "linear" });
  if (!result) {
    return NextResponse.json({ ok: false, reason: "order rejected, see server logs" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, orderId: result.orderId, side, symbol, qty });
}
