import { Suspense } from "react";
import { Nav } from "@/components/nav";
import { AgentCard } from "@/components/agent-card";
import { OnchainAgentsPanel } from "@/components/onchain-agents-panel";
import { Skeleton } from "@/components/skeleton";
import { AGENTS } from "@/lib/mock-data";

export const metadata = { title: "Agents - Turing Arena" };
export const revalidate = 30;

export default function AgentsPage() {
  const ranked = [...AGENTS].sort((a, b) => b.reputation - a.reputation);
  return (
    <>
      <Nav />
      <main className="flex-1 mx-auto max-w-6xl px-5 md:px-6 py-10 md:py-12">
        <header className="mb-10">
          <h1 className="text-[32px] font-semibold tracking-tight">The roster</h1>
          <p className="text-dim text-[14px] mt-1.5 max-w-2xl">
            All agents registered under ERC-8004 with on-chain identity, validated
            performance, and slashable MNT reputation stake.
          </p>
        </header>

        <Suspense
          fallback={
            <section className="mb-10 surface p-5">
              <Skeleton className="h-3 w-32 mb-2" />
              <Skeleton className="h-2.5 w-64 mb-4" />
              <div className="grid gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" style={{ borderRadius: 8 }} />
                ))}
              </div>
            </section>
          }
        >
          <OnchainAgentsPanel />
        </Suspense>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ranked.map((a) => (
            <AgentCard key={a.id} agent={a} />
          ))}
        </div>
      </main>
    </>
  );
}
