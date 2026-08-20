// chatController.js
import prisma from '../prisma.js';

// 1. CREATE OR GET CONVERSATION
export const createConversation = async (req, res) => {
  try {
    const { sellerId, productId } = req.body;
    const buyerId = req.userId;

    // Prevent chatting with yourself
    if (buyerId === parseInt(sellerId)) {
      return res.status(400).json({ message: 'Cannot chat with yourself' });
    }

    // NEW: Check if a conversation ALREADY EXISTS between this buyer and seller
    let conversation = await prisma.conversation.findFirst({
      where: { buyerId, sellerId: parseInt(sellerId) }
    });

    // If it doesn't exist, create a new one
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { buyerId, sellerId: parseInt(sellerId), productId: parseInt(productId) }
      });
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 2. GET ALL CONVERSATIONS FOR LOGGED IN USER
export const getMyConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      },
      include: {
        buyer: { select: { id: true, name: true, profileImage: true } },
        seller: { select: { id: true, name: true, profileImage: true } },
        product: { select: { id: true, name: true, images: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Get only the last message for preview
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 3. GET SINGLE CONVERSATION & MESSAGES
export const getConversation = async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    const userId = req.userId;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        buyer: { select: { id: true, name: true, profileImage: true } },
        seller: { select: { id: true, name: true, profileImage: true } },
        product: { select: { id: true, name: true, images: true } },
        messages: { orderBy: { createdAt: 'asc' } }
      }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Security: Only buyer or seller can view
    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Mark messages from the other person as read
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 4. SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    const userId = req.userId;
    const { message } = req.body;

    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Security: Only buyer or seller can send message
    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const newMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        message
      }
    });

    // Update conversation timestamp for sorting
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET UNREAD MESSAGE COUNT
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;

    const count = await prisma.message.count({
      where: {
        isRead: false,
        senderId: { not: userId },
        conversation: {
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        }
      }
    });

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};