const express = require('express');
const multer  = require('multer');
const router  = express.Router();
const { uploadImage } = require('../controllers/uploadController');
const { protect, adminOnly } = require('../middleware/auth');

// Store file in memory (buffer) — we send it straight to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
    }
  }
});

// POST /api/upload/image — admin only
router.post('/image', protect, adminOnly, upload.single('image'), uploadImage);

module.exports = router;
