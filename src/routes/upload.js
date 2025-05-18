const express = require('express');
const multer = require('multer');
const router = express.Router();
const Image = require('../models/Image');

// Use memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /upload/image
router.post('/image', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

  try {
    const image = new Image({
      data: req.file.buffer,
      contentType: req.file.mimetype,
      originalName: req.file.originalname
    });
    await image.save();
    // Return the image id to the client
    res.json({ imageId: image._id });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to save image', error: err.message });
  }
});

// GET /upload/image/:id
router.get('/image/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ msg: 'Image not found' });
    res.set('Content-Type', image.contentType);
    res.send(image.data);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to retrieve image', error: err.message });
  }
});

module.exports = router;