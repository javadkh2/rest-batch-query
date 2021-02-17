export function getChild(children) {
  if (children.isFetch) {
    return [children.get()];
  } else if (Array.isArray(children)) {
    return children.map(getChild).flat();
  } else {
    return [children];
  }
}
const idFactory = (start = 0) => {
  let id = start;
  return function nextId() {
    id += 1;
    return id;
  };
};

const getId = idFactory(0);

export const prop = (id) => (path) => `<(${id}).${path}>`;

function getDependencies(path) {
  return [...path.matchAll(/<\((\d+)\)[^>]*>/g)].map(([all, match]) => +match);
}

export function fetch(path, option) {
  const id = getId();
  const usedProps = [];
  const dependencies = getDependencies(path);
  const query = {
    path,
    id,
    usedProps,
    dependencies,
  };
  if (option) {
    query.option = option;
  }
  const getProp = (name) => {
    if (!usedProps.includes(name)) {
      usedProps.push(name);
    }
    return prop(id)(name);
  };
  return {
    isFetch: true,
    then(cb) {
      query.children = getChild(cb(getProp));
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

export function query(cb) {
  return (...args) => {
    return getChild(cb(...args));
  };
}
