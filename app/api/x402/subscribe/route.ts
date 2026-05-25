import { NextRequest, NextResponse } from "next/server";
import { getX402Store } from "@/lib/x402-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { subscriber, agentId, signature } = body ?? {};

  if (typeof subscriber !== "string" || typeof agentId !== "string" || typeof signature !== "string") {
    return NextResponse.json(
      { error: "Missing subscriber, agentId, or signature" },
      { status: 400 },
    );
  }

  // Real x402 flow would verify the signature against the EIP-712 payment
  // authorization here. For the demo we trust the signature exists.
  const store = getX402Store();
  const existing = store.get(subscriber, agentId);
  if (existing?.active) {
    return NextResponse.json({ subscription: existing });
  }

  const sub = store.create({ subscriber, agentId, signature });
  return NextResponse.json({ subscription: sub });
}
