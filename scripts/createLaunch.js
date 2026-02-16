require("dotenv").config();

const hre = require("hardhat");
const fs = require("fs");
const readline = require("readline");

const loadDeployments =
  require("../utils/loadDeployments");

const saveDeployments =
  require("../utils/saveDeployments");

const uploadMetadata =
  require("../backend/ipfs/uploadMetadata");

const LAUNCH_FILE =
  "./deployments/launches.json";

const TOKENS_FILE =
  "./backend/storage/tokens.json";

function ask(question)
{
  const rl =
    readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

  return new Promise(resolve =>
    rl.question(question, answer =>
    {
      rl.close();
      resolve(answer);
    })
  );
}

async function main()
{
  const db =
    loadDeployments();

  if(!db.factory)
  {
    throw new Error(
      "Factory not deployed. Run deploy first."
    );
  }

  const factory =
    await hre.ethers.getContractAt(
      "WLaunchpadFactory",
      db.factory
    );

  console.log("\n=== CREATE NEW TOKEN ===\n");

  const name =
    await ask("Token Name: ");

  const symbol =
    await ask("Token Symbol: ");

  const description =
    await ask("Description: ");

  const image =
    await ask("Image URL: ");

  const twitter =
    await ask("Twitter URL: ");

  const telegram =
    await ask("Telegram URL: ");

  const website =
    await ask("Website URL: ");

  console.log("\nUploading metadata to IPFS...");

  const metadata =
  {
    name,
    symbol,
    description,
    image,
    twitter,
    telegram,
    website
  };

  const metadataURI =
    await uploadMetadata(metadata);

  console.log(
    "Metadata uploaded:",
    metadataURI
  );

  console.log("\nCreating launch on blockchain...");

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

  for(const log of receipt.logs)
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
    catch{}
  }

  /// Save deployments

  db.token = token;
  db.curve = curve;
  db.creator = creator;

  saveDeployments(db);

  /// Save launches.json

  let launches = [];

  if(fs.existsSync(LAUNCH_FILE))
  {
    launches =
      JSON.parse(
        fs.readFileSync(LAUNCH_FILE)
      );
  }

  const launchData =
  {
    token,
    curve,
    creator,
    name,
    symbol,
    metadataURI,
    createdAt:
      new Date().toISOString()
  };

  launches.push(launchData);

  fs.writeFileSync(
    LAUNCH_FILE,
    JSON.stringify(
      launches,
      null,
      2
    )
  );

  /// Save tokens.json (pump.fun style registry)

  let tokens = [];

  if(fs.existsSync(TOKENS_FILE))
  {
    tokens =
      JSON.parse(
        fs.readFileSync(TOKENS_FILE)
      );
  }

  tokens.push(launchData);

  fs.writeFileSync(
    TOKENS_FILE,
    JSON.stringify(
      tokens,
      null,
      2
    )
  );

  console.log("\n=== SUCCESS ===");

  console.log("Token:", token);
  console.log("Curve:", curve);
  console.log("Creator:", creator);
  console.log("Metadata:", metadataURI);

}

main().catch(console.error);
