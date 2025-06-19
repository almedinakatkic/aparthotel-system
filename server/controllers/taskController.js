const Task = require('../models/Task');
const Unit = require('../models/Unit');

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
  const { taskId } = req.params;
  const { cleaningType } = req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.status = 'done';

    if (task.type === 'cleaning' && cleaningType) {
      task.cleaningType = cleaningType;
    }

    await task.save();

    // Update corresponding unit with lastCleaned or lastMaintenance
    const updateField = task.type === 'cleaning' ? 'lastCleaned' :
                        task.type === 'maintenance' ? 'lastMaintenance' : null;

    if (updateField) {
      await Unit.findByIdAndUpdate(task.unitId, {
        [updateField]: task.date
      });
    }

    res.status(200).json({ message: 'Task completed successfully' });
  } catch (err) {
    console.error('Error completing task:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// status (pending ↔ done)
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!['pending', 'done'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { status },
      { new: true }
    )
      .populate('unitId', 'unitNumber')
      .populate('assignedTo', 'name surname');

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task status:', err);
    res.status(500).json({ message: 'Server error updating task status' });
  }
};

module.exports = {
  getTasksByPropertyGroup,
  createTask,
  deleteTask,
  completeTask,
  updateTaskStatus
};
