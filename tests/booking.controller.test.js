const bookingController = require('../src/controllers/booking.controller');
const Booking = require('../src/models/Booking');
const Event = require('../src/models/Event');

jest.mock('../src/models/Booking');
jest.mock('../src/models/Event');

describe('bookingController', () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: 'user123' }, body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('bookEvent', () => {
    it('should book an event successfully', async () => {
      req.body = { eventId: 'event1' };
      Event.findById.mockResolvedValue({ _id: 'event1' });
      Booking.create.mockResolvedValue({ _id: 'booking1', event: 'event1', user: 'user123' });

      await bookingController.bookEvent(req, res);

      expect(Event.findById).toHaveBeenCalledWith('event1');
      expect(Booking.create).toHaveBeenCalledWith({ event: 'event1', user: 'user123' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ _id: 'booking1' }));
    });

    it('should return 404 if event not found', async () => {
      req.body = { eventId: 'event1' };
      Event.findById.mockResolvedValue(null);

      await bookingController.bookEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Event not found' });
    });

    it('should return 400 if already booked', async () => {
      req.body = { eventId: 'event1' };
      Event.findById.mockResolvedValue({ _id: 'event1' });
      const err = new Error('duplicate');
      err.code = 11000;
      Booking.create.mockRejectedValue(err);

      await bookingController.bookEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'You have already booked this event.' });
    });

    it('should handle server errors', async () => {
      req.body = { eventId: 'event1' };
      Event.findById.mockResolvedValue({ _id: 'event1' });
      Booking.create.mockRejectedValue(new Error('fail'));

      await bookingController.bookEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Server error' }));
    });
  });

  describe('getUserBookings', () => {
    it('should return user bookings', async () => {
      const bookings = [{ _id: 'b1' }, { _id: 'b2' }];
      Booking.find.mockReturnValue({ populate: jest.fn().mockResolvedValue(bookings) });

      await bookingController.getUserBookings(req, res);

      expect(Booking.find).toHaveBeenCalledWith({ user: 'user123' });
      expect(res.json).toHaveBeenCalledWith(bookings);
    });

    it('should handle server errors', async () => {
      Booking.find.mockReturnValue({ populate: jest.fn().mockRejectedValue(new Error('fail')) });

      await bookingController.getUserBookings(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Server error' }));
    });
  });

  describe('deleteBooking', () => {
    it('should delete booking if owner', async () => {
      req.params.id = 'booking1';
      const booking = { _id: 'booking1', user: 'user123', toString: () => 'user123' };
      Booking.findById.mockResolvedValue(booking);
      Booking.findByIdAndDelete.mockResolvedValue({});

      await bookingController.deleteBooking(req, res);

      expect(Booking.findById).toHaveBeenCalledWith('booking1');
      expect(Booking.findByIdAndDelete).toHaveBeenCalledWith('booking1');
      expect(res.json).toHaveBeenCalledWith({ msg: 'Booking deleted successfully' });
    });

    it('should return 404 if booking not found', async () => {
      req.params.id = 'booking1';
      Booking.findById.mockResolvedValue(null);

      await bookingController.deleteBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Booking not found' });
    });

    it('should return 401 if not owner', async () => {
      req.params.id = 'booking1';
      const booking = { _id: 'booking1', user: 'otheruser', toString: () => 'otheruser' };
      Booking.findById.mockResolvedValue(booking);

      await bookingController.deleteBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Not authorized to delete this booking' });
    });

    it('should handle server errors', async () => {
      req.params.id = 'booking1';
      Booking.findById.mockRejectedValue(new Error('fail'));

      await bookingController.deleteBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Server error' }));
    });
  });
});