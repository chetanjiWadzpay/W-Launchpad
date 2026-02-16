require("dotenv").config();

const hre = require("hardhat");
const fs = require("fs");
const readline = require("readline");

const updateVolume =
  require("../backend/indexer/volumeTracker");

const indexTrades =
  require("../backend/indexer/indexTrades");

const LAUNCH_FILE =
  "./deployments/launches.json";

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
  if(!fs.existsSync(LAUNCH_FILE))
  {
    throw new Error(
      "No launches found. Run create-launch first."
    );
  }

  const launches =
    JSON.parse(
      fs.readFileSync(LAUNCH_FILE)
    );

  console.log("\nAvailable launches:\n");

  launches.forEach((l, i) =>
  {
    console.log(
      `${i+1}. ${l.name} (${l.symbol})`
    );

    console.log(
      `   Token: ${l.token}`
    );

    console.log(
      `   Curve: ${l.curve}\n`
    );
  });

  const choice =
    await ask("Select launch number: ");

  const launch =
    launches[choice - 1];

  if(!launch)
  {
    throw new Error("Invalid selection");
  }

  const curve =
    await hre.ethers.getContractAt(
      "BondingCurve",
      launch.curve
    );

  const amount = 100;

  const cost =
    await curve.getBuyCost(amount);

  console.log("\n=== BUY INFO ===");

  console.log("Token:", launch.name);
  console.log("Curve:", launch.curve);

  console.log(
    "Amount:",
    amount
  );

  console.log(
    "Cost:",
    hre.ethers.formatEther(cost),
    "WCO"
  );

  const tx =
    await curve.buy(amount,
    {
      value: cost
    });

  console.log(
    "\nTx:",
    tx.hash
  );

  await tx.wait();

  console.log(
    "\nBUY SUCCESS"
  );

  /// update volume

  await updateVolume(
    launch.token,
    cost.toString()
  );

  /// index trades for THIS curve

  await indexTrades(
    launch.curve
  );
}

main().catch(console.error);
