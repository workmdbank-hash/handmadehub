// chatRoutes.js
import express from 'express';
import { createConversation, getMyConversations, getConversation, sendMessage, getUnreadCount } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createConversation);
router.get('/', protect, getMyConversations);
router.get('/unread-count', protect, getUnreadCount); // NEW
router.get('/:id', protect, getConversation);
router.post('/:id/messages', protect, sendMessage);

export default router;