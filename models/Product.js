const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String },  // URL from Cloudinary
  uploadedBy: { type: String, required: true },  // User name of who uploaded
});

module.exports = mongoose.model('Product', productSchema);
