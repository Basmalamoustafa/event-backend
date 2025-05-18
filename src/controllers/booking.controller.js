const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Book an event (one ticket per call)
// @route   POST /api/bookings
// @access  Authenticated users
exports.bookEvent = async (req, res) => {
  console.log('🔐 [booking.controller] bookEvent called');
  console.log('    user:', req.user.id);
  console.log('    body:', req.body);

  try {
    const { eventId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      console.log('❌ Event not found');
      return res.status(404).json({ msg: 'Event not found' });
    }

    const booking = await Booking.create({
      event: eventId,
      user: req.user.id,
    });

    console.log('✅ Booking created:', booking._id);
    return res.status(201).json(booking);
  } catch (err) {
    console.error('🔥 Booking error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'You have already booked this event.' });
    }
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my
// @access  Authenticated users
exports.getUserBookings = async (req, res) => {
  console.log('🔐 [booking.controller] getUserBookings called');
  console.log('    user:', req.user.id);

  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('event');
    return res.json(bookings);
  } catch (err) {
    console.error('🔥 Booking fetch error:', err);
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// @desc    Delete a booking by ID (only by the owner)
// @route   DELETE /api/bookings/:id
// @access  Authenticated users
exports.deleteBooking = async (req, res) => {
  console.log('🔐 [booking.controller] deleteBooking called');
  console.log('    user:', req.user.id);
  console.log('    booking id:', req.params.id);

  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      console.log('❌ Booking not found');
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Check if the current user owns this booking
    if (booking.user.toString() !== req.user.id) {
      console.log('❌ Unauthorized deletion attempt');
      return res.status(401).json({ msg: 'Not authorized to delete this booking' });
    }

    // Use findByIdAndDelete instead of booking.remove()
    await Booking.findByIdAndDelete(req.params.id);

    console.log('✅ Booking deleted:', req.params.id);
    return res.json({ msg: 'Booking deleted successfully' });
  } catch (err) {
    console.error('🔥 Booking deletion error:', err);
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
