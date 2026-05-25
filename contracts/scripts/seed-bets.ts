import { ethers } from "hardhat";

/// Drips USDC for the deployer, approves the DemoMarket, and places opening
/// bets on both sides so duel-001 has real volume + a non-50/50 price on
/// first paint.
async function main() {
  const [deployer] = await ethers.getSigners();
  const usdcAddr = process.env.NEXT_PUBLIC_USDC;
  const marketAddr = process.env.NEXT_PUBLIC_DEMO_MARKET_001;
  if (!usdcAddr || !marketAddr) {
    throw new Error("Missing NEXT_PUBLIC_USDC or NEXT_PUBLIC_DEMO_MARKET_001 in .env.local");
  }

  console.log(`\n→ seeding bets on ${marketAddr}`);
  console.log(`  deployer: ${deployer.address}\n`);

  const usdc = await ethers.getContractAt("MockERC20", usdcAddr);
  const market = await ethers.getContractAt("DemoMarket", marketAddr);

  // 1. drip USDC (1000 per call, deployer is owner so can call mint too)
  console.log(`  dripping USDC…`);
  const drip = await usdc.drip();
  await drip.wait();
  const bal = await usdc.balanceOf(deployer.address);
  console.log(`  balance: ${ethers.formatUnits(bal, 6)} USDC`);

  // 2. approve market
  console.log(`  approving market…`);
  const approve = await usdc.approve(marketAddr, ethers.MaxUint256);
  await approve.wait();

  // 3. stake $300 on A (Prudence), $400 on B (Volt) - gives A ~43¢, B ~57¢
  console.log(`  staking $300 on side A (Prudence)…`);
  const stakeA = await market.stake(1, ethers.parseUnits("300", 6));
  await stakeA.wait();

  console.log(`  staking $400 on side B (Volt)…`);
  const stakeB = await market.stake(2, ethers.parseUnits("400", 6));
  await stakeB.wait();

  const poolA = await market.poolA();
  const poolB = await market.poolB();
  const priceA = await market.priceA();
  console.log(`\n  poolA: $${ethers.formatUnits(poolA, 6)}`);
  console.log(`  poolB: $${ethers.formatUnits(poolB, 6)}`);
  console.log(`  priceA: ${Number(priceA) / 100}¢`);
  console.log(`\n→ done. Refresh /duels/duel-001 to see live volume.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
