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

router.get("/profile/:id", getMiddleware(profiles));
router.get("/blog/:id", getMiddleware(blogs));
router.get("/article/:id", getMiddleware(articles));

module.exports = router;
