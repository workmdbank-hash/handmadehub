import express from 'express';
import { getMyNotifications, markNotificationsRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMyNotifications);
router.put('/read', protect, markNotificationsRead);

export default router;