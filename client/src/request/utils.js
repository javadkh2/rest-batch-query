export function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

export const getResolvablePromise = () => {
  let resolver;
  const promise = new Promise((resolve) => {
    resolver = resolve;
  });
  promise.resolve = resolver;
  return promise;
};

export function parseChunk(str, { pos = 0, part = "", chunks = [] }) {
  return str.split("").reduce(
    ({ pos, part, chunks }, char) => {
      if (part) {
        part += char;
      }

      if (char === "{") {
        pos += 1;
        if (!part) {
          part = char;
        }
      }
      if (char === "}") {
        pos -= 1;
        if (pos === 0) {
          chunks.push(safeJsonParse(part));
          part = "";
        }
      }
      return { pos, part, chunks };
    },
    { pos, part, chunks }
  );
}

export function stateFactory(initial = {}) {
  let state = initial;
  return [
    function read(key) {
      return state[key];
    },
    function update(parts) {
      const oldState = { ...state };
      state = { ...state, ...parts };
      Object.entries(parts).forEach(([key, value]) => {
        if (oldState[key] instanceof Promise && oldState[key].resolve) {
          oldState[key].resolve(value);
        }
      });
      return state;
    },
    function watch(key) {
      if (state[key]) return state[key];
      state[key] = getResolvablePromise();
      return state[key];
    },
  ];
}

export const inspect = (tag) => (data) => {
  console.log(tag, data);
  return data;
};
