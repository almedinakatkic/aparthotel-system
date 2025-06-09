const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { createUser } = require('../controllers/userController');
const User = require('../models/User');

// Only managers can create users
router.post(
  '/create',
  authMiddleware,
  roleMiddleware('manager'),
  createUser
);

// Search users by email (only accessible to manager)
router.get('/search', authMiddleware, async (req, res) => {
  const { email } = req.query;

  try {
    const requestingUser = await User.findById(req.user.id);
    if (!requestingUser || requestingUser.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const regex = new RegExp(email, 'i'); // case-insensitive search
    const users = await User.find({ email: regex }).select('_id name email');

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
});

module.exports = router;
