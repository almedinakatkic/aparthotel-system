const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const resetLinksMap = {};
let latestResetEmails = [];

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        companyId: user.companyId,
        propertyGroupId: user.propertyGroupId || null
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        propertyGroupId: user.propertyGroupId || null,
        firstLogin: user.firstLogin
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// CHANGE PASSWORD
router.post('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.firstLogin = false;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Password update failed', error: err.message });
  }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'If this email is registered, a password reset link has been generated.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    resetLinksMap[user._id] = resetLink;

    if (!latestResetEmails.includes(email)) {
      latestResetEmails.push(email);
    }

    return res.status(200).json({
      message: 'Reset link generated successfully.'
    });
  } catch (err) {
    console.error('Error in /forgot-password:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// MANAGER GETS LATEST RESET LINK BY EMAIL
router.get('/latest-reset-link/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const link = resetLinksMap[user._id];
    if (!link) return res.status(404).json({ message: 'No reset link generated yet' });

    res.status(200).json({ resetLink: link });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// RESET PASSWORD
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.firstLogin = false;

    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
});

// STORE EMAIL REQUESTS FOR MANAGER UI
router.post('/latest-reset-request', (req, res) => {
  const { email } = req.body;
  if (!latestResetEmails.includes(email)) {
    latestResetEmails.push(email);
  }
  res.status(200).json({ message: 'Stored latest reset request' });
});

router.get('/all-reset-requests', (req, res) => {
  res.status(200).json(latestResetEmails);
});

router.post('/remove-reset-request', (req, res) => {
  const { email } = req.body;
  latestResetEmails = latestResetEmails.filter(e => e !== email);
  res.status(200).json({ message: 'Removed reset request' });
});

module.exports = router;