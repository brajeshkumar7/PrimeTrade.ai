const AppError = require('../utils/AppError');
const { validateTaskInput } = require('../utils/validators');
const {
  createTask,
  getTasksByUser,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../services/taskService');

const create = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    // Validate input
    validateTaskInput(title, description);

    // Create task
    const task = await createTask(title, description, userId);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getOwnTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user's tasks
    const tasks = await getTasksByUser(userId);

    res.status(200).json({
      success: true,
      data: {
        tasks,
        count: tasks.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllUserTasks = async (req, res, next) => {
  try {
    // Only admins can access this
    const tasks = await getAllTasks();

    res.status(200).json({
      success: true,
      data: {
        tasks,
        count: tasks.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await getTaskById(taskId);

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    // Check authorization
    if (task.owner._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to view this task', 403));
    }

    res.status(200).json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { title, description, status } = req.body;

    // Validate input
    if (title || description) {
      validateTaskInput(title || '', description);
    }

    const task = await getTaskById(taskId);

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    // Check authorization
    if (task.owner._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to update this task', 403));
    }

    // Validate status
    if (status && !['pending', 'completed'].includes(status)) {
      return next(new AppError('Invalid status value', 400));
    }

    // Update task
    const updatedTask = await updateTask(taskId, {
      title,
      description,
      status,
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: {
        task: updatedTask,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask_controller = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await getTaskById(taskId);

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    // Check authorization
    if (task.owner._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to delete this task', 403));
    }

    // Delete task
    await deleteTask(taskId);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getOwnTasks,
  getAllUserTasks,
  getById,
  update,
  deleteTask: deleteTask_controller,
};
