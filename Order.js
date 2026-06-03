const mongoose = require('mongoose');
 
const orderItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true, // price at time of purchase (snapshot)
  },
});
 
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'Order must have at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentReference: {
      type: String,
      default: '',
    },
    deliveryDetails: {
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);
 
// Index for user order history
orderSchema.index({ user: 1, createdAt: -1 });
 
module.exports = mongoose.model('Order', orderSchema);
 