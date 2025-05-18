require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection & GridFS init
const MONGO_URI = process.env.MONGO_URI;
const conn = mongoose.createConnection(MONGO_URI);

let gfs;
conn.once('open', () => {
  // initialize stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
  console.log('✅ GridFS initialized');
});

// make gfs available to routes
app.use((req, res, next) => {
  req.gfs = gfs;
  next();
});

// Routes
const authRoutes    = require('./routes/auth');
const eventRoutes   = require('./routes/events');
const bookingRoutes = require('./routes/bookings');
const userRoutes    = require('./routes/user');
const uploadRoutes  = require('./routes/upload');

app.use('/api/auth',    authRoutes);
app.use('/api/events',  eventRoutes);
app.use('/api/bookings',bookingRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/upload',  uploadRoutes);

// Export for tests
module.exports = app;

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB');
      const PORT = process.env.PORT || 5001;
      app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));
}
