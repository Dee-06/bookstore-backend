const https = require('https');
const Order = require('../models/Order');
const Book = require('../models/Book');
const { AppError } = require('../middleware/errorHandler');

// Helper: call Paystack API
const paystackRequest = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path,
      method,
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Failed to parse Paystack response')); }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

// @desc    Initiate Paystack payment for an order
// @route   POST /api/payment/initiate
// @access  Private
const initiatePayment = async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId).populate('user', 'name email');
  if (!order) throw new AppError('Order not found', 404);

  // Make sure it belongs to this user
  if (order.user._id.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  if (order.paymentStatus === 'paid') {
    throw new AppError('This order has already been paid', 400);
  }

  // Paystack expects amount in kobo (multiply naira by 100)
  const amountInKobo = Math.round(order.totalAmount * 100);

  const callbackUrl = `${process.env.FRONTEND_URL}/payment/callback`;

  const paystackRes = await paystackRequest('POST', '/transaction/initialize', {
    email: order.user.email,
    amount: amountInKobo,
    reference: `BH-${order._id}-${Date.now()}`,
    callback_url: callbackUrl,
    metadata: {
      orderId: order._id.toString(),
      customerName: order.user.name,
      cancel_action: `${process.env.FRONTEND_URL}/cart`,
    },
  });

  if (!paystackRes.status) {
    throw new AppError(paystackRes.message || 'Payment initiation failed', 502);
  }

  // Save reference on the order
  order.paymentReference = paystackRes.data.reference;
  await order.save();

  res.json({
    success: true,
    authorizationUrl: paystackRes.data.authorization_url,
    reference: paystackRes.data.reference,
  });
};

// @desc    Verify Paystack payment after redirect
// @route   GET /api/payment/verify/:reference
// @access  Private
const verifyPayment = async (req, res) => {
  const { reference } = req.params;

  const paystackRes = await paystackRequest('GET', `/transaction/verify/${encodeURIComponent(reference)}`);

  if (!paystackRes.status || paystackRes.data.status !== 'success') {
    return res.json({ success: false, status: 'failed', message: 'Payment not successful' });
  }

  // Find order by reference
  const order = await Order.findOne({ paymentReference: reference });
  if (!order) throw new AppError('Order not found for this payment reference', 404);

  // Idempotent — don't process twice
  if (order.paymentStatus === 'paid') {
    return res.json({ success: true, status: 'success', order });
  }

  // Mark order as paid and reduce stock
  order.paymentStatus = 'paid';
  order.status = 'paid';
  await order.save();

  // Deduct stock for each book
  // for (const item of order.items) {
  //   await Book.findByIdAndUpdate(item.book, { $inc: { stock: -item.quantity } });
  // }

  res.json({ success: true, status: 'success', order });
};

module.exports = { initiatePayment, verifyPayment };
