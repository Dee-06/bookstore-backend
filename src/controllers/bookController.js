const Book = require('../models/Book');
const { AppError } = require('../middleware/errorHandler');

// @desc    Get all books (with search, filter, sort, pagination)
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  const {
    search,
    category,
    sort = 'newest',
    page = 1,
    limit = 12,
    minPrice,
    maxPrice,
  } = req.query;

  const query = {};

  // Full-text search
  if (search) {
    query.$text = { $search: search };
  }

  // Category filter
  if (category && category !== 'All') {
    query.category = category.toLowerCase();
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Sort mapping
  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    title_asc: { title: 1 },
    title_desc: { title: -1 },
  };
  const sortOption = sortMap[sort] || { createdAt: -1 };

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [books, total] = await Promise.all([
    Book.find(query).sort(sortOption).skip(skip).limit(limitNum).lean(),
    Book.countDocuments(query),
  ]);

  res.json({
    success: true,
    books,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
};

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public
const getBook = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw new AppError('Book not found', 404);
  res.json({ success: true, book });
};

// @desc    Get all unique categories
// @route   GET /api/books/categories
// @access  Public
const getCategories = async (req, res) => {
  const categories = await Book.distinct('category');
  res.json({ success: true, categories });
};

// @desc    Create a book
// @route   POST /api/books
// @access  Admin
const createBook = async (req, res) => {
  const book = await Book.create(req.body);
  res.status(201).json({ success: true, book });
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Admin
const updateBook = async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!book) throw new AppError('Book not found', 404);
  res.json({ success: true, book });
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Admin
const deleteBook = async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) throw new AppError('Book not found', 404);
  res.json({ success: true, message: 'Book deleted successfully' });
};

module.exports = { getBooks, getBook, getCategories, createBook, updateBook, deleteBook };
