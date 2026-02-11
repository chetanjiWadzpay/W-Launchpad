require("dotenv").config();

const hre = require("hardhat");
const fs = require("fs");

const DEPLOY_FILE =
  "./deployments/wchain.json";

async function main()
{
  console.log("\n=== TOKEN STATS ===\n");

  if(!fs.existsSync(DEPLOY_FILE))
  {
    console.log("No deployment found");
    return;
  }

  const db =
    JSON.parse(
      fs.readFileSync(DEPLOY_FILE)
    );

  const curve =
    await hre.ethers.getContractAt(
      "BondingCurve",
      db.curve
    );

  const token =
    await hre.ethers.getContractAt(
      "WLaunchpadToken",
      db.token
    );

  const provider =
    hre.ethers.provider;

  const supply =
    await curve.totalSupply();

  const price =
    await curve.getBuyCost(1);

  const liquidity =
    await provider.getBalance(
      db.curve
    );

  const migrated =
    await curve.migrated();

  console.log(
    "Token:",
    db.token
  );

  console.log(
    "Curve:",
    db.curve
  );

  console.log(
    "Supply:",
    supply.toString()
  );

  console.log(
    "Current price:",
    hre.ethers.formatEther(price),
    "WCO"
  );

  console.log(
    "Curve liquidity:",
    hre.ethers.formatEther(liquidity),
    "WCO"
  );

  console.log(
    "Migrated:",
    migrated
      ? "YES (Trading on WSwap)"
      : "NO (Bonding curve active)"
  );

  console.log(
    "\nStats complete\n"
  );
}

main().catch(console.error);
