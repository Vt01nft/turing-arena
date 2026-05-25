import { NextResponse } from "next/server";
import { getTicker } from "@/lib/bybit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const symbol = url.searchParams.get("symbol") ?? "BTCUSDT";
  const category = (url.searchParams.get("category") as "linear" | "spot" | null) ?? "linear";
  const ticker = await getTicker(symbol, category);
  if (!ticker) return NextResponse.json({ error: "ticker fetch failed" }, { status: 502 });
  return NextResponse.json(ticker);
}
