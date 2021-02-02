console.log("hello world from file");

fetch("/api/user")
  .then((response) => response.json())
  .then(console.log);
