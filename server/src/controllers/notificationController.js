import prisma from '../prisma.js';

// GET USER NOTIFICATIONS (with counts by type)
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 15
    });

    // Calculate unread counts for specific types
    const unreadCounts = {
      total: notifications.filter(n => !n.isRead).length,
      ORDER_SELLER: notifications.filter(n => !n.isRead && n.type === 'ORDER_SELLER').length,
      ORDER_BUYER: notifications.filter(n => !n.isRead && n.type === 'ORDER_BUYER').length,
      REVIEW: notifications.filter(n => !n.isRead && n.type === 'REVIEW').length,
    };

    res.status(200).json({ notifications, unreadCounts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// MARK ALL NOTIFICATIONS AS READ
export const markNotificationsRead = async (req, res) => {
  try {
    const userId = req.userId;
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};