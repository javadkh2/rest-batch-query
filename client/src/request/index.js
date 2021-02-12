import { inspect, parseChunk, stateFactory } from "./utils";

const [readState, setState, watch] = stateFactory({});

// send batch query
export function fetchResults(queries) {
  const data = Array.isArray(queries) ? queries : [queries];
  return fetch("/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.body.getReader())
    .then((reader) => {
      function next(memory = {}) {
        return reader.read().then(({ value, done }) => {
          const chunk = new TextDecoder("utf-8").decode(value);
          const { chunks: responses, ...unprocessedPart } = parseChunk(
            chunk,
            memory
          );

          if (responses.length) {
            const results = responses
              .map(({ path, ...result }) => ({ [path]: result }))
              .reduce((acc, item) => ({ ...acc, ...item }), {});

            // set children path to the state to inform related components the path is already requested
            // TODO: instead of getting children from server we can generate them in client
            Object.values(results)
              .map(({ children }) => children)
              .filter(Array.isArray)
              .flat()
              .map(inspect("child path:"))
              .map(watch);

            setState(results);
          }

          if (!done) {
            return next(unprocessedPart);
          }

          return { result: "done" };
        });
      }
      return next();
    });
}

// run each request separately
function fetchResultsSeparately(queries) {
  return Promise.all(
    queries.map(({ path }) =>
      fetch(path)
        .then((r) => r.json())
        .then((body) => setState({ [path]: { body } }))
    )
  );
}

// TODO: how to refetch in case of error?
// TODO: Cache strategy : How long we should keep the response
export default function request(resources) {
  const queries = resources.filter(({ path }) => Boolean(path));

  const newQueries = queries.filter(({ path }) => !readState(path));
  const pendingQueries = queries.filter(
    ({ path }) => readState(path) instanceof Promise
  );

  if (newQueries.length === 0) {
    queries.forEach(({ path }) => {
      if (readState(path) instanceof Error) {
        throw Error;
      }
    });

    const pendingRequests = pendingQueries.map(({ path }) => readState(path));

    if (pendingRequests.length > 0) {
      // send signal to react suspense
      throw Promise.all(pendingRequests);
    }

    return queries.map((query) => readState(query.path).body);
  }

  const fetchQuery = window.useQuery ? fetchResults : fetchResultsSeparately;

  fetchQuery(newQueries);
  // send signal to react suspense
  throw Promise.all([
    ...newQueries.map(({ path }) => watch(path)),
    ...pendingQueries,
  ]);
}
