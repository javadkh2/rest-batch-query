import express from "express";
import fetchAll from "./fetch.js";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());

app.get("/version", (req, res) => {
  res.send("1.0.0");
});

// TODO: how we can use HTTP2 here. because it seems server push is a great option for our use case.
app.post("/query", (req, res, next) => {
  const batchRequest = req.body || [];
  res.header("Content-Type", "application/json");
  res.header("Access-Control-Allow-Origin", "*");
  res.write(`{ "timestamp": ${Date.now()}`);

  Promise.resolve()
    .then(() => fetchAll(batchRequest, res))
    .then(() => {
      res.write("}");
      res.end();
    })
    .catch((error) => res.send({ isError: true, error }));

});

app.listen(port, () => {
  console.log(`server listening at http://localhost:${port}`);
});
