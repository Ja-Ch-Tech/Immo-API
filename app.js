/**
|--------------------------------------------------
| Ja'Ch Technologies
|--------------------------------------------------
*/
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var db = require("./models/db");

//mongodb+srv://anonymefr:taskok@frdrcpeter-ebpjm.mongodb.net/test?retryWrites=true&w=majority
//mongodb://@localhost:27017/Immob?authSource=admin
var string_con = 'mongodb://@localhost:27017/Immob?authSource=admin';

db.connect(string_con, (isConnected, resultConnect) => {

  if (isConnected) {
    console.log(resultConnect)
  } else {
    console.log(resultConnect);
  }

})

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var typeImmoRouter = require('./routes/type_immobilier');
var modeImmoRouter = require('./routes/mode_immobilier');
var typeUsersRouter = require('./routes/type_users');
var immoRouter = require('./routes/immobilier');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/type', typeImmoRouter);
app.use('/mode', modeImmoRouter);
app.use('/typeUser', typeUsersRouter);
app.use('/immobilier', immoRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

/**
|--------------------------------------------------
| Ja'Ch Technologies
|--------------------------------------------------
*/