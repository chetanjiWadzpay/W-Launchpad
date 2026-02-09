require("dotenv").config({ path: "./.env", override: true });

const hre = require("hardhat");
const fs = require("fs");

const DEPLOY_FILE = "./deployments/wchain.json";

async function main() {

  const deployments =
    JSON.parse(fs.readFileSync(DEPLOY_FILE));

  const curveAddress =
    deployments.curve;

  const tokenAddress =
    deployments.token;

  const curve =
    await hre.ethers.getContractAt(
      "BondingCurve",
      curveAddress
    );

  const token =
    await hre.ethers.getContractAt(
      "WLaunchpadToken",
      tokenAddress
    );

  const amount = 50;

  console.log("Approving token...");

  const approveTx =
    await token.approve(
      curveAddress,
      amount
    );

  await approveTx.wait();

  console.log("Selling tokens...");

  const tx =
    await curve.sell(amount);

  await tx.wait();

  console.log("SELL SUCCESS");

}

main().catch(console.error);
