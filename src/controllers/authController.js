const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Utility function to sign a token with user details
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, // Include the user ID and role in the token
    process.env.JWT_SECRET, // The secret key for JWT
    { expiresIn: '7d' } // Token expiration set to 7 days
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the email already exists in the database
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: 'Email already in use' });
    }

    // Create a new user
    const user = await User.create({ name, email, password });

    // Sign a JWT token for the newly created user
    const token = signToken(user);

    // Return the token and user details (excluding password)
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    // Handle any errors
    res.status(500).json({ error: err.message });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare the provided password with the stored one
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Sign a JWT token for the logged-in user
    const token = signToken(user);

    // Return the token and user details (excluding password)
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role } // Ensure role is included here
    });
  } catch (err) {
    // Handle any errors
    res.status(500).json({ error: err.message });
  }
};

// @desc    Promote a user to admin
// @route   PATCH /api/auth/promote/:id
// @access  Admin
exports.promoteUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.id === id) {
      return res.status(400).json({ msg: "You’re already an admin!" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Remove password field if present
    if (user.password) user.password = undefined;

    res.json({ msg: `${user.email} is now an admin.`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};