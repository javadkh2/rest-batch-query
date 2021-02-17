// TODO: use http2 server push for pushing all resources to the client
// we can even send static resources like images related to the request.
// TODO: check the standard way to request push resources

// for now let's only update the embed version to PR. no need to think about best practice or standard way.

const http2 = require("http2");
const { request } = require("http");
const fs = require("fs");
const { streamToString, proxy } = require("../server/middleware/utils");
const fetchAll = require("./lib/fetchAll");
require("../services");

const server = http2.createSecureServer({
  key: fs.readFileSync("localhost-privkey.pem"),
  cert: fs.readFileSync("localhost-cert.pem"),
});
server.on("error", console.error);

server.on("stream", (stream, headers) => {
  stream.on("error", (e) => console.log("STREAM ERROR", e));
  if (headers[":path"] === "/query") {
    stream.respond({
      "content-type": "application/json; charset=utf-8",
      ":status": 200,
    });
    stream.write(`{ "method": "push", "timestamp": ${Date.now()}`);
    return streamToString(stream)
      .then(JSON.parse)
      .then((query) => fetchAll(query, stream, headers))
      .then(() => stream.end("}"))
      .catch((err) => {
        console.log("Error!:", err);
        stream.respond({
          "content-type": "text/html; charset=utf-8",
          ":status": 500,
        });
        stream.end(`,"error": "${err}"}`);
      });
  } else {
    // TODO: send headers too
    request(
      `http://localhost:4001${headers[":path"]}`,
      proxy(stream)
    ).end();
  }
});

server.listen(8443, () =>
  console.log(`server listening at https://localhost:8443`)
);
