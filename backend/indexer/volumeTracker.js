const fs = require("fs");

const VOLUME_FILE =
  "./backend/storage/volume.json";

function updateVolume(token, amount)
{
  let volume = {};

  if(fs.existsSync(VOLUME_FILE))
    volume =
      JSON.parse(
        fs.readFileSync(VOLUME_FILE)
      );

  if(!volume[token])
    volume[token] = "0";

  volume[token] =
    (
      BigInt(volume[token]) +
      BigInt(amount)
    ).toString();

  fs.writeFileSync(
    VOLUME_FILE,
    JSON.stringify(volume, null, 2)
  );
}

module.exports =
  updateVolume;
