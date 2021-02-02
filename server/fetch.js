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
  const parts = path.split(/(:[^/:?&]*)/g);
  const keys = parts.reduce((acc, part, idx) => {
    if (part.startsWith(":")) {
      const key = part.substring(1);
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
  const { path, ...rest } = query;
  const [keys, writer] = rewirePattern(path);
  const params = applyCollectionParam(keys, data);
  const paths = params.map(writer);
  return paths.map((p) => ({ path: p, ...rest }));
}

export default function fetchAll(batchRequest, stream) {
  console.log("batchRequest",batchRequest);
  const requests = batchRequest.map((query) =>
    fetch(`http://localhost:4001${query.path}`)
      .then((result) => {
        stream.write(
          `,"${[query.path]}": ${JSON.stringify({
            result,
            timestamp: Date.now(),
          })}`
        );

        if (query.children) {
          const children = query.children
            .map((child) => rewrite(child, result))
            .flat();

          return fetchAll(children, stream);
        }
      })
      .catch((error) => {
        stream.write(
          `,"${[query.path]}": ${JSON.stringify({
            error,
            timestamp: Date.now(),
            isError: true,
          })}`
        );
      })
  );

  return Promise.all(requests);
}
