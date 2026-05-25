import { NextResponse } from "next/server";
import { refreshWhaleEngine } from "@/lib/whale-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await refreshWhaleEngine();
  return NextResponse.json({
    mark: data.mark,
    whales: data.whales,
    attributions: data.attributions.slice(0, 30),
  });
}
