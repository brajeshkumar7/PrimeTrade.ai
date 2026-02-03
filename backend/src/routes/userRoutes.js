const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
  updateUserRoleController,
  getAllUsersController,
  getUserByIdController,
} = require('../controllers/userController');

const router = express.Router();

// Protect all user routes - require authentication
router.use(authMiddleware);

// Admin-only routes
router.get('/all', roleMiddleware(['admin']), getAllUsersController);
router.get('/:userId', roleMiddleware(['admin']), getUserByIdController);
router.patch('/:userId/role', roleMiddleware(['admin']), updateUserRoleController);

module.exports = router;
