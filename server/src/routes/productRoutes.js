// productRoutes.js
import express from 'express';
import { getProducts, createProduct, getProductById, getCategories, updateProduct, deleteProduct } from '../controllers/productController.js';
import { protect, seller } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// NEW: use upload.array('images', 5) to accept up to 5 images
router.post('/', protect, seller, upload.array('images', 5), createProduct);
router.put('/:id', protect, seller, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, seller, deleteProduct);

export default router;