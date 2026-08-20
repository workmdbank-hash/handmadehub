// adminRoutes.js
import express from 'express';
import { 
  getAllUsers, getAllProductsAdmin, deleteProductAdmin, deleteUserAdmin, 
  updateUserRole, updateSellerApproval,
  getWithdrawals, updateWithdrawalStatus // NEW
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Get routes
router.get('/users', protect, admin, getAllUsers);
router.get('/products', protect, admin, getAllProductsAdmin);
router.get('/withdrawals', protect, admin, getWithdrawals); // NEW

// Delete routes
router.delete('/products/:id', protect, admin, deleteProductAdmin);
router.delete('/users/:id', protect, admin, deleteUserAdmin);

// Update role/approval routes
router.put('/users/:id/role', protect, admin, updateUserRole);
router.put('/users/:id/approval', protect, admin, updateSellerApproval);

// NEW: Update withdrawal status
router.put('/withdrawals/:id', protect, admin, updateWithdrawalStatus);

export default router;