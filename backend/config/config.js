require("dotenv").config();

module.exports =
{
  RPC_URL:
    "https://rpc.w-chain.com",

  PRIVATE_KEY:
    process.env.PRIVATE_KEY,

  FACTORY:
    require("../../deployments/wchain.json").factory,

  STORAGE:
  {
    TOKENS:
      "./backend/storage/tokens.json",

    TRADES:
      "./backend/storage/trades.json",

    VOLUME:
      "./backend/storage/volume.json",

    BLOCKS:
      "./backend/storage/lastIndexedBlock.json"
  }
};
