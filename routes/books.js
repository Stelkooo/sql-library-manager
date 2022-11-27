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

/* POST create book */
router.post("/new", asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Article.create(req.body);
    res.redirect("/" + book.id);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render("new-book", { book, errors: error.errors, title: "New Book" });
    } else {
      throw error;
    }
  }
}));

/* Show book detail form */
router.get("/:id", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render("update-book", { book, title: "A Brief History of Time" });
  } else {
    res.sendStatus(404);
  }
}));

/* POST update book */
router.post("/:id", asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect("books/" + book.id);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render("/:id", { book, errors: error.errors, title: "New Book" });
    } else {
      throw error;
    }
  }
}));

/* Delete book */
router.post("/:id/delete", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.redirect("/", { title: "Books" });
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;
