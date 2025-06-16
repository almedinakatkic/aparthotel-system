const Task = require('../models/Task');

const getTasksByPropertyGroup = async (req, res) => {
  try {
    const { propertyGroupId } = req.params;
    const tasks = await Task.find({ propertyGroupId })
      .populate('unitId', 'unitNumber')
      .populate('assignedTo', 'name surname');
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

    // Return populated task
    const populatedTask = await Task.findById(newTask._id)
      .populate('unitId', 'unitNumber')
      .populate('assignedTo', 'name surname');

    res.status(201).json(populatedTask);
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

const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { cleaningType } = req.body;

    const update = { status: 'done' };
    if (cleaningType) update.cleaningType = cleaningType;

    const task = await Task.findByIdAndUpdate(taskId, update, { new: true })
      .populate('unitId', 'unitNumber')
      .populate('assignedTo', 'name');

    res.json(task);
  } catch (err) {
    console.error('Error completing task:', err);
    res.status(500).json({ message: 'Server error completing task' });
  }
};

module.exports = {
  getTasksByPropertyGroup,
  createTask,
  deleteTask,
  completeTask
};
