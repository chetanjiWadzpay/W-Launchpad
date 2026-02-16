const { ethers } =
require("ethers");

const {
  wallet,
  getGas
} =
require("./provider");

const ABI =
[
  "function buy(uint amount) payable",
  "function sell(uint amount)",
  "function getBuyCost(uint) view returns(uint)",
  "function getSellReward(uint) view returns(uint)"
];

async function buy(curveAddress, amount)
{
  const curve =
  new ethers.Contract(
    curveAddress,
    ABI,
    wallet
  );

  const cost =
  await curve.getBuyCost(amount);

  const gas =
  await getGas();

  const tx =
  await curve.buy(
    amount,
    {
      value: cost,
      ...gas
    }
  );

  await tx.wait();

  return {
    success: true,
    tx: tx.hash
  };
}

async function sell(curveAddress, amount)
{
  const curve =
  new ethers.Contract(
    curveAddress,
    ABI,
    wallet
  );

  const gas =
  await getGas();

  const tx =
  await curve.sell(
    amount,
    gas
  );

  await tx.wait();

  return {
    success: true,
    tx: tx.hash
  };
}

module.exports =
{
  buy,
  sell
};
