const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');

const router = express.Router();

// Add a new product
router.post('/add', authMiddleware, productController.addProduct);

// Get all products
router.get('/', productController.getProducts);

// Get a product by ID
router.get('/:id', productController.getProductById);

// Update a product by ID
router.put('/:id', authMiddleware, productController.updateProduct);

// Delete a product by ID
router.delete('/:id', authMiddleware, productController.deleteProduct);

module.exports = router;
