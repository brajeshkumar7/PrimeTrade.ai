const AppError = require('../utils/AppError');
const { validateRegisterInput, validateLoginInput } = require('../utils/validators');
const { generateToken } = require('../utils/jwt');
const { findUserByEmail, createUser } = require('../services/userService');
const { getRedisClient } = require('../config/redis');
const { decodeToken } = require('../utils/jwt');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input exists
    if (!name || !email || !password) {
      return next(new AppError('Name, email, and password are required', 400));
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Basic validation
    if (!normalizedEmail.includes('@')) {
      return next(new AppError('Invalid email format', 400));
    }
    
    if (password.length < 6) {
      return next(new AppError('Password must be at least 6 characters', 400));
    }

    if (name.trim().length < 2) {
      return next(new AppError('Name must be at least 2 characters', 400));
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return next(new AppError('Email already registered. Please use a different email or login.', 409));
    }

    // Create user
    const user = await createUser(name, normalizedEmail, password);

    // Generate JWT
    const token = generateToken(user._id, user.role);

    // Try to store token in Redis, but continue even if it fails
    try {
      const redisClient = await getRedisClient();
      const decoded = decodeToken(token);
      const expiryTime = Math.max(1, decoded.exp - Math.floor(Date.now() / 1000));
      await redisClient.set(`token:${token}`, JSON.stringify(user._id), expiryTime);
    } catch (redisError) {
      console.warn('⚠ Warning: Could not store token in Redis:', redisError.message);
      // Continue without Redis - in-memory will be used as fallback
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    // Handle duplicate key error from MongoDB
    if (error.code === 11000) {
      return next(new AppError('Email already registered. Please use a different email or login.', 409));
    }
    console.error('Register error:', error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input exists
    if (!email || !password) {
      return next(new AppError('Email and password are required', 400));
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user and select password
    const user = await (require('../models/User')).findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Generate JWT
    const token = generateToken(user._id, user.role);

    // Try to store token in Redis, but continue even if it fails
    try {
      const redisClient = await getRedisClient();
      const decoded = decodeToken(token);
      const expiryTime = Math.max(1, decoded.exp - Math.floor(Date.now() / 1000));
      await redisClient.set(`token:${token}`, JSON.stringify(user._id), expiryTime);
    } catch (redisError) {
      console.warn('⚠ Warning: Could not store token in Redis:', redisError.message);
      // Continue without Redis - in-memory will be used as fallback
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    if (!req.token) {
      return next(new AppError('No token provided', 400));
    }

    // Try to remove token from Redis, but continue even if it fails
    try {
      const redisClient = await getRedisClient();
      await redisClient.del(`token:${req.token}`);
    } catch (redisError) {
      console.warn('⚠ Warning: Could not delete token from Redis:', redisError.message);
      // Continue without Redis - it's okay if Redis fails
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await (require('../services/userService')).findUserById(req.user.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const createAdminUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input exists
    if (!name || !email || !password) {
      return next(new AppError('Name, email, and password are required', 400));
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Basic validation
    if (!normalizedEmail.includes('@')) {
      return next(new AppError('Invalid email format', 400));
    }
    
    if (password.length < 6) {
      return next(new AppError('Password must be at least 6 characters', 400));
    }

    if (name.trim().length < 2) {
      return next(new AppError('Name must be at least 2 characters', 400));
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return next(new AppError('Email already registered. Please use a different email or login.', 409));
    }

    // Create admin user
    const User = require('../models/User');
    const user = new User({
      name,
      email: normalizedEmail,
      password,
      role: 'admin',
    });

    await user.save();

    // Generate JWT
    const token = generateToken(user._id, user.role);

    // Try to store token in Redis, but continue even if it fails
    try {
      const redisClient = await getRedisClient();
      const decoded = decodeToken(token);
      const expiryTime = Math.max(1, decoded.exp - Math.floor(Date.now() / 1000));
      await redisClient.set(`token:${token}`, JSON.stringify(user._id), expiryTime);
    } catch (redisError) {
      console.warn('⚠ Warning: Could not store token in Redis:', redisError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('Email already registered. Please use a different email or login.', 409));
    }
    console.error('Create admin error:', error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  createAdminUser,
};
