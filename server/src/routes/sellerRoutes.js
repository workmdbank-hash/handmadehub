// sellerRoutes.js
import express from 'express';
import { getSellerDashboardData, getSellerFinances, requestWithdrawal, getMyWithdrawals } from '../controllers/sellerController.js';
import { protect, seller } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require login AND seller/admin role
router.get('/dashboard', protect, seller, getSellerDashboardData);
router.get('/finances', protect, seller, getSellerFinances);

// NEW: Withdrawal Routes
router.post('/withdrawal', protect, seller, requestWithdrawal);
router.get('/withdrawals', protect, seller, getMyWithdrawals);

export default router;