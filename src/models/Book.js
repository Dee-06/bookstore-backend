const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: [150, 'Author name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['fiction', 'non-fiction', 'academic', 'local', 'children', 'business', 'other'],
        message: '{VALUE} is not a valid category',
      },
      lowercase: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
    // E-book specific fields
    downloadUrl: {
      type: String,
      default: '', // URL to PDF/EPUB file — only exposed to user after purchase
    },
    fileFormat: {
      type: String,
      enum: ['PDF', 'EPUB', 'MOBI', ''],
      default: 'PDF',
    },
    pages: {
      type: Number,
      min: 1,
    },
    isbn: {
      type: String,
      trim: true,
      default: '',
    },
    publisher: {
      type: String,
      trim: true,
      default: '',
    },
    year: {
      type: Number,
      min: 1000,
      max: new Date().getFullYear() + 1,
    },
    // stock: {
    //   type: Number,
    //   required: [true, 'Stock quantity is required'],
    //   min: [0, 'Stock cannot be negative'],
    //   default: 0,
    // },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for full-text search
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
// Index for common queries
bookSchema.index({ category: 1, createdAt: -1 });
bookSchema.index({ price: 1 });

module.exports = mongoose.model('Book', bookSchema);
