const pathResolver = require("./pathResolver");
const { getProps, cache } = require("./utils");

const getFetchAll = (get) =>
  function fetchAll(batchRequest, stream, commonHeaders, state = cache()) {
    const requests = batchRequest
      // we might define another resource types like assets. but for now we only support path
      .filter(({ path }) => Boolean(path))
      .map((query) => {
        const requestOptions = {
          method: query.method || "GET",
          headers: { ...query.headers },
          body: query.body,
        };
        return get(query.path, requestOptions)
          .then(({ headers, body, statusCode }) => {
            let children;

            if (Array.isArray(query.usedProps) && query.usedProps.length) {
              state.set(getProps(query.id, body, query.usedProps))              
            }

            if (query.children && statusCode < 400) {
              // TODO: improve the performance here
              children = query.children
                .filter(({ path }) => Boolean(path))
                .map((child) => pathResolver(child, state.get))
                .flat();
            }

            stream.write(
              `,${JSON.stringify({
                requestId: query.requestId,
                path: query.path,
                error: statusCode > 400,
                response: {
                  statusCode,
                  headers,
                  body,
                },
                timestamp: Date.now(),
                // we are able to handel this in client side
                ...(children
                  ? { children: children.map(({ path }) => path) }
                  : {}),
              })}`
            );

            if (children) {
              return fetchAll(children, stream, commonHeaders, state);
            }
          })
          .catch((error) => {
            stream.write(
              `,${JSON.stringify({
                requestId: query.requestId,
                path: query.path,
                error,
                timestamp: Date.now(),
                isError: true,
              })}`
            );
          });
      });

    return Promise.all(requests);
  };

module.exports = getFetchAll;
