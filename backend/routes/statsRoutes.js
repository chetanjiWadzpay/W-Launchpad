const express =
require("express");

const router =
express.Router();

const {
  getStats
} =
require("../services/statsService");

router.get(
  "/stats",
  (req,res)=>
{
  res.json(
    getStats()
  );
});

module.exports =
router;
