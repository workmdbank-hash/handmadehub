// orderRoutes.js
import express from 'express';
import { createOrder, getMyOrders, getSellerOrders, updateOrderStatus, getOrderById } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/seller-orders', protect, getSellerOrders);
router.put('/:id/status', protect, updateOrderStatus);

// NEW: Get single order details (MUST be at the bottom!)
router.get('/:id', protect, getOrderById);

export default router;