// shopRoutes.js
import express from 'express';
import { upsertShop, getMyShop, getPublicShop } from '../controllers/shopController.js';
import { protect, seller } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Protected routes (Seller only) - NEW: Added upload.fields for logo and banner
router.post('/', protect, seller, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), upsertShop);
router.get('/me', protect, seller, getMyShop);

// Public route (Anyone can view a shop)
router.get('/:slug', getPublicShop);

export default router;