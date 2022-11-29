var express = require('express');
var router = express.Router();
const Book = require("../models").Book;
const { Op } = require('sequelize');

const sizeLimit = 10;

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

/* Search bar function */
const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.on("searchInput", (inputValue) => {
  // console.log(inputValue);
});

/* GET books listing. */
router.get('/', asyncHandler(async (req, res, next) => {
  // const books = await Book.findAll({ order: [["id", "ASC"]] });
  const pageQuery = Number.parseInt(req.query.page);
  
  let page = 0;
  if (!Number.isNaN(pageQuery) && pageQuery > 0) {
    page = pageQuery;
  }

  const books = await Book.findAndCountAll({
    limit: sizeLimit,
    offset: page * sizeLimit
  });

  const totalPages = Math.ceil(books.count / sizeLimit);

  if (page >= totalPages) {
    const err = new Error();
    err.status = 404;
    err.message = "Page number does not exist";
    next(err);
  } else {
    const pagination = {
      totalPages,
      page: page
    };
    res.render("index", { books : books.rows, title: "Books", pagination, emitter });
  }
}));

router.post("/", asyncHandler(async (req, res, next) => {
  const pageQuery = Number.parseInt(req.query.page);
  const { search } = req.body;
  let page = 0;
  if (!Number.isNaN(pageQuery) && pageQuery > 0) {
    page = pageQuery;
  }
  const books = await Book.findAndCountAll({
    where: {
      [Op.or]: {
        title: {
          [Op.like]: `%${search}%`
        },
        author: {
          [Op.like]: `%${search}%`
        },
        genre: {
          [Op.like]: `%${search}%`
        },
        year: {
          [Op.like]: `%${search}%`
        }
      }
    },
    limit: sizeLimit,
    offset: page * sizeLimit
  });

  console.log(books.count);

  if (books.count === 0) {
    const err = new Error();
    err.status = 404;
    err.message = "No search results found";
    next(err);
  }

  const totalPages = Math.ceil(books.count / sizeLimit);

  if (page >= totalPages) {
    const err = new Error();
    err.status = 404;
    err.message = "Page number does not exist";
    next(err);
  } else {
    const pagination = {
      totalPages,
      page: page
    };
    res.render("index", { books : books.rows, title: "Books", pagination, emitter });
  }
}));

/* Create a new book form */
router.get("/new", (req, res) => {
  res.render("new-book", { book: {}, title: "New Book" });
});

/* POST create book */
router.post("/new", asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/");
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
    res.render("update-book", { book, title: book.title });
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
      res.redirect("/");
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render("update-book", { book, errors: error.errors, title: "New Book" });
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
    res.redirect("/");
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;
