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
            let children;

            if (query.children) {
              // TODO: improve the performance here
              children = query.children
                .filter(({ path }) => Boolean(path))
                .map((child) => pathResolver(child, body))
                .flat();
            }

            stream.write(
              `,${JSON.stringify({
                path: query.path,
                headers,
                body,
                timestamp: Date.now(),
                // we are able to handel this in client
                ...(children
                  ? { children: children.map(({ path }) => path) }
                  : {}),
              })}`
            );

            if (children) {
              return fetchAll(children, stream);
            }
          })
          .catch((error) => {
            stream.write(
              `,${JSON.stringify({
                path: query.path,
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
