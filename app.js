var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');

var indexRouter = require('./routes/index');
var booksRouter = require('./routes/books');
const { ERROR } = require('sqlite3');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
app.use('/books', booksRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error();
  err.statusCode = 404;
  err.message = "Hmm... that page doesn't seem to exist :/";
  res.render('page-not-found', { title: 'Page Not Found', err });
});

// global error handler
app.use((err, req, res, next) => {
  err.status = err.status ? err.status : 500;
  err.message = err.message
    ? err.message
    : 'Sorry! There was an unexpected error on the server.';

  console.log(err.status, err.message);

  res.status(err.status);
  res.render('error', { title: 'Page Not Found', err });
});

// set our port
app.set('port', process.env.PORT || 3000);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully');
  } catch (err) {
    console.error(`Unable to connect to the database: ${err}`);
  }
})();

// start listening on our port
sequelize.sync().then(() => {
  const server = app.listen(app.get('port'), () => {
    console.log(`Express server is listening on port ${server.address().port}`);
  });
});

module.exports = app;
