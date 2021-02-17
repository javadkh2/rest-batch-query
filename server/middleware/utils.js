const { path } = require("ramda");

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

function getProps(id, obj, props) {
  return props.reduce(
    (acc, prop) => ({
      ...acc,
      [`(${id}).${prop}`]: path(prop.split("."), obj),
    }),
    {}
  );
}

const cache = (initial) => {
  let state = initial;
  const get = (key) => {
    return state[key];
  };
  const set = (update) => {
    state = { ...state, ...update };
    return state;
  };
  return { get, set };
};

module.exports.safeJsonParse = safeJsonParse;
module.exports.streamToString = streamToString;
module.exports.proxy = proxy;
module.exports.getProps = getProps;
module.exports.cache = cache;
