const express = require('express');
const router = express.Router();
const { 
  getTasksByPropertyGroup, 
  createTask, 
  deleteTask 
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/:propertyGroupId', getTasksByPropertyGroup);
router.post('/', createTask);
router.delete('/:taskId', deleteTask);

module.exports = router;