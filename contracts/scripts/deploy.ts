import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const net = await ethers.provider.getNetwork();
  console.log(`\n→ deploying with ${deployer.address} on chain ${net.chainId}`);
  const bal = await ethers.provider.getBalance(deployer.address);
  console.log(`  balance: ${ethers.formatEther(bal)} MNT\n`);

  // Mocks: USDC (6dec), USDY (18dec ~1$), mETH (18dec ~$3500)
  const Mock = await ethers.getContractFactory("MockERC20");
  const usdc = await Mock.deploy("Mock USDC", "USDC", 6, ethers.parseUnits("1000", 6));
  await usdc.waitForDeployment();
  const usdy = await Mock.deploy("Ondo Mock USDY", "USDY", 18, ethers.parseEther("1000"));
  await usdy.waitForDeployment();
  const meth = await Mock.deploy("Mantle Mock mETH", "mETH", 18, ethers.parseEther("0.5"));
  await meth.waitForDeployment();

  console.log("  USDC:", await usdc.getAddress());
  console.log("  USDY:", await usdy.getAddress());
  console.log("  mETH:", await meth.getAddress());

  // Yield venues (mock APYs)
  const Venue = await ethers.getContractFactory("YieldVenue");
  const usdyVenue = await Venue.deploy(await usdy.getAddress(), 525); // 5.25% APY
  await usdyVenue.waitForDeployment();
  const methVenue = await Venue.deploy(await meth.getAddress(), 380); // 3.80% APY
  await methVenue.waitForDeployment();

  console.log("  USDY venue:", await usdyVenue.getAddress());
  console.log("  mETH venue:", await methVenue.getAddress());

  // Hub placeholder = deployer for now; in production this becomes DuelFactory.
  const Registry = await ethers.getContractFactory("AgentRegistry");
  const registry = await Registry.deploy(deployer.address);
  await registry.waitForDeployment();
  console.log("  AgentRegistry:", await registry.getAddress());

  console.log("\n→ done. Copy these into .env.local:\n");
  console.log(`NEXT_PUBLIC_USDC=${await usdc.getAddress()}`);
  console.log(`NEXT_PUBLIC_USDY=${await usdy.getAddress()}`);
  console.log(`NEXT_PUBLIC_METH=${await meth.getAddress()}`);
  console.log(`NEXT_PUBLIC_USDY_VENUE=${await usdyVenue.getAddress()}`);
  console.log(`NEXT_PUBLIC_METH_VENUE=${await methVenue.getAddress()}`);
  console.log(`NEXT_PUBLIC_AGENT_REGISTRY=${await registry.getAddress()}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
