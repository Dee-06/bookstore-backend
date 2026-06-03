const User = require('../models/User');
const Admin = require('../models/admin');
const { AppError } = require('../middleware/errorHandler');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Please provide name, email, and password', 400);
  }

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered', 400);

  const user = await User.create({ name, email, password });
  const token = user.generateToken();

  res.status(201).json({ success: true, token, user: user.toSafeObject() });
};

// @desc    Login — checks Admin collection first, then Users
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // Check Admin collection first
  const admin = await Admin.findOne({ email }).select('+password');
  if (admin) {
    const match = await admin.comparePassword(password);
    if (!match) throw new AppError('Invalid email or password', 401);
    const token = admin.generateToken();
    return res.json({ success: true, token, user: admin.toSafeObject() });
  }

  // Then check Users collection
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = user.generateToken();
  res.json({ success: true, token, user: user.toSafeObject() });
};

// @desc    Get current logged-in user (admin or user)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
};

// @desc    Update profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = async (req, res) => {
  const allowed = ['name', 'phone', 'address'];
  const updates = {};
  allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  // Update the right collection based on role
  const Model = req.user.role === 'admin' ? Admin : User;
  const updated = await Model.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, user: updated.toSafeObject() });
};

module.exports = { register, login, getMe, updateMe };