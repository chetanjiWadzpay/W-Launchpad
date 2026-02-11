require("dotenv").config({
  path: "./.env",
  override: true
});

const hre = require("hardhat");
const fs = require("fs");

const DEPLOY_FILE = "./deployments/wchain.json";
const LAUNCHES_FILE = "./deployments/launches.json";


// -----------------------------
// Helpers
// -----------------------------

function loadDeployments() {

  if (!fs.existsSync(DEPLOY_FILE))
    return {};

  return JSON.parse(
    fs.readFileSync(DEPLOY_FILE)
  );

}

function saveDeployments(data) {

  fs.writeFileSync(
    DEPLOY_FILE,
    JSON.stringify(data, null, 2)
  );

}

function loadLaunches() {

  if (!fs.existsSync(LAUNCHES_FILE))
    return [];

  return JSON.parse(
    fs.readFileSync(LAUNCHES_FILE)
  );

}

function saveLaunch(launch) {

  const launches =
    loadLaunches();

  launches.push(launch);

  fs.writeFileSync(
    LAUNCHES_FILE,
    JSON.stringify(launches, null, 2)
  );

}


// -----------------------------
// Explorer verification helper
// -----------------------------

async function verify(address, args = []) {

  try {

    await hre.run(
      "verify:verify",
      {
        address,
        constructorArguments: args
      }
    );

    console.log("Verified:", address);

  }

  catch (e) {

    if (
      e.message.includes("Already Verified")
    ) {

      console.log(
        "Already verified:",
        address
      );

    }
    else {

      console.log(
        "Verification failed:",
        address
      );

    }

  }

}


// -----------------------------
// Main Deploy Script
// -----------------------------

async function main() {

  const [deployer] =
    await hre.ethers.getSigners();

  console.log(
    "\nDeploying with:",
    deployer.address
  );

  let db =
    loadDeployments();


  // -----------------------------
  // Deploy FeeManager
  // -----------------------------

  if (!db.feeManager) {

    console.log(
      "\nDeploying FeeManager..."
    );

    const FeeManager =
      await hre.ethers.getContractFactory(
        "FeeManager"
      );

    const feeManager =
      await FeeManager.deploy(
        deployer.address
      );

    await feeManager.waitForDeployment();

    db.feeManager =
      await feeManager.getAddress();

    console.log(
      "FeeManager:",
      db.feeManager
    );

    await verify(
      db.feeManager,
      [deployer.address]
    );

  }
  else {

    console.log(
      "\nFeeManager already deployed:",
      db.feeManager
    );

  }


  // -----------------------------
  // Deploy Factory
  // -----------------------------

  if (!db.factory) {

    console.log(
      "\nDeploying Factory..."
    );

    const Factory =
      await hre.ethers.getContractFactory(
        "WLaunchpadFactory"
      );

    const factory =
      await Factory.deploy(
        db.feeManager
      );

    await factory.waitForDeployment();

    db.factory =
      await factory.getAddress();

    console.log(
      "Factory:",
      db.factory
    );

    await verify(
      db.factory,
      [db.feeManager]
    );

  }
  else {

    console.log(
      "\nFactory already deployed:",
      db.factory
    );

  }


  // -----------------------------
  // Create Launch
  // -----------------------------

  console.log(
    "\nCreating Launch..."
  );

  const factory =
    await hre.ethers.getContractAt(
      "WLaunchpadFactory",
      db.factory
    );

  // auto generate unique token name
  const timestamp =
    Date.now();

  const name =
    `Token${timestamp}`;

  const symbol =
    `T${timestamp.toString().slice(-4)}`;

  console.log(
    "Name:",
    name
  );

  console.log(
    "Symbol:",
    symbol
  );

  const tx =
    await factory.createLaunch(
      name,
      symbol
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

      token =
        parsed.args.token;

      curve =
        parsed.args.curve;

      creator =
        parsed.args.creator;

    }
    catch {}

  }


  console.log(
    "\nLaunch Created"
  );

  console.log(
    "Token:",
    token
  );

  console.log(
    "Curve:",
    curve
  );


  db.token = token;
  db.curve = curve;
  db.creator = creator;
  db.name = name;
  db.symbol = symbol;


  saveDeployments(db);


  saveLaunch({

    token,
    curve,
    creator,
    name,
    symbol,

    createdAt:
      new Date().toISOString()

  });


  // -----------------------------
  // Verify Token
  // -----------------------------

  await verify(
    token,
    [
      name,
      symbol,
      creator,
      db.factory
    ]
  );


  // -----------------------------
  // Verify Curve
  // -----------------------------

  await verify(
    curve,
    [
      token,
      creator,
      db.feeManager
    ]
  );


  console.log(
    "\nSaved to deployments/wchain.json"
  );

  console.log(
    "Saved to deployments/launches.json"
  );

  console.log(
    "\nDEPLOY COMPLETE\n"
  );

}


main().catch(console.error);
