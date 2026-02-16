const fs =
require("fs");

const config =
require("../config/config");

function getStats()
{
  const tokens =
  JSON.parse(
    fs.readFileSync(
      config.STORAGE.TOKENS
    )
  );

  const trades =
  JSON.parse(
    fs.readFileSync(
      config.STORAGE.TRADES
    )
  );

  const volume =
  JSON.parse(
    fs.readFileSync(
      config.STORAGE.VOLUME
    )
  );

  return {

    totalTokens:
      tokens.length,

    totalTrades:
      trades.length,

    volume

  };
}

module.exports =
{
  getStats
};
