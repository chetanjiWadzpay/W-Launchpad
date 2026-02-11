require("dotenv").config();

const hre = require("hardhat");

const fs =
  require("fs");

const loadDeployments =
  require("../utils/loadDeployments");

async function verify(address, args = []) {

  try {

    await hre.run(
      "verify:verify",
      {
        address: address,
        constructorArguments: args
      }
    );

    console.log("Verified:", address);

  }

  catch (e) {

    if (e.message.includes("Already Verified")) {

      console.log("Already verified:", address);

    }

    else {

      console.log("Verification failed:", address);
      console.log(e.message);

    }

  }

}

async function main() {

  const db =
    loadDeployments();

  console.log("\nVerifying contracts...\n");

  await verify(
    db.feeManager,
    [db.creator]
  );

  await verify(
    db.factory,
    [db.feeManager]
  );

  await verify(
    db.token,
    [
      db.name || "Token",
      db.symbol || "TKN",
      db.creator,
      db.factory
    ]
  );

  await verify(
    db.curve,
    [
      db.token,
      db.creator,
      db.feeManager
    ]
  );

  console.log("\nVerification complete");

}

main().catch(console.error);
