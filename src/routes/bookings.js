// backend/src/routes/bookings.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  bookEvent,
  getUserBookings,
  deleteBooking,   // <-- import new controller function
} = require('../controllers/booking.controller');

// existing routes
router.post('/', protect, bookEvent);
router.get('/my', protect, getUserBookings);

// new route to delete a booking by ID
router.delete('/:id', protect, deleteBooking);

module.exports = router;
