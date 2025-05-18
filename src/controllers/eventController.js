const Event = require('../models/Event');

// @desc   Get all events
// @route  GET /api/events
// @access Public
exports.getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tags } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (tags) filter.tags = { $in: tags.split(',') };

    const events = await Event.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(filter);

    res.json({
      events,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// @desc   Get single event
// @route  GET /api/events/:id
// @access Public
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// @desc   Create new event
// @route  POST /api/events
// @access Admin
exports.createEvent = async (req, res) => {
  try {
    const { tags, ...rest } = req.body;
    // Accept tags as array or comma-separated string
    const tagsArray = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
        ? tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];
    const newEvent = await Event.create({ ...rest, tags: tagsArray });
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// @desc   Update event
// @route  PUT /api/events/:id
// @access Admin
exports.updateEvent = async (req, res) => {
  try {
    const { tags, ...rest } = req.body;
    const tagsArray = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
        ? tags.split(',').map(t => t.trim()).filter(Boolean)
        : undefined;
    const updateData = tagsArray !== undefined ? { ...rest, tags: tagsArray } : rest;
    const updated = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ msg: 'Event not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// @desc   Delete event
// @route  DELETE /api/events/:id
// @access Admin
exports.deleteEvent = async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: 'Event not found' });
    res.json({ msg: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};