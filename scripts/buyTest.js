require("dotenv").config({
  path: "./.env",
  override: true
});

const hre = require("hardhat");

async function main() {

  const curveAddress =
    "0xfaA1ee2c7969Cd162000e7090824f00310C15305";

  const provider =
    new hre.ethers.JsonRpcProvider(
      "https://rpc.w-chain.com"
    );

  const wallet =
    new hre.ethers.Wallet(
      process.env.PRIVATE_KEY,
      provider
    );

  const curve =
    await hre.ethers.getContractAt(
      "BondingCurve",
      curveAddress,
      wallet
    );

  const amount = 100;

  //  get REAL cost from curve
  const cost =
    await curve.getBuyCost(amount);

  console.log(
    "Real cost:",
    hre.ethers.formatEther(cost),
    "WCO"
  );

  // add 10% buffer
  const value =
    cost * 110n / 100n;

  console.log(
    "Sending:",
    hre.ethers.formatEther(value),
    "WCO"
  );

  const tx =
    await curve.buy(amount, {
      value: value,
      gasLimit: 3000000
    });

  console.log("TX:", tx.hash);

  await tx.wait();

  console.log("\nBUY SUCCESS");

}

main().catch(console.error);
