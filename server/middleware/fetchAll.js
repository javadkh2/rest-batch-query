const pathResolver = require("./pathResolver");

const getFetchAll = (get) =>
  function fetchAll(batchRequest, stream) {
    console.log("batchRequest", batchRequest);
    const requests = batchRequest
      // we might define another resource types like assets. but for now we only support path
      .filter(({ path }) => Boolean(path))
      .map((query) =>
        get(query.path)
          .then(({ headers, body }) => {
            stream.write(
              `,"${[query.path]}": ${JSON.stringify({
                headers,
                body,
                timestamp: Date.now(),
              })}`
            );

            if (query.children) {
              const children = query.children
                .filter(({ path }) => Boolean(path))
                .map((child) => pathResolver(child, body))
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
  };

module.exports = getFetchAll;