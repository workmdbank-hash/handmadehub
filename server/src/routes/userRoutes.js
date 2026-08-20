// userRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { updateProfileImage, getSellerProfile } from '../controllers/userController.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public route to view a seller's profile
router.get('/:id', getSellerProfile);

// Protected route to update own profile image
router.put('/profile', protect, upload.single('image'), updateProfileImage);

export default router;