const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');
const publisherRoute = require('./publisher.route');
const bookRoute = require('./book.route');
const genreRoute = require('./genre.route');
const authorRoute = require('./author.route');
const profileRoute = require('./profile.route');
const cartRoute = require('./cart.route');
const addressRoute = require('./address.route');
const provinceRoute = require('./province.route');
const orderRoute = require('./order.route');
const discountRoute = require('./discount.route');
const postRoute = require('./post.route');
const reviewRoute = require('./review.route');
const statisticRoute = require('./statistic.route');
const notificationRoute = require('./notification.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/publishers',
    route: publisherRoute,
  },
  {
    path: '/books',
    route: bookRoute,
  },
  {
    path: '/genres',
    route: genreRoute,
  },
  {
    path: '/authors',
    route: authorRoute,
  },
  {
    path: '/orders',
    route: orderRoute,
  },
  {
    path: '/statistics',
    route: statisticRoute,
  },
  {
    path: '/profile',
    route: profileRoute,
  },
  {
    path: '/addresses',
    route: addressRoute,
  },
  {
    path: '/discounts',
    route: discountRoute,
  },
  {
    path: '/reviews',
    route: reviewRoute,
  },
  {
    path: '/cart',
    route: cartRoute,
  },
  {
    path: '/provinces',
    route: provinceRoute,
  },
  {
    path: '/posts',
    route: postRoute,
  },
  {
    path: '/notifications',
    route: notificationRoute,
  },
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
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
