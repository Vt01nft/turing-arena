import { NextRequest, NextResponse } from "next/server";
import { getX402Store } from "@/lib/x402-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const subscriber = req.nextUrl.searchParams.get("subscriber");
  const agentId = req.nextUrl.searchParams.get("agentId");
  if (!subscriber || !agentId) {
    return NextResponse.json({ error: "subscriber and agentId required" }, { status: 400 });
  }
  const store = getX402Store();

  // Simulate per-action billing: pretend ~1 action / 30s on this agent.
  const sub = store.get(subscriber, agentId);
  if (sub && sub.active) {
    const elapsed = Math.floor(Date.now() / 1000) - sub.lastBilledAt;
    const newActions = Math.floor(elapsed / 30);
    if (newActions > 0) store.bill(subscriber, agentId, newActions);
  }

  return NextResponse.json({ subscription: store.get(subscriber, agentId) ?? null });
}
