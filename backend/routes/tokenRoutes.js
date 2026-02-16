const express = require("express");

const router = express.Router();

const fs = require("fs");

const FILE =
"./backend/storage/tokens.json";

/// GET ALL TOKENS
router.get("/tokens", (req, res) =>
{
  try
  {
    if(!fs.existsSync(FILE))
    {
      return res.json({
        success: true,
        tokens: []
      });
    }

    const tokens =
      JSON.parse(
        fs.readFileSync(FILE)
      );

    res.json({
      success: true,
      tokens
    });
  }
  catch(err)
  {
    res.status(500).json({
      success:false,
      error:err.message
    });
  }
});

module.exports = router;
