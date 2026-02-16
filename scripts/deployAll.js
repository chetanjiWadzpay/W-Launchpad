require("dotenv").config();

const hre = require("hardhat");
const fs = require("fs");

const saveDeployments =
  require("../utils/saveDeployments");

const loadDeployments =
  require("../utils/loadDeployments");

const uploadMetadata =
  require("../backend/ipfs/uploadMetadata");

const LAUNCH_FILE =
  "./deployments/launches.json";

async function verify(address, args = [])
{
  try
  {
    await hre.run(
      "verify:verify",
      {
        address,
        constructorArguments: args
      }
    );

    console.log("Verified:", address);
  }
  catch(e)
  {
    console.log("Verification failed:", address);
  }
}

async function main()
{
  const [deployer] =
    await hre.ethers.getSigners();

  console.log(
    "\nDeploying with:",
    deployer.address
  );

  let db = {};

  try
  {
    db = loadDeployments();
  }
  catch
  {
    db = {};
  }

  /// -------------------------
  /// DEPLOY FEEMANAGER
  /// -------------------------

  if (!db.feeManager)
  {
    console.log("\nDeploying FeeManager...");

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
  else
  {
    console.log(
      "\nFeeManager exists:",
      db.feeManager
    );
  }

  /// -------------------------
  /// DEPLOY FACTORY
  /// -------------------------

  if (!db.factory)
  {
    console.log("\nDeploying Factory...");

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
  else
  {
    console.log(
      "\nFactory exists:",
      db.factory
    );
  }

  /// -------------------------
  /// SAVE START BLOCK
  /// -------------------------

  db.startBlock =
    await hre.ethers.provider.getBlockNumber();

  /// -------------------------
  /// CREATE DEFAULT TOKEN
  /// -------------------------

  console.log("\nCreating Launch...");

  const factory =
    await hre.ethers.getContractAt(
      "WLaunchpadFactory",
      db.factory
    );

  const name =
    "Token" + Date.now();

  const symbol =
    "T" + Date.now().toString().slice(-4);

  const metadataURI =
    await uploadMetadata({
      name,
      symbol
    });

  /// FIX: tx properly declared

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

  for (const log of receipt.logs)
  {
    try
    {
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

  db.token = token;
  db.curve = curve;
  db.creator = creator;
  db.name = name;
  db.symbol = symbol;

  console.log("\nLaunch Created");

  console.log("Token:", token);
  console.log("Curve:", curve);

  saveDeployments(db);

  /// -------------------------
  /// SAVE LAUNCH FILE
  /// -------------------------

  let launches = [];

  if (fs.existsSync(LAUNCH_FILE))
  {
    launches =
      JSON.parse(
        fs.readFileSync(LAUNCH_FILE)
      );
  }

  launches.push({
    token,
    curve,
    creator,
    name,
    symbol,
    metadataURI,
    createdAt:
      new Date().toISOString()
  });

  fs.writeFileSync(
    LAUNCH_FILE,
    JSON.stringify(
      launches,
      null,
      2
    )
  );

  console.log("\nSaved deployment files");

  console.log("\nDEPLOY COMPLETE\n");
}

main().catch(console.error);
