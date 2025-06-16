const express = require('express');
const router = express.Router();
const { 
  getTasksByPropertyGroup, 
  createTask, 
  deleteTask,
  completeTask 
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/:propertyGroupId', getTasksByPropertyGroup);
router.post('/', createTask);
router.delete('/:taskId', deleteTask);
router.patch('/:taskId/complete', completeTask);

module.exports = router;