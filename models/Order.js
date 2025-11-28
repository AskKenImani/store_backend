const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, default: 'pending' },  // 'pending', 'completed'
});

module.exports = mongoose.model('Order', orderSchema);
