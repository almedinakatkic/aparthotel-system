const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.createUser = async (req, res) => {
  const { name, email, role, propertyGroupId } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ message: 'Name, email, and role are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash('default123', 10); // You can later randomize or improve this

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      companyId: req.user.companyId,
      propertyGroupId: propertyGroupId || null,
      firstLogin: true
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'User creation failed', error: err.message });
  }
};
