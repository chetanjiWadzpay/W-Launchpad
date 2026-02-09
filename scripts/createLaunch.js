require("dotenv").config({ path: "./.env", override: true });

const hre = require("hardhat");
const fs = require("fs");

const DEPLOY_FILE = "./deployments/wchain.json";

async function main() {

  if (!fs.existsSync(DEPLOY_FILE)) {
    throw new Error("Deployments file not found. Run deploy first.");
  }

  const deployments =
    JSON.parse(fs.readFileSync(DEPLOY_FILE));

  const factoryAddress =
    deployments.factory;

  const factory =
    await hre.ethers.getContractAt(
      "WLaunchpadFactory",
      factoryAddress
    );

  console.log("Creating new launch...");

  const tx =
    await factory.createLaunch(
      "MyToken",
      "MTK"
    );

  const receipt =
    await tx.wait();

  const iface =
    new hre.ethers.Interface([
      "event LaunchCreated(address token,address curve,address creator)"
    ]);

  let token, curve, creator;

  for (const log of receipt.logs) {

    try {

      const parsed =
        iface.parseLog(log);

      token = parsed.args.token;
      curve = parsed.args.curve;
      creator = parsed.args.creator;

    } catch {}

  }

  console.log("Token:", token);
  console.log("Curve:", curve);

  deployments.token = token;
  deployments.curve = curve;
  deployments.creator = creator;

  fs.writeFileSync(
    DEPLOY_FILE,
    JSON.stringify(deployments, null, 2)
  );

  console.log("Updated deployments file.");

}

main().catch(console.error);
