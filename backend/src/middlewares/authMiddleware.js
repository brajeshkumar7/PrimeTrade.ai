const AppError = require('../utils/AppError');
const { verifyToken, decodeToken } = require('../utils/jwt');
const { getRedisClient } = require('../config/redis');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No token provided. Please login', 401));
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix

    // Verify JWT signature
    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new AppError('Invalid or expired token', 401));
    }

    // Check if token exists in Redis
    const redisClient = await getRedisClient();
    const tokenExists = await redisClient.exists(`token:${token}`);

    if (!tokenExists) {
      return next(new AppError('Token has been revoked or expired', 401));
    }

    // Attach user info to request
    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    next(new AppError('Authentication failed', 401));
  }
};

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = verifyToken(token);

      if (decoded) {
        const redisClient = await getRedisClient();
        const tokenExists = await redisClient.exists(`token:${token}`);

        if (tokenExists) {
          req.user = decoded;
          req.token = token;
        }
      }
    }

    next();
  } catch (error) {
    // Optional auth, so we don't fail here
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
};
