import got from "got";
import fs from "fs";

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
  console.log("");
  const { path, ...rest } = query;
  const [keys, writer] = rewirePattern(path);
  const params = applyCollectionParam(keys, data);
  const paths = params.map(writer);
  return paths.map((p) => ({ path: p, ...rest }));
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

function pushAsset(path, stream) {
  fs.lstat(path, (err, status) => {
    if (!err && !status.isDirectory()) {
      console.log("PUSH ASSET", path);
      stream.pushStream({ ":path": path }, (err, pushStream) => {
        if (err) throw err;
        pushStream.respond({
          ":status": 200,
        });
        fs.createReadStream(`../client/build${path}`).pipe(pushStream);
        stream.write(`, "${path}"`);
      });
    } else {
      //TODO: complete it
    }
  });
}

function fetchAsset(assets, stream) {
  console.log("parsed assets", assets);
  assets.forEach(({ path }) => pushAsset(path, stream));
}

export default function fetchAll(batchRequest, stream) {
  // console.log("PUSH batchRequest", batchRequest);
  const requests = batchRequest.map((query) =>
    fetch(`http://localhost:4001${query.path}`)
      .then((result) => {
        pushData(query.path, result, stream);
        stream.write(`, "${query.path}"`);
        if (query.children) {
          const children = query.children
            .map((child) => rewrite(child, result))
            .flat();

          return fetchAll(children, stream);
        }
        console.log("ASSETS", query.assets, result);
        if (Array.isArray(query.assets) && query.assets.length) {
          const assets = query.assets
            .map((asset) => rewrite({ path: asset }, result))
            .flat();

          console.log("HMMMM", assets);
          return fetchAsset(assets, stream);
        }
      })
      .catch((error) => {
        stream.write(`, "${query.path}"`);
        pushData(query.path, error, stream, 500);
      })
  );

  return Promise.all(requests);
}
