require("dotenv").config();

const hre = require("hardhat");
const fs = require("fs");

const FILE =
  "./backend/storage/trades.json";

const BLOCK_FILE =
  "./backend/storage/lastIndexedBlock.json";

const CHUNK_SIZE = 200;

async function indexTrades(curveAddress)
{
  try
  {
    const provider =
      hre.ethers.provider;

    const curve =
      await hre.ethers.getContractAt(
        "BondingCurve",
        curveAddress
      );

    const latestBlock =
      await provider.getBlockNumber();

    let lastIndexed = latestBlock;

    if(fs.existsSync(BLOCK_FILE))
    {
      const data =
        JSON.parse(
          fs.readFileSync(BLOCK_FILE)
        );

      if(data[curveAddress])
        lastIndexed =
          data[curveAddress];
    }

    let fromBlock =
      lastIndexed;

    let toBlock =
      Math.min(
        fromBlock + CHUNK_SIZE,
        latestBlock
      );

    /// CRITICAL FIX
    if(fromBlock > toBlock)
    {
      return;
    }

    console.log(
      "\nIndexing curve:",
      curveAddress
    );

    console.log(
      "From block:",
      fromBlock,
      "to",
      toBlock
    );

    let trades = [];

    if(fs.existsSync(FILE))
    {
      trades =
        JSON.parse(
          fs.readFileSync(FILE)
        );
    }

    let count = 0;

    /// BUY EVENTS

    const buys =
      await curve.queryFilter(
        curve.filters.Buy(),
        fromBlock,
        toBlock
      );

    for(const e of buys)
    {
      trades.push({
        type: "BUY",
        token: curveAddress,
        user: e.args.buyer,
        amount:
          e.args.amount.toString(),
        value:
          e.args.cost.toString(),
        tx:
          e.transactionHash,
        block:
          e.blockNumber,
        time:
          Date.now()
      });

      count++;
    }

    /// SELL EVENTS

    const sells =
      await curve.queryFilter(
        curve.filters.Sell(),
        fromBlock,
        toBlock
      );

    for(const e of sells)
    {
      trades.push({
        type: "SELL",
        token: curveAddress,
        user: e.args.seller,
        amount:
          e.args.amount.toString(),
        value:
          e.args.reward.toString(),
        tx:
          e.transactionHash,
        block:
          e.blockNumber,
        time:
          Date.now()
      });

      count++;
    }

    fs.writeFileSync(
      FILE,
      JSON.stringify(
        trades,
        null,
        2
      )
    );

    /// SAVE LAST BLOCK

    let blockData = {};

    if(fs.existsSync(BLOCK_FILE))
    {
      blockData =
        JSON.parse(
          fs.readFileSync(
            BLOCK_FILE
          )
        );
    }

    blockData[curveAddress] =
      toBlock + 1;

    fs.writeFileSync(
      BLOCK_FILE,
      JSON.stringify(
        blockData,
        null,
        2
      )
    );

    console.log(
      "Trades indexed:",
      count
    );
  }
  catch(err)
  {
    console.log(
      "Indexer error:",
      err.message
    );
  }
}

module.exports =
  indexTrades;
