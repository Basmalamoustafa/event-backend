const express = require('express');
const multer  = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const router  = express.Router();

// Use your same MONGO_URI
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => ({
    bucketName: 'uploads',
    filename: `${Date.now()}-${file.originalname}`
  })
});
const upload = multer({ storage });

// POST /api/upload/image
router.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
  // The file id is in req.file.id
  res.json({ imageId: req.file.id });
});

// GET /api/upload/image/:id
router.get('/image/:id', async (req, res) => {
  try {
    const gfs = req.gfs;
    const _id = new mongoose.Types.ObjectId(req.params.id);
    // find matching file
    const files = await gfs.find({ _id }).toArray();
    if (!files || files.length === 0) return res.status(404).json({ msg: 'No file found' });
    res.set('Content-Type', files[0].contentType);
    // stream it
    gfs.openDownloadStream(_id).pipe(res);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
