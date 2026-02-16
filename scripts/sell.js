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
      "No launches found."
    );
  }

  const launches =
    JSON.parse(
      fs.readFileSync(LAUNCH_FILE)
    );

  const [user] =
    await hre.ethers.getSigners();

  console.log(
    "\nUser:",
    user.address
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

  const token =
    await hre.ethers.getContractAt(
      "WLaunchpadToken",
      launch.token
    );

  const balance =
    await token.balanceOf(
      user.address
    );

  console.log(
    "\nYour token balance:",
    balance.toString()
  );

  const amount =
    await ask("Amount to sell: ");

  if(Number(amount) > Number(balance))
  {
    throw new Error(
      "Not enough tokens"
    );
  }

  const reward =
    await curve.getSellReward(amount);

  console.log(
    "\nYou will receive:",
    hre.ethers.formatEther(reward),
    "WCO"
  );

  console.log("\nApproving...");

  const approveTx =
    await token.approve(
      launch.curve,
      amount
    );

  await approveTx.wait();

  console.log("Selling...");

  const tx =
    await curve.sell(amount);

  console.log(
    "\nTx:",
    tx.hash
  );

  await tx.wait();

  console.log(
    "\nSELL SUCCESS"
  );

  /// update volume

  await updateVolume(
    launch.token,
    reward.toString()
  );

  /// index trades for THIS curve

  await indexTrades(
    launch.curve
  );
}

main().catch(console.error);
