// adminRoutes.js
import express from 'express';
import { getAllUsers, getAllProductsAdmin, deleteProductAdmin, deleteUserAdmin, updateUserRole, updateSellerApproval } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Get routes
router.get('/users', protect, admin, getAllUsers);
router.get('/products', protect, admin, getAllProductsAdmin);

// Delete routes
router.delete('/products/:id', protect, admin, deleteProductAdmin);
router.delete('/users/:id', protect, admin, deleteUserAdmin);

// Update role route
router.put('/users/:id/role', protect, admin, updateUserRole);

// NEW: Update approval route
router.put('/users/:id/approval', protect, admin, updateSellerApproval);

export default router; 