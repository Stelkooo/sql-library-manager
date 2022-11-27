var express = require('express');
var router = express.Router();
const Book = require("../models").Book;

/* GET home page. */
router.get('/', (req, res) => {
  res.redirect("/books");
});

module.exports = router;
