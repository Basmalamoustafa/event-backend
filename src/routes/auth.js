// backend/src/routes/auth.js
const express = require('express');
const { register, login, promoteUser } = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   PATCH /api/auth/promote/:id
// @desc    Promote a user to admin
// @access  Admin
router.patch('/promote/:id', protect, admin, promoteUser);

module.exports = router;
