// backend/src/routes/events.js
const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEvent);

// Admin-only
router.post('/', protect, admin, createEvent);
router.put('/:id', protect, admin, updateEvent);
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;
