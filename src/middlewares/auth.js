const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const verifyCallback = (req, resolve, reject, requiredRoles) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid_Credentials'));
  }
  req.user = user;

  if (requiredRoles.length) {
    const userRoles = Object.keys(user.roles).map((key) => user.roles[key]);

    const hasRequiredRoles = requiredRoles.some((role) => userRoles.includes(role));
    if (!hasRequiredRoles && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  if (!user.isActive) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Account is not active'));
  }

  resolve();
};

const auth =
  (...requiredRoles) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRoles))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

module.exports = auth;
