const express =
require("express");

const router =
express.Router();

const {
  buy,
  sell
} =
require("../services/tradeService");

router.post("/buy",
async(req,res)=>
{
  res.json(
  await buy(
    req.body.curve,
    req.body.amount
  ));
});

router.post("/sell",
async(req,res)=>
{
  res.json(
  await sell(
    req.body.curve,
    req.body.amount
  ));
});

module.exports =
router;
