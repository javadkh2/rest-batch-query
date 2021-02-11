const express = require("express");
const services = require("./router");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const query = require("../server/middleware/query");

const app = express();
const port = process.env.PORT || 4001;

app.use(morgan("combined"));

app.use(bodyParser.json());

app.get("/version", (req, res) => {
  res.json({ v: "1.0.0" });
});

// use the query middleware to gather all request in one place
app.post("/query", query({ port }));

// use service router
app.use("/api", services);

app.use("/assets/", express.static(`${__dirname}/assets`));
app.use("/app/", express.static(`${__dirname}/../client/build`));

app.listen(port, () => {
  console.log(`server listening at http://localhost:${port}`);
});
