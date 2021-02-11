function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

const proxy = (stream, customHeaders = {}) => (res) => {
  delete res.headers["connection"];
  stream.respond({
    ...res.headers,
    ...customHeaders,
    ":status": res.statusCode,
  });
  res.pipe(stream).on("error", (e) => console.log("HMMMM", e));
};

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

module.exports.safeJsonParse = safeJsonParse;
module.exports.streamToString = streamToString;
module.exports.proxy = proxy;
