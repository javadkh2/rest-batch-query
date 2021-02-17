function applyParam(params, key, value) {
  return params.map((acc) => ({ ...acc, [key]: value }));
}

function applyListParam(params, key, value) {
  const list = Array.isArray(value) ? value : [value];
  return list.map((item) => applyParam(params, key, item)).flat();
}

function applyCollectionParam(keys, getData) {
  return keys.reduce(
    (acc, key) => {
      const data = getData(key);
      // ignore empty values
      return data != null && !Number.isNaN(data)
        ? applyListParam(acc, key, data)
        : acc;
    },
    [{}]
  );
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

function pathResolver(query, getData) {
  const { path, asset, ...rest } = query;
  const [keys, writer] = rewirePattern(path || asset);
  const params = applyCollectionParam(keys, getData);
  const paths = params.map(writer);
  return paths.map((p) => ({ [path ? "path" : "asset"]: p, ...rest }));
}

module.exports = pathResolver;
