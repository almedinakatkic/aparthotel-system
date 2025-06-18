const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.createUser = async (req, res) => {
  const { name, email, phone, role, propertyGroupId, unitId } = req.body;

  if (!name || !email || !role || !phone) {
    return res.status(400).json({ message: 'Name, email, phone and role are required' });
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

    const hashedPassword = await bcrypt.hash('default123', 10); 

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      companyId: req.user.companyId,
      propertyGroupId: propertyGroupId || null,
      unitId: role === 'owner' ? unitId : undefined,
      firstLogin: true
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'User creation failed', error: err.message });
  }
};

exports.getAllUsersInCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const users = await User.find({ companyId }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, propertyGroupId } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.role = role || user.role;
    user.propertyGroupId = propertyGroupId || null;

    await user.save();
    res.json({ message: 'User updated successfully', data: user });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

