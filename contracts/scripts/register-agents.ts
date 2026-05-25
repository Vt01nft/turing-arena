import { ethers } from "hardhat";

/// Redeploys the AgentRegistry (lower MIN_STAKE) and registers the three demo
/// agents from the UI on-chain. Run with:
///   npx hardhat run scripts/register-agents.ts --network mantleSepolia
async function main() {
  const [deployer] = await ethers.getSigners();
  const net = await ethers.provider.getNetwork();
  console.log(`\n→ registering on chain ${net.chainId} as ${deployer.address}`);
  const bal = await ethers.provider.getBalance(deployer.address);
  console.log(`  balance: ${ethers.formatEther(bal)} MNT\n`);

  const Registry = await ethers.getContractFactory("AgentRegistry");
  const registry = await Registry.deploy(deployer.address);
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log(`  AgentRegistry: ${registryAddr}`);

  const minStake = await registry.MIN_STAKE();
  console.log(`  MIN_STAKE:     ${ethers.formatEther(minStake)} MNT\n`);

  const agents = [
    {
      name: "Prudence",
      uri: "ipfs://demo/prudence.json",
    },
    {
      name: "Volt",
      uri: "ipfs://demo/volt.json",
    },
    {
      name: "Orbit",
      uri: "ipfs://demo/orbit.json",
    },
  ];

  // We can't have one wallet register more than one agent (agentIdOf prevents),
  // so we use deterministic disposable signers for agents 2 & 3 and fund them.
  // For pure demo purposes here, we'll register only the first agent from the
  // deployer; the other two would normally be different wallets owned by their
  // teams. We simulate this with throwaway HD wallets and fund them from the
  // deployer.
  const ownerKeys: string[] = [
    "0x" + "1".repeat(63) + "2",
    "0x" + "1".repeat(63) + "3",
    "0x" + "1".repeat(63) + "4",
  ];

  const fundEach = minStake + ethers.parseEther("0.1"); // stake + generous gas buffer
  const ids: bigint[] = [];

  for (let i = 0; i < agents.length; i++) {
    const owner = new ethers.Wallet(ownerKeys[i], ethers.provider);

    const ownerBal = await ethers.provider.getBalance(owner.address);
    if (ownerBal < fundEach) {
      console.log(`  funding agent ${i + 1} owner ${owner.address}`);
      const fundTx = await deployer.sendTransaction({
        to: owner.address,
        value: fundEach,
      });
      await fundTx.wait();
    }

    const tx = await (registry.connect(owner) as typeof registry).register(
      agents[i].name,
      agents[i].uri,
      { value: minStake },
    );
    const receipt = await tx.wait();
    const log = receipt!.logs.find((l) => {
      try {
        return registry.interface.parseLog(l)?.name === "AgentRegistered";
      } catch {
        return false;
      }
    });
    const parsed = log ? registry.interface.parseLog(log) : null;
    const id = parsed?.args?.[0] as bigint;
    ids.push(id);
    console.log(`  ✓ ${agents[i].name.padEnd(10)} → agent #${id}  owner ${owner.address}`);
  }

  console.log(`\n→ done. Update .env.local:\n`);
  console.log(`NEXT_PUBLIC_AGENT_REGISTRY=${registryAddr}`);
  console.log(`\nVerify on-chain:`);
  console.log(`  https://explorer.sepolia.mantle.xyz/address/${registryAddr}`);
  console.log(`\nAgent IDs: ${ids.join(", ")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
