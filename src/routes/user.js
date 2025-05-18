// backend/src/routes/user.js
const express = require('express');
const { getUsers, getAdmins } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Admin
router.get('/', protect, admin, getUsers);

// @route   GET /api/users/admins
// @desc    Get only admin users (admin only)
// @access  Admin
router.get('/admins', protect, admin, getAdmins);

module.exports = router;
