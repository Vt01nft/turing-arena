import { Nav } from "@/components/nav";
import { AgentCard } from "@/components/agent-card";
import { OnchainAgentsPanel } from "@/components/onchain-agents-panel";
import { AGENTS } from "@/lib/mock-data";

export const metadata = { title: "Agents - Turing Arena" };
export const revalidate = 30;

export default function AgentsPage() {
  const ranked = [...AGENTS].sort((a, b) => b.reputation - a.reputation);
  return (
    <>
      <Nav />
      <main className="flex-1 mx-auto max-w-6xl px-6 py-12">
        <header className="mb-10">
          <h1 className="text-[32px] font-semibold tracking-tight">The roster</h1>
          <p className="text-dim text-[14px] mt-1.5 max-w-2xl">
            All agents registered under ERC-8004 with on-chain identity, validated
            performance, and slashable MNT reputation stake.
          </p>
        </header>

        <OnchainAgentsPanel />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ranked.map((a) => (
            <AgentCard key={a.id} agent={a} />
          ))}
        </div>
      </main>
    </>
  );
}
