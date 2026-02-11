require("dotenv").config();

const hre = require("hardhat");

const fs = require("fs");

const readline =
  require("readline");

const loadDeployments =
  require("../utils/loadDeployments");

const saveDeployments =
  require("../utils/saveDeployments");

const LAUNCH_FILE =
  "./deployments/launches.json";

function ask(question) {

  const rl =
    readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

  return new Promise(resolve =>
    rl.question(
      question,
      answer => {
        rl.close();
        resolve(answer);
      }
    )
  );

}

async function main() {

  const db =
    loadDeployments();

  const factory =
    await hre.ethers.getContractAt(
      "WLaunchpadFactory",
      db.factory
    );

  const name =
    await ask("Token Name: ");

  const symbol =
    await ask("Token Symbol: ");

  const description =
    await ask("Description (optional): ");

  const image =
    await ask("Image URL (optional): ");

  const twitter =
    await ask("Twitter URL (optional): ");

  const telegram =
    await ask("Telegram URL (optional): ");

  const website =
    await ask("Website URL (optional): ");

  console.log("\nCreating launch...");

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

  db.token = token;
  db.curve = curve;
  db.creator = creator;

  saveDeployments(db);

  let launches = [];

  if (fs.existsSync(LAUNCH_FILE)) {

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

    description,
    image,

    twitter,
    telegram,
    website,

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

  console.log("\nLaunch Created Successfully");

  console.log("Token:", token);
  console.log("Curve:", curve);

}

main().catch(console.error);
