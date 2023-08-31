/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prettier/prettier */
/* eslint-disable import/no-unresolved */
/* eslint-disable node/no-missing-require */
/* eslint-disable prettier/prettier */
/* eslint-disable import/extensions */
/* eslint-disable prettier/prettier */
const path = require('path');

const express = require('express');

// const rateLimit = require('express-rate-limit');

const morgan = require('morgan');

const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const xss = require('xss-clean');

const hpp = require('hpp');

const globalErrorHandler = require('./controllers/errorController');

const AppError = require('./utiles/appError');

const tourRouter = require('./routes/tourRoutes');

const userRouter = require('./routes/userRoutes');

const reviewRouter = require('./routes/reviewRoutes');

const viewRouter = require('./routes/viewRoutes');

// Start express app
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) MIDDLEWARES
//// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

//// Set Scurity HTTP headers
app.use(helmet());

/// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/// Body parser, reading data from the body req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitizaion against NoSql query injection
app.use(mongoSanitize());

/// Data sanitizaion against XSS
app.use(xss());

//// prevent paramter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// const loginAccountLimiter = rateLimit({
//   windowMs: 60000,
//   max: 3,
//   message: 'too many reqeusts pls log in later after 1 minute',
// });
// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'hello from the server side', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('you can post to this endpoint....');
// });

// app.use('/api/v1/users/login', loginAccountLimiter);

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 400));
});

app.use(globalErrorHandler);
//4) START THE SERVER

module.exports = app;
