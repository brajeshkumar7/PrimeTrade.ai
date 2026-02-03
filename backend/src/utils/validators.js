const validator = require('validator');
const AppError = require('./AppError');

const validateEmail = (email) => {
  if (!email || !validator.isEmail(email)) {
    throw new AppError('Invalid email format', 400);
  }
};

const validatePassword = (password) => {
  if (!password || password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }
};

const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    throw new AppError('Name must be at least 2 characters', 400);
  }
};

const validateRegisterInput = (email, password, name) => {
  validateName(name);
  validateEmail(email);
  validatePassword(password);
};

const validateLoginInput = (email, password) => {
  validateEmail(email);
  if (!password) {
    throw new AppError('Password is required', 400);
  }
};

const validateTaskInput = (title, description) => {
  if (!title || title.trim().length < 3) {
    throw new AppError('Task title must be at least 3 characters', 400);
  }
  if (description && description.length > 500) {
    throw new AppError('Description cannot exceed 500 characters', 400);
  }
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateRegisterInput,
  validateLoginInput,
  validateTaskInput,
};
