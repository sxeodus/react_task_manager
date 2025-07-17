const express = require('express');
const router = express.Router();
const {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
} = require('../controllers/taskController');

const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getTasks).post(createTask);

router.put('/reorder', reorderTasks);

router.route('/:id').put(updateTask).delete(deleteTask);

module.exports = router;
