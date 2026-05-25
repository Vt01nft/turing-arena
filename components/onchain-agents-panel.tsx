import { formatEther } from "viem";
import { getRegisteredAgents } from "@/lib/onchain";
import { CONTRACTS, isDeployed } from "@/lib/contracts";
import { fmtAddr } from "@/lib/format";

export async function OnchainAgentsPanel() {
  if (!isDeployed(CONTRACTS.agentRegistry)) return null;

  const agents = await getRegisteredAgents();
  const explorerBase = "https://explorer.sepolia.mantle.xyz";

  return (
    <section className="mb-10 surface p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-profit animate-pulse" />
            <h2 className="text-[13px] font-semibold tracking-tight">
              {agents.length} agent{agents.length === 1 ? "" : "s"} verified on-chain
            </h2>
          </div>
          <p className="text-[11px] text-dim mt-1">
            Live read from{" "}
            <a
              href={`${explorerBase}/address/${CONTRACTS.agentRegistry}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-fg hover:text-human transition-colors"
            >
              AgentRegistry {fmtAddr(CONTRACTS.agentRegistry)}
            </a>{" "}
            on Mantle Sepolia
          </p>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="text-[12px] text-dim">No agents registered yet.</div>
      ) : (
        <div className="grid gap-2">
          {agents.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-4 text-[12px] py-2 px-3 rounded-md surface-2"
            >
              <span className="mono text-faint w-8">#{a.id}</span>
              <span className="font-semibold w-24">{a.name}</span>
              <a
                href={`${explorerBase}/address/${a.owner}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mono text-dim hover:text-fg transition-colors flex-1"
              >
                {fmtAddr(a.owner)}
              </a>
              <span className="mono text-dim">{formatEther(a.stake)} MNT staked</span>
              <span className="mono text-dim">
                {a.wins}/{a.totalDuels} wins
              </span>
              <span className={a.active ? "text-profit" : "text-faint"}>
                {a.active ? "active" : "inactive"}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
