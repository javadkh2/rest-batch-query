const getFetchAll = require("./fetchAll");
const fetcher = require("./fetch");

// TODO: this middleware could also use server push?
module.exports = ({ protocol = "http", port = 3000, host = "localhost" }) => {
  const fetchAll = getFetchAll(fetcher({ protocol, port, host }));
  return function queryMiddleware(req, res) {
    const batchRequest = req.body || req.query || [];
    res.set("Content-Type", "application/json; charset=utf-8;");
    res.write(`[{"method": "embed", "timestamp": ${Date.now()}} `);
    Promise.resolve()
      .then(() => fetchAll(batchRequest, res, req.headers))
      .then(() => {
        res.write("]");
        res.end();
      })
      .catch((error) => res.send({ isError: true, error }));
  };
};
