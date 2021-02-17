const { safeJsonParse, streamToString } = require("./utils");

function fetch({ protocol = "http", port = 3000, host = "localhost" }) {
  if (!["http", "https"].includes(protocol)) {
    throw new Error("fetch only supports http and https");
  }
  const { request } = protocol === "http" ? require("http") : require("https");
  return function fetchPath(path, options, bodyParser = safeJsonParse) {
    return new Promise((resolve, reject) => {
      const url = `${protocol}://${host}:${port}${path}`;
      request(url, options, function fetchResponse(res) {
        const { headers, statusCode } = res;
        streamToString(res)
          .then((body) =>
            resolve({
              headers,
              statusCode,
              body: bodyParser(body),
            })
          )
          .catch((error) => reject({ error, headers }));
      }).end();
    });
  };
}

module.exports = fetch;
