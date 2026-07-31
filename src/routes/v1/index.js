const express = require('express');
const userRoute = require('./userAuth.route');
const userDataRoute = require('./user.route');
const bookRoute = require('./book.route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');
const router = express.Router();

const defaultRoutes = [
  
  { path: '/user', route: userRoute },
  { path: '/usersdata', route: userDataRoute },
  { path: '/books', route: bookRoute },
  
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  console.log('Development routes enabled');
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
