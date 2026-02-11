require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");

require("dotenv").config({
  path: "./.env",
  override: true
});

module.exports = {

  solidity: "0.8.26",

  defaultNetwork: "wchain",

  networks: {

    wchain: {

      url: "https://rpc.w-chain.com",

      chainId: 171717,

      accounts: [`0x${process.env.PRIVATE_KEY}`],

      gas: 10000000,

      gasPrice: 1800000000000

    }

  },

  etherscan: {

    apiKey: {

      wchain: "dummy"

    },

    customChains: [

      {
        network: "wchain",
        chainId: 171717,

        urls: {

          apiURL:
            "https://scan.w-chain.com/api",

          browserURL:
            "https://scan.w-chain.com"

        }

      }

    ]

  }

};
