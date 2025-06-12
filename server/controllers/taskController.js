const Task = require('../models/Task');

const getTasksByPropertyGroup = async (req, res) => {
  try {
    const { propertyGroupId } = req.params;
    const tasks = await Task.find({ propertyGroupId });
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

const createTask = async (req, res) => {
  try {
    const { unitId, assignedTo, type, date, propertyGroupId } = req.body;
    const newTask = new Task({ unitId, assignedTo, type, date, propertyGroupId });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: 'Server error creating task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    await Task.findByIdAndDelete(taskId);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ message: 'Server error deleting task' });
  }
};

module.exports = {
  getTasksByPropertyGroup,
  createTask,
  deleteTask
};
