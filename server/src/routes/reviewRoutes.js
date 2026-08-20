// reviewRoutes.js
import express from 'express';
import { createReview, updateReview, deleteReview, createSellerReview, getSellerReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Product Reviews
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

// NEW: Seller Reviews
router.post('/seller', protect, createSellerReview);
router.get('/seller/:sellerId', getSellerReviews);

export default router;