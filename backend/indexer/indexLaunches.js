const hre = require("hardhat");
const fs = require("fs");

const FILE =
"./backend/storage/tokens.json";

async function indexLaunches(factoryAddress)
{
  const factory =
  await hre.ethers.getContractAt(
    "WLaunchpadFactory",
    factoryAddress
  );

  const events =
  await factory.queryFilter(
    factory.filters.LaunchCreated()
  );

  let tokens = [];

  if(fs.existsSync(FILE))
    tokens =
      JSON.parse(
        fs.readFileSync(FILE)
      );

  for(const e of events)
  {
    const exists =
      tokens.find(
        t => t.token === e.args.token
      );

    if(!exists)
    {
      tokens.push({
        token: e.args.token,
        curve: e.args.curve,
        creator: e.args.creator
      });
    }
  }

  fs.writeFileSync(
    FILE,
    JSON.stringify(tokens, null, 2)
  );
}

module.exports =
indexLaunches;
