import { NextRequest, NextResponse } from "next/server";
import { getX402Store } from "@/lib/x402-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { subscriber, agentId } = body ?? {};
  if (!subscriber || !agentId) {
    return NextResponse.json({ error: "subscriber and agentId required" }, { status: 400 });
  }
  const store = getX402Store();
  const sub = store.cancel(subscriber, agentId);
  return NextResponse.json({ subscription: sub ?? null });
}
