var express = require("express");
var router = express.Router();
const Book = require("../models").Book;
const { Op } = require("sequelize");

const sizeLimit = 10;

/* Handler function to wrap each route. */
const asyncHandler = (cb) => {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  };
};

/* GET books listing. */
router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const pageQuery = Number.parseInt(req.query.page);
    const searchQuery = req.query.q ? req.query.q : "";

    let page = 0;
    if (!Number.isNaN(pageQuery) && pageQuery > 0) {
      page = pageQuery - 1;
    }

    const books = await Book.findAndCountAll({
      where: {
        [Op.or]: {
          title: {
            [Op.like]: `%${searchQuery}%`,
          },
          author: {
            [Op.like]: `%${searchQuery}%`,
          },
          genre: {
            [Op.like]: `%${searchQuery}%`,
          },
          year: {
            [Op.like]: `%${searchQuery}%`,
          },
        },
      },
      limit: sizeLimit,
      offset: page * sizeLimit,
    });

    if (books.count === 0) {
      const err = new Error();
      err.status = 404;
      err.message = "No search results found";
      next(err);
      return;
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
        page: page + 1,
      };
      res.render("index", {
        books: books.rows,
        title: "Books",
        pagination,
        searchQuery,
      });
    }
  })
);

/* Create a new book form */
router.get("/new", (req, res) => {
  res.render("new-book", { book: {}, title: "New Book" });
});

/* POST create book */
router.post(
  "/new",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect("/");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        res.render("new-book", {
          book,
          errors: error.errors,
          title: "New Book",
        });
      } else {
        throw error;
      }
    }
  })
);

/* Show book detail form */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("update-book", { book, title: book.title });
    } else {
      const err = new Error();
      err.status = 404;
      err.message = "Book ID not found";
      res.render("page-not-found", { title: "Page Not Found", err });
    }
  })
);

/* POST update book */
router.post(
  "/:id",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.findByPk(req.params.id);
      if (book) {
        await book.update(req.body);
        res.redirect("/");
      } else {
        const err = new Error();
        err.status = 404;
        err.message = "Book ID not found";
        res.render("page-not-found", { title: "Page Not Found", err });
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = req.params.id;
        res.render("update-book", {
          book,
          errors: error.errors,
          title: "New Book",
        });
      } else {
        throw error;
      }
    }
  })
);

/* Delete book */
router.post(
  "/:id/delete",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.redirect("/");
    } else {
      const err = new Error();
      err.status = 404;
      err.message = "Book ID not found";
      res.render("page-not-found", { title: "Page Not Found", err });
    }
  })
);

module.exports = router;
