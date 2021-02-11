export function getChild(children) {
  if (children.isFetch) {
    return [children.get()];
  } else if (Array.isArray(children)) {
    return children.map(getChild).flat();
  } else {
    return [children];
  }
}

export function fetch(path, option) {
  const query = { path };
  if (option) {
    query.option = option;
  }
  return {
    isFetch: true,
    // TODO: should it support multiple then?
    then(cb) {
      query.children = getChild(cb(prop));
      return query;
    },
    get() {
      return query;
    },
  };
}

export function asset(asset) {
  return { asset };
}

export const prop = (path) => `<${path}>`;

export function query(cb) {
  const id = Symbol("uniq query id");
  return (...args) => {
    const result = getChild(cb(...args));
    result.queryId = id;
    return result;
  };
}
