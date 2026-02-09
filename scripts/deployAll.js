require("dotenv").config({ path: "./.env", override: true });

const hre = require("hardhat");
const fs = require("fs");

const FILE = "./deployments/wchain.json";

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function load() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE));
}

async function main() {

  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  let db = load();

  // --------------------
  // Deploy FeeManager
  // --------------------

  if (!db.feeManager) {

    console.log("Deploying FeeManager...");

    const FeeManager =
      await hre.ethers.getContractFactory("FeeManager");

    const feeManager =
      await FeeManager.deploy(deployer.address);

    await feeManager.waitForDeployment();

    db.feeManager =
      await feeManager.getAddress();

    console.log("FeeManager:", db.feeManager);

  }

  // --------------------
  // Deploy Factory
  // --------------------

  if (!db.factory) {

    console.log("Deploying Factory...");

    const Factory =
      await hre.ethers.getContractFactory("WLaunchpadFactory");

    const factory =
      await Factory.deploy(db.feeManager);

    await factory.waitForDeployment();

    db.factory =
      await factory.getAddress();

    console.log("Factory:", db.factory);

  }

  // --------------------
  // Create Launch
  // --------------------

  console.log("Creating Launch...");

  const factory =
    await hre.ethers.getContractAt(
      "WLaunchpadFactory",
      db.factory
    );

  const tx =
    await factory.createLaunch(
      "TestToken",
      "TEST"
    );

  const receipt =
    await tx.wait();

  const iface =
    new hre.ethers.Interface([
      "event LaunchCreated(address token,address curve,address creator)"
    ]);

  for (const log of receipt.logs) {

    try {

      const parsed =
        iface.parseLog(log);

      db.token =
        parsed.args.token;

      db.curve =
        parsed.args.curve;

      db.creator =
        parsed.args.creator;

    }
    catch {}

  }

  console.log("Token:", db.token);
  console.log("Curve:", db.curve);

  save(db);

  console.log("\nSaved to deployments/wchain.json");

}

main().catch(console.error);
