const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// Function to add a product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, uploadedBy } = req.body;
    
    // Handling image upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    const product = new Product({
      name,
      description,
      price,
      category,
      imageUrl: result.secure_url,
      uploadedBy,
    });

    await product.save();
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Error adding product', error: err.message });
  }
};

// Function to get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
};

// Function to update a product
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const productId = req.params.id;

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If a new image is uploaded, handle image update
    let imageUrl = product.imageUrl;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }

    // Update product details
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.imageUrl = imageUrl;

    // Save the updated product
    await product.save();

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
};

// Function to delete a product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete the product
    await product.remove();

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
};

module.exports = { addProduct, getProducts, updateProduct, deleteProduct };
