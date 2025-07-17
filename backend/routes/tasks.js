const express = require('express');
const router = express.Router();
const {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
} = require('../controllers/taskController');

// Import middleware
const { protect } = require('../middleware/auth');

// Apply the protect middleware to all routes in this file
router.use(protect);

// Routes for getting and creating tasks
router.route('/').get(getTasks).post(createTask);

// Route for reordering tasks
router.put('/reorder', reorderTasks);

// Routes for updating and deleting a specific task
router.route('/:id').put(updateTask).delete(deleteTask);

module.exports = router;
