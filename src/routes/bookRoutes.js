const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBook,
  getCategories,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');
const { protect, adminOnly } = require('../middleware/auth');

// Public
router.get('/', getBooks);
router.get('/categories', getCategories);  // must be before /:id
router.get('/:id', getBook);

// Admin only
router.post('/', protect, adminOnly, createBook);
router.put('/:id', protect, adminOnly, updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);

module.exports = router;
