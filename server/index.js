const express = require("express");
const bodyParser = require("body-parser");
const query = require("./middleware/query.js");

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());

app.get("/version", (req, res) => {
  res.send("1.0.0");
});

app.use("/query", query({ port }));

app.listen(port, () => {
  console.log(`server listening at http://localhost:${port}`);
});
