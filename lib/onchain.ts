import { createPublicClient, http, type Address } from "viem";
import { mantleSepolia } from "./chains";
import { AGENT_REGISTRY_ABI } from "./abis";
import { CONTRACTS, isDeployed } from "./contracts";

export const publicClient = createPublicClient({
  chain: mantleSepolia,
  transport: http(),
  batch: { multicall: true },
});

export type OnchainAgent = {
  id: number;
  owner: Address;
  name: string;
  metadataURI: string;
  stake: bigint;
  reputation: bigint;
  totalDuels: number;
  wins: number;
  active: boolean;
};

/// Server-side read of the AgentRegistry. Returns [] if the registry isn't deployed
/// or no agents are registered yet.
export async function getRegisteredAgents(): Promise<OnchainAgent[]> {
  if (!isDeployed(CONTRACTS.agentRegistry)) return [];

  try {
    const nextId = await publicClient.readContract({
      address: CONTRACTS.agentRegistry,
      abi: AGENT_REGISTRY_ABI,
      functionName: "nextAgentId",
    });

    const count = Number(nextId) - 1;
    if (count <= 0) return [];

    const calls = Array.from({ length: count }, (_, i) => ({
      address: CONTRACTS.agentRegistry,
      abi: AGENT_REGISTRY_ABI,
      functionName: "agents" as const,
      args: [BigInt(i + 1)] as const,
    }));

    const results = await publicClient.multicall({ contracts: calls });

    return results
      .map((r, i): OnchainAgent | null => {
        if (r.status !== "success" || !r.result) return null;
        const [owner, name, metadataURI, stake, reputation, totalDuels, wins, active] =
          r.result as readonly [Address, string, string, bigint, bigint, number, number, boolean];
        return {
          id: i + 1,
          owner,
          name,
          metadataURI,
          stake,
          reputation,
          totalDuels,
          wins,
          active,
        };
      })
      .filter((a): a is OnchainAgent => a !== null);
  } catch (e) {
    console.error("[onchain] getRegisteredAgents failed:", e);
    return [];
  }
}
