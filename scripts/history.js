const fs = require("fs");

const trades =
  JSON.parse(
    fs.readFileSync(
      "./backend/storage/trades.json"
    )
  );

console.log("\n=== TRADE HISTORY ===\n");

for(const trade of trades)
{
  console.log(trade);
}
