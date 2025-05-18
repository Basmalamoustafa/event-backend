// backend/src/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import route modules
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/user');
const uploadRoutes = require('./routes/upload'); // ✅ Add upload routes

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes); // ✅ Use upload route

// Export app for testing
module.exports = app;

// If not in test environment, connect DB and start server
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5001;
  const MONGO_URI = process.env.MONGO_URI;

  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB');
      app.listen(PORT, () =>
        console.log(`🚀 Server running on http://localhost:${PORT}`)
      );
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err);
    });
}