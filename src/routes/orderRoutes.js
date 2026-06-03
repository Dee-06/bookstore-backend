const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// All order routes require authentication
router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);      // must be before /:id
router.get('/:id', getOrder);

// Admin only
router.get('/', adminOnly, getAllOrders);
router.put('/:id/status', adminOnly, updateOrderStatus);

module.exports = router;
