import { ethers } from "hardhat";

/// Deploys a DemoMarket for each LIVE duel that doesn't already have one,
/// then seeds opening bets so each has volume + a non-50/50 price.
/// duel-001 already has a market (NEXT_PUBLIC_DEMO_MARKET_001).
///
/// Run: npx hardhat run scripts/seed-markets.ts --network mantleSepolia
const LIVE_DUELS = [
  { id: "duel-002", a: "Orbit", b: "Prudence", seedA: 200, seedB: 350 },
  { id: "duel-h001", a: "Mei", b: "Volt", seedA: 480, seedB: 420 },
  { id: "duel-h002", a: "Adrian", b: "Kojo", seedA: 360, seedB: 280 },
  { id: "duel-l001", a: "Helix", b: "Bishop", seedA: 300, seedB: 190 },
];

async function main() {
  const [deployer] = await ethers.getSigners();
  const net = await ethers.provider.getNetwork();
  console.log(`\n→ deploying markets on chain ${net.chainId} as ${deployer.address}`);
  console.log(`  balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} MNT\n`);

  const usdcAddr = process.env.NEXT_PUBLIC_USDC;
  if (!usdcAddr) throw new Error("NEXT_PUBLIC_USDC missing in .env.local");

  const usdc = await ethers.getContractAt("MockERC20", usdcAddr);
  // Make sure deployer has USDC to seed with
  const bal = await usdc.balanceOf(deployer.address);
  if (bal < ethers.parseUnits("3000", 6)) {
    console.log("  dripping USDC for seeding…");
    for (let i = 0; i < 3; i++) {
      const tx = await usdc.drip();
      await tx.wait();
    }
  }

  // Markets stay open 7 days so betting works throughout the demo,
  // independent of the (cosmetic) duel countdown.
  const endsAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const Market = await ethers.getContractFactory("DemoMarket");

  const envLines: string[] = [];
  for (const d of LIVE_DUELS) {
    const market = await Market.deploy(usdcAddr, endsAt, d.a, d.b);
    await market.waitForDeployment();
    const addr = await market.getAddress();
    console.log(`  ${d.id}: ${addr}  (${d.a} vs ${d.b})`);

    // Approve + seed both sides
    const approve = await usdc.approve(addr, ethers.MaxUint256);
    await approve.wait();
    const sA = await market.stake(1, ethers.parseUnits(String(d.seedA), 6));
    await sA.wait();
    const sB = await market.stake(2, ethers.parseUnits(String(d.seedB), 6));
    await sB.wait();
    const priceA = await market.priceA();
    console.log(`     seeded $${d.seedA}/$${d.seedB} → ${Number(priceA) / 100}¢ A`);

    const envKey = `NEXT_PUBLIC_MARKET_${d.id.toUpperCase().replace(/-/g, "_")}`;
    envLines.push(`${envKey}=${addr}`);
  }

  console.log(`\n→ done. Add these to .env.local:\n`);
  console.log(envLines.join("\n"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
