require("dotenv").config();

const hre = require("hardhat");

const readline = require("readline");

const selectLaunch =
  require("../utils/selectLaunch");


// -------------------------
// helper: ask user input
// -------------------------

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


// -------------------------
// main
// -------------------------

async function main() {

  const [user] =
    await hre.ethers.getSigners();

  console.log(
    "\nUser:",
    user.address
  );


  // select launch
  const launch =
    await selectLaunch();

  console.log(
    "\nSelected Launch:",
    launch.name,
    `(${launch.symbol})`
  );


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


  // get balance
  const balance =
    await token.balanceOf(
      user.address
    );

  console.log(
    "Your token balance:",
    balance.toString()
  );

  if (balance == 0) {

    console.log(
      "\nYou have no tokens to sell."
    );

    return;

  }


  // ask amount
  const amountInput =
    await ask(
      "Amount to sell: "
    );

  const amount =
    Number(amountInput);


  if (amount > balance) {

    console.log(
      "Insufficient balance"
    );

    return;

  }


  // estimate reward
  const reward =
    await curve.getSellReward(
      amount
    );

  console.log(
    "\nYou will receive:",
    hre.ethers.formatEther(reward),
    "WCO"
  );


  // approve
  console.log(
    "\nApproving token..."
  );

  const approveTx =
    await token.approve(
      launch.curve,
      amount
    );

  await approveTx.wait();


  // sell
  console.log(
    "Selling..."
  );

  const sellTx =
    await curve.sell(
      amount
    );

  const receipt =
    await sellTx.wait();


  console.log(
    "\nSELL SUCCESS"
  );

  console.log(
    "Tx:",
    receipt.hash
  );


  // new balances
  const newBalance =
    await token.balanceOf(
      user.address
    );

  const curveBalance =
    await hre.ethers.provider.getBalance(
      launch.curve
    );

  console.log(
    "\n=== UPDATED STATE ==="
  );

  console.log(
    "Your token balance:",
    newBalance.toString()
  );

  console.log(
    "Curve liquidity:",
    hre.ethers.formatEther(
      curveBalance
    ),
    "WCO"
  );

}


main().catch(console.error);
