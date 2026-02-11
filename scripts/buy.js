require("dotenv").config();

const hre = require("hardhat");

const selectLaunch =
  require("../utils/selectLaunch");

async function main() {

  const launch =
    await selectLaunch();

  const curve =
    await hre.ethers.getContractAt(
      "BondingCurve",
      launch.curve
    );

  const amount = 100;

  const cost =
    await curve.getBuyCost(amount);

  console.log(
    "\nBuying from:",
    launch.name
  );

  console.log(
    "Cost:",
    hre.ethers.formatEther(cost),
    "WCO"
  );

  const tx =
    await curve.buy(amount, {
      value: cost
    });

  await tx.wait();

  console.log("BUY SUCCESS");

}

main().catch(console.error);
