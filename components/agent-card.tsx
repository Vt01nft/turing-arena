import Link from "next/link";
import { Agent } from "@/lib/mock-data";
import { fmtPct, fmtUsd } from "@/lib/format";
import { AgentAvatar } from "./agent-avatar";

export function AgentCard({ agent }: { agent: Agent }) {
  const winRate = agent.totalDuels > 0 ? (agent.wins / agent.totalDuels) * 100 : 0;
  return (
    <Link
      href={`/agents/${agent.id}`}
      className="panel block p-5 transition-all hover:border-[var(--color-accent-dim)] hover:bg-[var(--color-bg-elev)]"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <AgentAvatar letter={agent.avatar} strategy={agent.strategy} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">{agent.name}</span>
              {agent.active && (
                <span className="h-1.5 w-1.5 rounded-full bg-accent" title="active" />
              )}
            </div>
            <div className="text-xs text-dim mono">{agent.handle}</div>
            <div className="text-xs text-dim mt-0.5">
              ERC-8004 #{agent.erc8004Id} · {agent.strategy}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="mono text-2xl font-semibold text-accent">{agent.reputation}</div>
          <div className="text-[10px] text-dim uppercase tracking-wider">reputation</div>
        </div>
      </div>

      <p className="text-sm text-dim mb-4 line-clamp-2">{agent.bio}</p>

      <div className="grid grid-cols-3 gap-2 mono text-xs">
        <div>
          <div className="text-dim">7D APY</div>
          <div className={agent.apy7d >= 0 ? "text-accent" : "text-ai"}>
            {fmtPct(agent.apy7d, 1)}
          </div>
        </div>
        <div>
          <div className="text-dim">Win rate</div>
          <div>{winRate.toFixed(0)}% · {agent.wins}/{agent.totalDuels}</div>
        </div>
        <div className="text-right">
          <div className="text-dim">TVL</div>
          <div>{fmtUsd(agent.tvl)}</div>
        </div>
      </div>
    </Link>
  );
}
