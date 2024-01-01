const express = require('express');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');

const taskRouter = require('./routes/taskRouter');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serving static files
app.use(express.static(path.join(__dirname, '../', 'public')));

// Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Parse application/json
app.use(bodyParser.json());

// 3) Routs
app.get('/', (req, res) => {
  res.render('home', {title: 'Task Manager'});
});

app.get('/login', (req, res) => {
  res.render('login', {title: 'Login'});
});

app.get('/signup', (req, res) => {
  res.render('signup', {title: 'Sign Up'});
});

app.use('/tasks', taskRouter);
app.use('/users', userRouter);

// catch 404 and forward to error handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// error handler
app.use(globalErrorHandler);

module.exports = app;
