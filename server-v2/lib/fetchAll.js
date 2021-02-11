const { request } = require("http");
const pathResolver = require("../../server/middleware/pathResolver");
const { proxy } = require("../../server/middleware/utils");
const fetch = require("../../server/middleware/fetch")({ port: 4001 });

function pushData(path, data, stream, status = 200) {
  stream.pushStream({ ":path": path }, (err, pushStream) => {
    if (err) throw err;
    pushStream.respond({
      ":status": status,
      "content-type": "application/json; charset=utf-8",
    });
    pushStream.end(JSON.stringify(data));
  });
}

function pushStream(path, stream) {
  return new Promise((resolve, reject) => {
    stream.pushStream({ ":path": path }, (err, pushStream) => {
      pushStream.on("error", (e) => {
        console.log("check the reason", e);
      });
      request(
        `http://localhost:4001${path}`,
        {
          headers: {
            "user-agent": "ASSET-REQUEST",
          },
        },
        proxy(pushStream, { "cache-control": "public, max-age=1000000" })
      )
        .end()
        .on("finish", resolve)
        .on("error", reject);
    });
  });
}

function fetchAll(batchRequest, stream) {
  const requests = batchRequest.map((query) => {
    if (query.path) {
      return fetch(query.path)
        .then(({ body }) => {
          pushData(query.path, body, stream);
          stream.write(`, "${query.path}": { "timestamp": ${Date.now()} }`);
          if (query.children) {
            const children = query.children
              .map((child) => pathResolver(child, body))
              .flat();
            return fetchAll(children, stream);
          }
        })
        .catch((error) => {
          stream.write(
            `, "${query.path}": { "timestamp": ${Date.now()}, "error": true }`
          );
          pushData(query.path, error, stream, 500);
        });
    } else if (query.asset) {
      return pushStream(query.asset, stream).then(() => {
        stream.write(
          `, "${query.asset}" : { "timestamp": ${Date.now()}, "asset": true }`
        );
      });
    }
  });
  return Promise.all(requests);
}

module.exports = fetchAll;
