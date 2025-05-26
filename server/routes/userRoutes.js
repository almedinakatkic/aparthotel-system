const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { createUser } = require('../controllers/userController');

// Only managers can create users
router.post(
  '/create',
  authMiddleware,
  roleMiddleware('manager'),
  createUser
);

module.exports = router;