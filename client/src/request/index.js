const sampleQuery = [
  {
    path: "/api/profile/2",
    children: [
      {
        path: "/api/blog/<blogId>",
        children: [
          { path: "/api/article/<articles>" },
        ],
      },
    ],
  },
];


const setState = (initial = {}) => {
  let state = initial;
  return [
    (key) => {
      return state[key];
    },
    (update) => {
      state = { ...state, ...update };
      return state;
    },
  ];
};

const [getResult, setResult] = setState({});
// const [getAssets, setAssets] = setState({});

// send batch query
export function fetchResults(queries) {
  const data = Array.isArray(queries) ? queries : [queries];
  return (
    fetch("/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      // TODO: complete this code to read chucks and use them immediately
      .then((response) => response.body.getReader())
      .then((reader) => {
        function next() {
          return reader.read().then(({ value, done }) => {
            console.log("chunk", new TextDecoder("utf-8").decode(value));
            // console.log(new TextDecoder("utf-8").decode(chunk));
            if (!done) {
              return next();
            }
          });
        }
        return next();
      })
      .then((response) => response.json())
      .then(({ method, timestamp, ...urls }) => {
        if (method === "push") {
          setPushedValues(urls);
          return { timestamp };
        }
        return { ...urls, timestamp };
      })
  );
}

function setPushedValues(urls) {
  const paths = Object.entries(urls).filter(([url, { asset }]) => !asset);
  paths.map(([path]) =>
    fetch(path)
      .then((r) => r.json())
      .then((body) => setResult({ [path]: { body } }))
  );

  // setAssets(
  //   Object.entries(urls)
  //     .filter(([url, { asset }]) => asset)
  //     .map(([url, result]) => ({ [url]: result }))
  // );
}

// run each request separately
function fetchResultsSeparately(queries) {
  return Promise.all(
    queries.map(({ path }) =>
      fetch(path)
        .then((r) => r.json())
        .then((body) => setResult({ [path]: { body } }))
    )
  );
}

const fetcher =
  localStorage.getItem("query") === "1" ? fetchResults : fetchResultsSeparately;

function fetchQuery(query) {
  return fetcher(query)
    .then(setResult)
    .catch((err) => {
      // TODO: update it based on server response
      const error =
        err instanceof Error ? err : new Error(err || "Unknown Error");

      // setResult({
      //   [query.path]: error,
      // });

      return Promise.reject(error);
    });
}

// TODO: how to handel same call from different components with different children?
// TODO: how to refetch in case of error?
// TODO: Race condition
export default function request(resources, refetch = false) {
  const queries = resources.filter(({ path }) => Boolean(path));

  // const assets = resources.filter(
  //   ({ path, asset }) => !Boolean(path) && Boolean(asset)
  // );

  // const newAssets = assets.filter(({ asset }) => !getAssets(asset));

  const newQueries = refetch
    ? queries
    : queries.filter(({ path }) => !getResult(path));

  if (newQueries.length === 0) {
    queries.forEach(({ path }) => {
      if (getResult(path) instanceof Error) {
        throw Error;
      }
    });

    const pendingRequests = queries
      .filter(({ path }) => getResult(path) instanceof Promise)
      .map(({ path }) => getResult(path));

    if (pendingRequests.length > 0) {
      throw Promise.all(pendingRequests);
    }

    return queries.map((query) => getResult(query.path).body);
  }

  const promise = fetchQuery([...newQueries /*, ...newAssets*/]);
  setResult(
    newQueries
      .map((query) => ({ [query.path]: promise }))
      .reduce((acc, item) => ({ ...acc, ...item }), {})
  );
  // setAssets(newAssets.map((query) => ({ [query.asset]: promise })));
  throw promise;
}
