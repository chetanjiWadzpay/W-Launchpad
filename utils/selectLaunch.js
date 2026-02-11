const readline = require("readline");
const loadLaunches = require("./loadLaunches");

module.exports = async function selectLaunch() {

  const launches = loadLaunches();

  if (launches.length === 0)
    throw new Error("No launches found");

  console.log("\nAvailable launches:\n");

  launches.forEach((l, i) => {

    console.log(
      `${i + 1}. ${l.name} (${l.symbol})`
    );

    console.log(
      `   Token: ${l.token}`
    );

  });

  const rl =
    readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

  const index =
    await new Promise(resolve =>
      rl.question(
        "\nSelect launch number: ",
        answer => {
          rl.close();
          resolve(Number(answer) - 1);
        }
      )
    );

  return launches[index];

};
