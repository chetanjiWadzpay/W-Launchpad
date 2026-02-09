const hre = require("hardhat");

async function main() {

  const provider = hre.ethers.provider;

  const wallet = new hre.ethers.Wallet(
    process.env.PRIVATE_KEY,
    provider
  );

  console.log("Deploying with:", wallet.address);

  const feeManagerAddress =
    "0x86EE876Cc14d67Cc1ed265C023aaa0659f93Ef24";

  const Factory =
    await hre.ethers.getContractFactory(
      "WLaunchpadFactory",
      wallet
    );

  const factory =
    await Factory.deploy(feeManagerAddress);

  await factory.waitForDeployment();

  console.log(
    "Factory deployed at:",
    await factory.getAddress()
  );

}

main().catch(console.error);
