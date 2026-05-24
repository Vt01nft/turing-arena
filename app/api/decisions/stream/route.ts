import { NextRequest } from "next/server";
import { getStore, type Decision } from "@/lib/decision-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const store = getStore();
  const duelId = req.nextUrl.searchParams.get("duelId") ?? undefined;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const sse = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      // initial backlog
      const initial = duelId ? store.recentForDuel(duelId) : store.recent();
      sse("hello", { count: initial.length });
      for (const d of initial.slice().reverse()) sse("decision", d);

      const unsub = store.subscribe((d: Decision) => {
        if (duelId && d.duelId !== duelId) return;
        sse("decision", d);
      });

      // keepalive ping (some proxies cut idle SSE)
      const ping = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 20_000);

      const abort = () => {
        clearInterval(ping);
        unsub();
        try {
          controller.close();
        } catch {}
      };
      req.signal.addEventListener("abort", abort);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
