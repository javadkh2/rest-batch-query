const express = require("express");
const { profiles, blogs, articles } = require("./fixture");

const router = express.Router();

const getMiddleware = (model) => (req, res) => {
  try {
    const { id } = req.params;
    const item = model[id];
    if (!item) {
      res.status(404).send("Not found");
    }
    res.json(item);
  } catch (e) {
    res.status(500).send("Internal Server Error");
  }
};

const delay = (ms) => (req, res, next) => setTimeout(next, ms);

// adding delay for test purpure
router.get("/profile/:id", delay(10), getMiddleware(profiles));
router.get("/blog/:id", delay(100), getMiddleware(blogs));
router.get("/article/:id", delay(2000), getMiddleware(articles));

module.exports = router;
