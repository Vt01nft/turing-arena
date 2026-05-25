import { NextResponse } from "next/server";
import { getPositions, hasBybitKeys } from "@/lib/bybit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!hasBybitKeys()) return NextResponse.json({ ok: false, reason: "no keys" });
  const url = new URL(req.url);
  const symbol = url.searchParams.get("symbol") ?? undefined;
  const positions = await getPositions(symbol);
  return NextResponse.json({ ok: true, positions: positions ?? [] });
}
