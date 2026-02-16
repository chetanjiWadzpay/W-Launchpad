const { ethers } = require("ethers");

const config =
require("../config/config");

const provider =
new ethers.JsonRpcProvider(
  config.RPC_URL
);

const wallet =
new ethers.Wallet(
  config.PRIVATE_KEY,
  provider
);

async function getGas()
{
  const fee =
  await provider.getFeeData();

  return {

    gasLimit: 3000000,

    gasPrice:
      fee.gasPrice ||
      ethers.parseUnits(
        "20",
        "gwei"
      )

  };
}

module.exports =
{
  provider,
  wallet,
  getGas
};
