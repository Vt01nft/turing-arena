import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/decision-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const store = getStore();
  const duelId = req.nextUrl.searchParams.get("duelId");
  const items = duelId ? store.recentForDuel(duelId) : store.recent();
  return NextResponse.json({ items });
}
