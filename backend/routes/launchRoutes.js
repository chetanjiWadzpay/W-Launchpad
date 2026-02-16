const express =
require("express");

const router =
express.Router();

const {
  createToken
} =
require("../services/launchService");

router.post(
  "/launch",
  async (req,res)=>
{
  try{

    const result =
    await createToken(
      req.body
    );

    res.json(result);

  }
  catch(e){

    res.status(500)
    .json({
      success:false,
      error:e.message
    });

  }
});

module.exports =
router;
