require("dotenv").config();

const hre = require("hardhat");
const fs = require("fs");

const DEPLOY_FILE =
  "./deployments/wchain.json";

const LAUNCH_FILE =
  "./deployments/launches.json";

async function main()
{
  console.log("\n=== PLATFORM DASHBOARD ===\n");

  if(!fs.existsSync(DEPLOY_FILE))
  {
    console.log("No deployments found");
    return;
  }

  if(!fs.existsSync(LAUNCH_FILE))
  {
    console.log("No launches found");
    return;
  }

  const db =
    JSON.parse(
      fs.readFileSync(DEPLOY_FILE)
    );

  const launches =
    JSON.parse(
      fs.readFileSync(LAUNCH_FILE)
    );

  const feeManager =
    await hre.ethers.getContractAt(
      "FeeManager",
      db.feeManager
    );

  const platform =
    await feeManager.platform();

  const provider =
    hre.ethers.provider;

  const platformBalance =
    await provider.getBalance(platform);

  console.log(
    "Platform wallet:",
    platform
  );

  console.log(
    "Platform earnings:",
    hre.ethers.formatEther(
      platformBalance
    ),
    "WCO\n"
  );

  console.log(
    "Total launches:",
    launches.length,
    "\n"
  );

  let totalLiquidity = 0n;
  let totalSupply = 0n;

  for(const launch of launches)
  {
    const curve =
      await hre.ethers.getContractAt(
        "BondingCurve",
        launch.curve
      );

    const token =
      await hre.ethers.getContractAt(
        "WLaunchpadToken",
        launch.token
      );

    const supply =
      await curve.totalSupply();

    const liquidity =
      await provider.getBalance(
        launch.curve
      );

    const migrated =
      await curve.migrated();

    totalLiquidity += liquidity;
    totalSupply += supply;

    console.log(
      "Token:",
      launch.name,
      `(${launch.symbol})`
    );

    console.log(
      "Creator:",
      launch.creator
    );

    console.log(
      "Supply:",
      supply.toString()
    );

    console.log(
      "Liquidity:",
      hre.ethers.formatEther(
        liquidity
      ),
      "WCO"
    );

    console.log(
      "Migrated:",
      migrated
        ? "YES (Trading on WSwap)"
        : "NO (Trading on Curve)"
    );

    console.log(
      "Token Address:",
      launch.token
    );

    console.log(
      "Curve Address:",
      launch.curve
    );

    console.log(
      "Created:",
      launch.createdAt
    );

    console.log(
      "--------------------------------\n"
    );
  }

  console.log(
    "TOTAL SUPPLY:",
    totalSupply.toString()
  );

  console.log(
    "TOTAL LIQUIDITY:",
    hre.ethers.formatEther(
      totalLiquidity
    ),
    "WCO"
  );

  console.log(
    "\nDashboard complete\n"
  );
}

main().catch(console.error);
