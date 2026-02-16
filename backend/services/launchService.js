const fs = require("fs");

const { ethers } =
require("ethers");

const config =
require("../config/config");

const {
  wallet,
  getGas
} =
require("./provider");

const uploadMetadata =
require("../ipfs/uploadMetadata");

const ABI =
[
  "function createLaunch(string,string)",
  "event LaunchCreated(address token,address curve,address creator)"
];

async function createToken(data)
{
  const factory =
  new ethers.Contract(
    config.FACTORY,
    ABI,
    wallet
  );

  const metadataURI =
  await uploadMetadata(data);

  const gas =
  await getGas();

  const tx =
  await factory.createLaunch(
    data.name,
    data.symbol,
    gas
  );

  const receipt =
  await tx.wait();

  let token, curve, creator;

  for(const log of receipt.logs)
  {
    try
    {
      const parsed =
      factory.interface.parseLog(log);

      token =
        parsed.args.token;

      curve =
        parsed.args.curve;

      creator =
        parsed.args.creator;
    }
    catch{}
  }

  let tokens = [];

  if(fs.existsSync(config.STORAGE.TOKENS))
    tokens =
      JSON.parse(
        fs.readFileSync(
          config.STORAGE.TOKENS
        )
      );

  tokens.push({

    token,
    curve,
    creator,

    name:
      data.name,

    symbol:
      data.symbol,

    metadataURI,

    createdAt:
      new Date()
      .toISOString()

  });

  fs.writeFileSync(
    config.STORAGE.TOKENS,
    JSON.stringify(
      tokens,
      null,
      2
    )
  );

  return {

    success: true,

    token,
    curve

  };
}

module.exports =
{
  createToken
};
