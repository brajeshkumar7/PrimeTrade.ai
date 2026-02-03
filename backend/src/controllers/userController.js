const AppError = require('../utils/AppError');
const { updateUserRole, getAllUsers, findUserById } = require('../services/userService');

const updateUserRoleController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role is provided
    if (!role) {
      return next(new AppError('Role is required', 400));
    }

    // Validate role value
    if (!['user', 'admin'].includes(role)) {
      return next(new AppError('Invalid role. Must be either "user" or "admin"', 400));
    }

    // Find user to ensure it exists
    const user = await findUserById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update the role
    const updatedUser = await updateUserRole(userId, role);

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: {
        user: updatedUser.toJSON(),
      },
    });
  } catch (error) {
    console.error('Update user role error:', error);
    next(error);
  }
};

const getAllUsersController = async (req, res, next) => {
  try {
    const users = await getAllUsers();

    res.status(200).json({
      success: true,
      data: {
        users: users.map((user) => user.toJSON()),
        total: users.length,
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    next(error);
  }
};

const getUserByIdController = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await findUserById(userId);
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
    console.error('Get user by ID error:', error);
    next(error);
  }
};

module.exports = {
  updateUserRoleController,
  getAllUsersController,
  getUserByIdController,
};
