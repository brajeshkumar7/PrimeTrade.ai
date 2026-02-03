const Task = require('../models/Task');
const AppError = require('../utils/AppError');

const createTask = async (title, description, userId) => {
  const task = new Task({
    title,
    description: description || '',
    owner: userId,
  });

  return await task.save();
};

const getTasksByUser = async (userId) => {
  return await Task.find({ owner: userId }).sort({ createdAt: -1 });
};

const getAllTasks = async () => {
  return await Task.find().populate('owner', 'name email').sort({ createdAt: -1 });
};

const getTaskById = async (taskId) => {
  return await Task.findById(taskId).populate('owner', 'name email');
};

const updateTask = async (taskId, updateData) => {
  const allowedFields = ['title', 'description', 'status'];
  const filteredData = {};

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  });

  return await Task.findByIdAndUpdate(taskId, filteredData, {
    new: true,
    runValidators: true,
  }).populate('owner', 'name email');
};

const deleteTask = async (taskId) => {
  return await Task.findByIdAndDelete(taskId);
};

const getTasksByStatus = async (status, userId = null) => {
  const query = { status };
  if (userId) {
    query.owner = userId;
  }
  return await Task.find(query).sort({ createdAt: -1 });
};

module.exports = {
  createTask,
  getTasksByUser,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByStatus,
};
