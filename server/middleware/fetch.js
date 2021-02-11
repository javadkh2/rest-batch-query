const { safeJsonParse, streamToString } = require("./utils");

function fetch({ protocol = "http", port = 3000, host = "localhost" }) {
  if (!["http", "https"].includes(protocol)) {
    throw new Error("fetch only supports http and https");
  }
  const { request } = protocol === "http" ? require("http") : require("https");
  return function fetchPath(path, bodyParser = safeJsonParse) {
    return new Promise((resolve, reject) => {
      const url = `${protocol}://${host}:${port}${path}`;
      request(url, function fetchResponse(res) {
        const { headers } = res;
        streamToString(res)
          .then((body) =>
            resolve({
              headers,
              body: bodyParser(body),
            })
          )
          .catch((error) => reject({ error, headers }));
      }).end();
    });
  };
}

module.exports = fetch;
