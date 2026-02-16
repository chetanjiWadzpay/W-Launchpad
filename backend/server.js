const express = require("express");
const path = require("path");

const app = express();

/// ===============================
/// JSON parser
/// ===============================
app.use(express.json());


/// ===============================
/// JSON error handler
/// ===============================
app.use((err, req, res, next) =>
{
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err)
  {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON"
    });
  }

  next();
});


/// ===============================
/// Routes
/// ===============================

app.use(
  require(path.join(__dirname, "routes", "launchRoutes"))
);

app.use(
  require(path.join(__dirname, "routes", "tradeRoutes"))
);

app.use(
  require(path.join(__dirname, "routes", "statsRoutes"))
);

app.use(
  require(path.join(__dirname, "routes", "tokenRoutes"))
);


/// ===============================
/// Start server
/// ===============================
const PORT = 3000;

app.listen(PORT, () =>
{
  console.log(
    `Backend running on port ${PORT}`
  );
});
