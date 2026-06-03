const Order = require('../models/Order');
const Book = require('../models/Book');
const { AppError } = require('../middleware/errorHandler');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  const { items, deliveryDetails } = req.body;

  if (!items || items.length === 0) {
    throw new AppError('Order must contain at least one item', 400);
  }

  // Validate books exist and calculate total from DB prices (don't trust client)
  let totalAmount = 0;
  const validatedItems = [];

  for (const item of items) {
    const book = await Book.findById(item.book);
    if (!book) throw new AppError(`Book not found: ${item.book}`, 404);
    if (book.stock < item.quantity) {
      throw new AppError(`Insufficient stock for "${book.title}". Available: ${book.stock}`, 400);
    }

    validatedItems.push({
      book: book._id,
      quantity: item.quantity,
      price: book.price, // always use server-side price
      downloadUrl: book.downloadUrl || '', // snapshot download URL at purchase time
    });
    totalAmount += book.price * item.quantity;
  }

  const order = await Order.create({
    user: req.user._id,
    items: validatedItems,
    totalAmount,
    status: 'pending',
  });

  // Populate book details for the response
  await order.populate('items.book', 'title author coverImage fileFormat');

  res.status(201).json({ success: true, order });
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.book', 'title author coverImage price fileFormat')
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
};

// @desc    Get single order by ID (owner or admin)
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.book', 'title author coverImage price fileFormat')
    .populate('user', 'name email');

  if (!order) throw new AppError('Order not found', 404);

  // Only the owner or an admin can view
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to view this order', 403);
  }

  res.json({ success: true, order });
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = status ? { status } : {};
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .populate('items.book', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Order.countDocuments(query),
  ]);

  res.json({ success: true, orders, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'paid', 'cancelled', 'refunded'];

  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate('user', 'name email');

  if (!order) throw new AppError('Order not found', 404);

  // If cancelled, restore stock
  // if (status === 'cancelled') {
  //   for (const item of order.items) {
  //     await Book.findByIdAndUpdate(item.book, { $inc: { stock: item.quantity } });
  //   }
  // }

  res.json({ success: true, order });
};

module.exports = { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus };
