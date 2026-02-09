require("dotenv").config();
const hre = require("hardhat");

async function main() {

  const privateKey = process.env.PRIVATE_KEY;

  const provider = new hre.ethers.JsonRpcProvider(
    "https://rpc.w-chain.com"
  );

  const wallet = new hre.ethers.Wallet(
    privateKey,
    provider
  );

  console.log("Deploying with wallet:", wallet.address);

  const FeeManager =
    await hre.ethers.getContractFactory(
      "FeeManager",
      wallet
    );

  const contract =
    await FeeManager.deploy(wallet.address);

  await contract.waitForDeployment();

  console.log(
    "Deployed at:",
    await contract.getAddress()
  );

}

main().catch(console.error);
