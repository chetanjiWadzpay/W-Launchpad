const fs = require("fs");

const FILE =
  "./deployments/wchain.json";

module.exports =
function saveDeployments(data)
{
  fs.writeFileSync(
    FILE,
    JSON.stringify(data, null, 2)
  );
};
