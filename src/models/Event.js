const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: String,
  category: String,
  date: { type: Date, required: true },
  venue: String,
  price: { type: Number, required: true },
  image: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }, // Reference to Image
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);