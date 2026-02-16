require("dotenv").config();

const axios = require("axios");
const fs = require("fs");

const LOCAL_FILE =
  "./backend/storage/localMetadata.json";

async function uploadMetadata(metadata)
{
  try
  {
    console.log(
      "Uploading metadata to Pinata IPFS..."
    );

    const body =
    {
      pinataContent: metadata,

      pinataMetadata:
      {
        name:
          metadata.name ||
          "token-metadata-" +
          Date.now()
      }
    };

    const res =
      await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        body,
        {
          headers:
          {
            Authorization:
              `Bearer ${process.env.PINATA_JWT}`,
            "Content-Type":
              "application/json"
          },
          timeout: 60000
        }
      );

    const hash =
      res.data.IpfsHash;

    console.log(
      "IPFS upload success:",
      hash
    );

    return `ipfs://${hash}`;
  }
  catch(err)
  {
    console.log(
      "Pinata failed, saving locally..."
    );

    console.log(
      "Error:",
      err.response?.data ||
      err.message
    );

    let data = [];

    if(fs.existsSync(LOCAL_FILE))
    {
      data =
        JSON.parse(
          fs.readFileSync(
            LOCAL_FILE
          )
        );
    }

    const localHash =
      "LOCAL_" +
      Date.now();

    data.push({
      hash:
        localHash,

      metadata,

      createdAt:
        new Date()
        .toISOString()
    });

    fs.writeFileSync(
      LOCAL_FILE,
      JSON.stringify(
        data,
        null,
        2
      )
    );

    console.log(
      "Saved locally:",
      localHash
    );

    return `local://${localHash}`;
  }
}

module.exports =
  uploadMetadata;
