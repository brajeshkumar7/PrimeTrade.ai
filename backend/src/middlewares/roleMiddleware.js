const AppError = require('../utils/AppError');

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `This action requires ${allowedRoles.join(' or ')} role`,
          403
        )
      );
    }

    next();
  };
};

module.exports = roleMiddleware;
