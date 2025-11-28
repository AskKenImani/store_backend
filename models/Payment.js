const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  paymentMethod: { type: String, required: true },  // 'Stripe'
  paymentStatus: { type: String, required: true },  // 'pending', 'completed'
  paymentDate: { type: Date, default: Date.now },
  receipt: { type: String },  // URL of the receipt
});

module.exports = mongoose.model('Payment', paymentSchema);
