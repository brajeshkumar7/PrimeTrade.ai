const User = require('../models/User');
const AppError = require('../utils/AppError');

const findUserByEmail = async (email) => {
  return await User.findOne({ email: email.toLowerCase() });
};

const findUserById = async (userId) => {
  return await User.findById(userId);
};

const createUser = async (name, email, password) => {
  const user = new User({
    name,
    email: email.toLowerCase(),
    password,
    role: 'user',
  });

  return await user.save();
};

const updateUser = async (userId, updateData) => {
  const allowedFields = ['name'];
  const filteredData = {};

  allowedFields.forEach((field) => {
    if (updateData[field]) {
      filteredData[field] = updateData[field];
    }
  });

  return await User.findByIdAndUpdate(userId, filteredData, {
    new: true,
    runValidators: true,
  });
};

const updateUserRole = async (userId, role) => {
  if (!['user', 'admin'].includes(role)) {
    throw new AppError('Invalid role. Must be either "user" or "admin"', 400);
  }

  return await User.findByIdAndUpdate(userId, { role }, {
    new: true,
    runValidators: true,
  });
};

const getAllUsers = async () => {
  return await User.find().select('-password');
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  updateUserRole,
  getAllUsers,
};
