// send batch query
export function fetchResults(queries) {
  const data = Array.isArray(queries) ? queries : [queries];
  return fetch("/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((response) => response.json());
}

// run each request separately
function fetchResultsSeparately(path) {
  return fetch(path)
    .then((r) => r.json())
    .then((result) => setResult({ [path]: { result } }));
}

let result = {};

const setResult = (update) => {
  result = { ...result, ...update };
  console.log("RESULT", result);
  return result;
};

export default function requestV2(path, refetch = false) {
  result[path] = !result[path] ? fetchResultsSeparately(path) : result[path];

  const res = result[path];

  if (res instanceof Promise || res instanceof Error) {
    throw res;
  }

  return res.result;
}

