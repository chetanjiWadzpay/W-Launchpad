require("dotenv").config({ path: "./.env", override: true });

const hre = require("hardhat");
const fs = require("fs");

const DEPLOY_FILE = "./deployments/wchain.json";

async function main() {

  const deployments =
    JSON.parse(fs.readFileSync(DEPLOY_FILE));

  const curveAddress =
    deployments.curve;

  const curve =
    await hre.ethers.getContractAt(
      "BondingCurve",
      curveAddress
    );

  const amount = 100;

  const cost =
    await curve.getBuyCost(amount);

  console.log(
    "Cost:",
    hre.ethers.formatEther(cost)
  );

  const tx =
    await curve.buy(amount, {
      value: cost
    });

  await tx.wait();

  console.log("BUY SUCCESS");

}

main().catch(console.error);
