require("dotenv").config({
  path: "./.env",
  override: true
});

const hre = require("hardhat");

async function main() {

  const txHash =
  "0xf159d8c862f6545b68e14e538bc73bcf45f21ceed48c199cedaaae0cd1b63c16";

  const receipt =
    await hre.ethers.provider.getTransactionReceipt(txHash);

  const iface =
    new hre.ethers.Interface([
      "event LaunchCreated(address token,address curve,address creator)"
    ]);

  for(const log of receipt.logs)
  {
    try {

      const parsed =
        iface.parseLog(log);

      console.log("\nTOKEN:", parsed.args.token);
      console.log("CURVE:", parsed.args.curve);
      console.log("CREATOR:", parsed.args.creator);

    }
    catch(e){}
  }

}

main().catch(console.error);
