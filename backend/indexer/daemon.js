const fs =
require("fs");

const indexTrades =
require("./indexTrades");

const TOKENS_FILE =
"./backend/storage/tokens.json";

async function loop()
{
  try
  {
    if(!fs.existsSync(TOKENS_FILE))
      return;

    const tokens =
      JSON.parse(
        fs.readFileSync(
          TOKENS_FILE
        )
      );

    for(const t of tokens)
    {
      await indexTrades(
        t.curve
      );
    }
  }
  catch(err)
  {
    console.log(
      "Daemon error:",
      err.message
    );
  }
}

setInterval(
  loop,
  5000
);

console.log(
  "Indexer running"
);
