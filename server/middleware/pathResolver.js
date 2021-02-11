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

function pathResolver(query, data) {
  const { path, asset, ...rest } = query;
  const [keys, writer] = rewirePattern(path || asset);
  const params = applyCollectionParam(keys, data);
  const paths = params.map(writer);
  return paths.map((p) => ({ [path ? "path" : "asset"]: p, ...rest }));
}

module.exports = pathResolver;
