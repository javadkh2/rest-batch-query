import got from "got";

function fetch(url) {
  console.log("fetch: ", url);
  return got(url).json();
}

function applyParam(params, key, value) {
  return params.map((acc) => ({ ...acc, [key]: value }));
}

function applyListParam(params, key, value) {
  const list = Array.isArray(value) ? value : [value];
  return list.map((item) => applyParam(params, key, item)).flat();
}

function applyCollectionParam(keys, collection) {
  return keys.reduce((acc, key) => applyListParam(acc, key, collection[key]), [
    {},
  ]);
}

const rewirePattern = (path) => {
  const parts = path.split(/(<[^>]*>)/g);
  const keys = parts.reduce((acc, part, idx) => {
    if (part.startsWith("<")) {
      const key = part.replace(/[<>]/g, "");
      return { ...acc, [key]: idx };
    }
    return acc;
  }, {});
  const replace = (key, value, parts) => {
    const idx = keys[key];
    if (idx === undefined) {
      return parts;
    }
    const replaced = [...parts];
    replaced[idx] = value;
    return replaced;
  };
  return [
    Object.keys(keys),
    (params) =>
      Object.entries(params)
        .reduce((acc, [key, value]) => replace(key, value, acc), parts)
        .join(""),
  ];
};

function rewrite(query, data) {
  const { path, asset, ...rest } = query;
  const [keys, writer] = rewirePattern(path || asset);
  const params = applyCollectionParam(keys, data);
  const paths = params.map(writer);
  return paths.map((p) => ({ [path ? "path" : "asset"]: p, ...rest }));
}

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

export function pushAsset(asset, stream) {
  const path = `../client/build${asset}`;
  console.log("asset:", path);
  stream.pushStream({ ":path": asset }, (err, pushStream) => {
    if (err) throw err;
    pushStream.respondWithFile(path);
  });
}

export default function fetchAll(batchRequest, stream) {
  const requests = batchRequest.map((query) => {
    if (query.path) {
      return fetch(`http://localhost:4001${query.path}`)
        .then((result) => {
          pushData(query.path, result, stream);
          stream.write(`, "${query.path}"`);
          if (query.children) {
            const children = query.children
              .map((child) => rewrite(child, result))
              .flat();

            return fetchAll(children, stream);
          }
        })
        .catch((error) => {
          stream.write(`, "${query.path}"`);
          pushData(query.path, error, stream, 500);
        });
    } else if (query.asset) {
      pushAsset(query.asset, stream);
      stream.write(`, "${query.asset}"`);
      return Promise.resolve(query.asset);
    }
  });
  return Promise.all(requests);
}
