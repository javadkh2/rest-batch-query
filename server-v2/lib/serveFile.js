const fs = require("fs");
function serveFile(file, stream) {
  fs.lstat(file, (err, status) => {
    if (err || !status.isFile()) {
      stream.respond({
        ":status": 404,
      });
      return stream.end("file not found");
    }
    stream.respondWithFile(file);
  });
}

module.exports = serveFile;
