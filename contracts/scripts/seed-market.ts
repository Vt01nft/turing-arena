import { ethers } from "hardhat";

/// Deploys a DemoMarket for the "Prudence vs Volt" duel from the UI.
/// Run with:
///   npx hardhat run scripts/seed-market.ts --network mantleSepolia
async function main() {
  const [deployer] = await ethers.getSigners();
  const net = await ethers.provider.getNetwork();
  console.log(`\n→ seeding market on chain ${net.chainId} as ${deployer.address}`);
  const bal = await ethers.provider.getBalance(deployer.address);
  console.log(`  balance: ${ethers.formatEther(bal)} MNT\n`);

  const usdcAddr = process.env.NEXT_PUBLIC_USDC;
  if (!usdcAddr) throw new Error("NEXT_PUBLIC_USDC not set in .env.local");
  console.log(`  USDC: ${usdcAddr}`);

  // 7 days from now
  const endsAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

  const Market = await ethers.getContractFactory("DemoMarket");
  const market = await Market.deploy(usdcAddr, endsAt, "Prudence", "Volt");
  await market.waitForDeployment();
  const addr = await market.getAddress();

  console.log(`\n  DemoMarket (duel-001):  ${addr}`);
  console.log(`  endsAt:                ${new Date(endsAt * 1000).toISOString()}`);

  console.log(`\n→ done. Update .env.local:\n`);
  console.log(`NEXT_PUBLIC_DEMO_MARKET_001=${addr}`);
  console.log(`\nVerify on-chain:`);
  console.log(`  https://explorer.sepolia.mantle.xyz/address/${addr}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
