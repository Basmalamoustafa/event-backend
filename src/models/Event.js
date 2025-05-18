// backend/src/models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: String,
  category: String,
  date: { type: Date, required: true },
  venue: String,
  price: { type: Number, required: true },
  image: String,
  tags: [String],
  category: String
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
