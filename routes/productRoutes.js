const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');
const router = express.Router();

router.post('/add', authMiddleware, productController.addProduct);
router.get('/', productController.getProducts);
router.put('/:id', authMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);

module.exports = router;
