const Task = require('../models/Task');


exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort('order');
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createTask = async (req, res) => {
  try {
    req.body.user = req.user.id;

    const task = await Task.create(req.body);
    const io = req.app.get('io');
    io.to(req.user.id).emit('taskCreated', task);
    res.status(201).json({ success: true, data: task });    
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this task' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    const io = req.app.get('io');
    io.to(req.user.id).emit('taskUpdated', task);
    res.status(200).json({ success: true, data: task });    
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();

    const io = req.app.get('io');
    io.to(req.user.id).emit('taskDeleted', task._id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body;
    const { id: userId } = req.user;
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ success: false, message: 'Invalid task order data' });
    }
    await Promise.all(tasks.map(async (taskId, index) => {
      await Task.findOneAndUpdate({ _id: taskId, user: userId }, { order: index });
    }));
    const updatedTasks = await Task.find({ user: userId }).sort('order');
    res.status(200).json({ success: true, data: updatedTasks });
  } catch (err) {
    console.error("Reorder Task Error:", err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
