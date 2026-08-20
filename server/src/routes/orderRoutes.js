// orderRoutes.js
import express from 'express';
import { createOrder, getMyOrders, getSellerOrders, updateOrderStatus, getOrderById, getSellerStats, checkReviewEligibility } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/seller-orders', protect, getSellerOrders);
router.get('/seller-stats', protect, getSellerStats);
router.get('/check-review-eligibility/:productId', protect, checkReviewEligibility); // NEW
router.put('/:id/status', protect, updateOrderStatus);
router.get('/:id', protect, getOrderById);

export default router;