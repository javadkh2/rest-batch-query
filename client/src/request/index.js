// send batch query
export function fetchResults(data) {
  return fetch("/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((response) => response.json());
}

// run each request separately
function fetchResultsSeparately(data) {
  return Promise.all(
    data.map(({ path }) =>
      fetch(path)
        .then((r) => r.json())
        .then((result) => setResult({ [path]: { result } }))
    )
  ).then(() => ({}));
}

let result = {};

const setResult = (update) => {
  result = { ...result, ...update };
  console.log("RESULT", result);
  return result;
};

function fetchQuery(query) {
  return fetchResults(query)
    .then(setResult)
    .catch((err) => {
      // TODO: update it based on server response
      const error =
        err instanceof Error ? err : new Error(err || "Unknown Error");

      setResult({
        [query.path]: error,
      });

      return Promise.reject(error);
    });
}

// TODO: how to handel same call from different components with different children?
// TODO: how to refetch in case of error?
// TODO: Race condition
// export function requestOne(query, refetch = false) {
//   result[query.path] =
//     !result[query.path] || refetch ? fetchQuery(query) : result[query.path];

//   const res = result[query.path];

//   if (res instanceof Promise || res instanceof Error) {
//     throw res;
//   }

//   return res.result;
// }

export function requestOne(query, refetch = false) {
  result[query.path] = !result[query.path]
    ? fetchResultsSeparately([query])
    : result[query.path];

  const res = result[query.path];

  if (res instanceof Promise || res instanceof Error) {
    throw res;
  }

  return res.result;
}

export default function request(queries, refetch = false) {
  return queries.map((q) => requestOne(q));
}


// export default function request(queries, refetch = false) {
//   const newQueries = refetch
//     ? queries
//     : queries.filter(({ path }) => !result[path]);

//   if (newQueries.length === 0) {
//     queries.forEach(({ path }) => {
//       if (result[path] instanceof Error) {
//         throw Error;
//       }
//     });

//     const pendingRequests = queries
//       .filter(({ path }) => result[path] instanceof Promise)
//       .map(({ path }) => result[path]);

//     if (pendingRequests.length > 0) {
//       throw Promise.all(pendingRequests);
//     }

//     return queries.map((query) => result[query.path].result);
//   }
//   const promise = fetchQuery(newQueries);
//   newQueries.forEach((query) => {
//     result[query.path] = promise;
//   });

//   throw promise;
// }
