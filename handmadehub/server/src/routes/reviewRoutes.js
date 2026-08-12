// reviewRoutes.js
import express from 'express';
import { createReview, updateReview, deleteReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.put('/:id', protect, updateReview); // NEW
router.delete('/:id', protect, deleteReview); // NEW

export default router;