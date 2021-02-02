import express from "express";
import services from "./router.js";
import bodyParser from "body-parser";
import morgan from "morgan";

const app = express();
const port = process.env.PORT || 4001;

app.use(morgan("combined"));

app.use(bodyParser.json());

app.get("/version", (req, res) => {
  res.json({ v: "1.0.0" });
  res.end();
});

// use service router
app.use(services);

app.listen(port, () => {
  console.log(`server listening at http://localhost:${port}`);
});
