var express = require('express');
var router = express.Router();
const Book = require("../models").Book;

/* Handler function to wrap each route. */
const asyncHandler = (cb) => {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  }
};

/* GET books listing. */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll({ order: [["id", "ASC"]] });
  res.render("index", { books, title: "Books" });
}));

/* Create a new book form */
router.get("/new", (req, res) => {
  res.render("new-book", { article: {}, title: "New Book" });
});

module.exports = router;
