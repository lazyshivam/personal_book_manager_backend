const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const cookieParser = require('cookie-parser');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse cookies (Required for our new refresh token logic)
app.use(cookieParser());

// parse json request body and urlencoded request body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// sanitize request data
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// --- CRITICAL CORS FIX FOR NEXT.JS & COOKIES ---
app.use(cors({
  origin: config.env === 'development' 
    ? 'http://localhost:3000' // Your Next.js local URL
    : 'https://personalbookmanager.netlify.app', 
  credentials: true, // REQUIRED to allow HTTP-only cookies to be sent back and forth
}));
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

app.use('/testServer', (req, res) => {
  res.send("Hello From Server");
});

global.doc_path = __dirname + "/tmp";

// send back a 404 error for any unknown api request (Restored)
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'API endpoint not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;