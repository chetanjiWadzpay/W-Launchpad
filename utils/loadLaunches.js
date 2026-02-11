const fs = require("fs");

const FILE =
  "./deployments/launches.json";

module.exports = function loadLaunches() {

  if(!fs.existsSync(FILE))
    return [];

  return JSON.parse(
    fs.readFileSync(FILE)
  );

};
