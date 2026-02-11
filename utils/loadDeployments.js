const fs = require("fs");

const FILE =
  "./deployments/wchain.json";

module.exports = function loadDeployments() {

  if(!fs.existsSync(FILE))
    throw new Error(
      "Deployments file missing"
    );

  return JSON.parse(
    fs.readFileSync(FILE)
  );

};
