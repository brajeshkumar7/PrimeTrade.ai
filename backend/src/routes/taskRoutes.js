const express = require('express');
const taskController = require('../controllers/taskController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Protected routes - require authentication
router.use(authMiddleware);

// Task routes
router.post('/', taskController.create);
router.get('/', taskController.getOwnTasks);
router.get('/all', roleMiddleware(['admin']), taskController.getAllUserTasks);
router.get('/:taskId', taskController.getById);
router.patch('/:taskId', taskController.update);
router.delete('/:taskId', taskController.deleteTask);

module.exports = router;
