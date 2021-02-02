// TODO: use http2 server push for pushing all resources to the client
// we can even send static resources like images related to the request.
// TODO: check the standard way to request push resources

// for now let's only update the embed version to PR. no need to think about best practice or standard way.

import http2 from "http2";
import fs from "fs";
import { streamToString } from "./lib/util.js";
import fetchAll from "./lib/fetch.js";

const server = http2.createSecureServer({
  key: fs.readFileSync("localhost-privkey.pem"),
  cert: fs.readFileSync("localhost-cert.pem"),
});
server.on("error", console.error);

server.on("stream", (stream, headers) => {
  if (headers[":path"] === "/query") {
    console.log("RUN query");
    stream.respond({
      "content-type": "application/json; charset=utf-8",
      ":status": 200,
    });
    stream.write(`[{ "date": ${Date.now()} }`)
    return streamToString(stream)
      .then(JSON.parse)
      .then((query) => fetchAll(query, stream, headers))
      .then(() => console.log("all done!"))
      .then(() => stream.end(']'))
      .catch((err) => {
        console.log("Error!:", err);
        stream.respond({
          "content-type": "text/html; charset=utf-8",
          ":status": 500,
        });
        stream.end(
          `<h1>Internal Server Error</h1><p>${err}</p>
           `
        );
      });
  }

  const file = `../client/build${headers[":path"]}`;

  fs.lstat(file, (err, status) => {
    if (err || status.isDirectory()) {
      stream.respond({
        ":status": 404,
      });
      return stream.end("file not found");
    }
    stream.respond({
      ":status": 200,
    });
    fs.createReadStream(`../client/build${headers[":path"]}`).pipe(stream);
  });
});

server.listen(8443);
