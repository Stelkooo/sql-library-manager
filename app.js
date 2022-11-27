var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// static middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error();
  err.statusCode = 404;
  err.message = "Hmm... that page doesn't seem to exist :/";
  res.render("page-not-found", { title: "Page Not Found", err });
});

// global error handler
app.use(function (err, req, res, next) {
  err.status = err.status ? err.status : 500;
  err.message = "Sorry! There was an unexpected error on the server.";

  console.log(err.status, err.message);

  res.status(err.status);
  res.render("error", { title: "Page Not Found", err });
});

module.exports = app;
