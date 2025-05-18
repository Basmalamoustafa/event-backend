const eventController = require('../src/controllers/eventController');
const Event = require('../src/models/Event');

jest.mock('../src/models/Event');

describe('eventController', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, query: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getEvents', () => {
    it('should return paginated events', async () => {
      req.query = { page: 1, limit: 2 };
      const events = [{ name: 'A' }, { name: 'B' }];
      Event.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(events),
      });
      Event.countDocuments.mockResolvedValue(2);

      await eventController.getEvents(req, res);

      expect(Event.find).toHaveBeenCalled();
      expect(Event.countDocuments).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        events,
        total: 2,
        page: 1,
        pages: 1,
      }));
    });

    it('should handle errors', async () => {
      Event.find.mockImplementation(() => { throw new Error('fail'); });

      await eventController.getEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Server error' }));
    });
  });

  describe('getEvent', () => {
    it('should return a single event', async () => {
      req.params.id = '123';
      const event = { _id: '123', name: 'Test' };
      Event.findById.mockResolvedValue(event);

      await eventController.getEvent(req, res);

      expect(Event.findById).toHaveBeenCalledWith('123');
      expect(res.json).toHaveBeenCalledWith(event);
    });

    it('should return 404 if not found', async () => {
      req.params.id = '123';
      Event.findById.mockResolvedValue(null);

      await eventController.getEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Event not found' });
    });
  });

  describe('createEvent', () => {
    it('should create and return new event', async () => {
      req.body = { name: 'New Event' };
      const created = { _id: '1', name: 'New Event' };
      Event.create.mockResolvedValue(created);

      await eventController.createEvent(req, res);

      expect(Event.create).toHaveBeenCalledWith({ name: 'New Event' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });
  });

  describe('updateEvent', () => {
    it('should update and return event', async () => {
      req.params.id = '1';
      req.body = { name: 'Updated' };
      const updated = { _id: '1', name: 'Updated' };
      Event.findByIdAndUpdate.mockResolvedValue(updated);

      await eventController.updateEvent(req, res);

      expect(Event.findByIdAndUpdate).toHaveBeenCalledWith('1', { name: 'Updated' }, { new: true });
      expect(res.json).toHaveBeenCalledWith(updated);
    });
  });

  describe('deleteEvent', () => {
    it('should delete event and return message', async () => {
      req.params.id = '1';
      Event.findByIdAndDelete.mockResolvedValue({});

      await eventController.deleteEvent(req, res);

      expect(Event.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({ msg: 'Event deleted' });
    });
  });
});