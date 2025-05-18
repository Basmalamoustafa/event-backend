// backend/src/controllers/userController.js
const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// @desc    Get all admins
// @route   GET /api/users/admins
// @access  Admin
exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    res.json(admins);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
