const cloudinary = require('../config/cloudinary');
const { AppError } = require('../middleware/errorHandler');

// @desc    Upload a cover image to Cloudinary
// @route   POST /api/upload/image
// @access  Admin
const uploadImage = async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  // Convert buffer to base64 data URI
  const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(fileStr, {
    folder: 'bookhaven/covers',
    transformation: [
      { width: 400, height: 560, crop: 'fill', gravity: 'auto' }, // standard book cover ratio
      { quality: 'auto', fetch_format: 'auto' }
    ]
  });

  res.json({
    success: true,
    url: result.secure_url,
    publicId: result.public_id,
  });
};

module.exports = { uploadImage };
