// reviewController.js
import prisma from '../prisma.js';

// CREATE A REVIEW (Verified Purchase Only)
export const createReview = async (req, res) => {
  try {
    const { rating, comment, productId, orderItemId } = req.body;
    const userId = req.userId;

    const orderItem = await prisma.orderItem.findFirst({
      where: { id: parseInt(orderItemId), productId: parseInt(productId), order: { userId: userId, status: 'DELIVERED' } }
    });

    if (!orderItem) return res.status(403).json({ message: 'You can only review products you have purchased and received.' });

    const existingReview = await prisma.review.findUnique({ where: { orderItemId: parseInt(orderItemId) } });
    if (existingReview) return res.status(400).json({ message: 'You have already reviewed this product.' });

    const review = await prisma.review.create({
      data: { rating: parseInt(rating), comment, productId: parseInt(productId), userId, orderItemId: parseInt(orderItemId) },
      include: { user: true }
    });

    // NEW: Notify the seller
    const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
    if (product) {
      await prisma.notification.create({
        data: { 
          userId: product.userId, 
          message: `⭐ Your product (${product.name}) received a new review!`,
          type: "REVIEW",
          link: `/product/${product.id}`
        }
      });
    }

    res.status(201).json({ message: 'Review added!', review });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CREATE A SELLER REVIEW
export const createSellerReview = async (req, res) => {
  try {
    const { orderId, sellerId, rating, comment } = req.body;
    const buyerId = req.userId;

    const order = await prisma.order.findFirst({ where: { id: parseInt(orderId), userId: buyerId, status: 'DELIVERED' } });
    if (!order) return res.status(403).json({ message: 'You can only review sellers after your order is delivered.' });

    const existingReview = await prisma.sellerReview.findUnique({ where: { orderId: parseInt(orderId) } });
    if (existingReview) return res.status(400).json({ message: 'You have already reviewed this seller for this order.' });

    const review = await prisma.sellerReview.create({
      data: { rating: parseInt(rating), comment, sellerId: parseInt(sellerId), buyerId: buyerId, orderId: parseInt(orderId) },
      include: { buyer: true }
    });

    // NEW: Notify the seller
    await prisma.notification.create({
      data: { 
        userId: parseInt(sellerId), 
        message: `🏆 You received a new seller rating!`,
        type: "REVIEW",
        link: `/seller/${sellerId}`
      }
    });

    res.status(201).json({ message: 'Seller review added!', review });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET SELLER REVIEWS & RATING
export const getSellerReviews = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const reviews = await prisma.sellerReview.findMany({
      where: { sellerId: parseInt(sellerId) },
      include: { buyer: true },
      orderBy: { createdAt: 'desc' }
    });

    let averageRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      averageRating = (sum / reviews.length).toFixed(1);
    }

    res.status(200).json({ reviews, averageRating, totalReviews: reviews.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE A REVIEW
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.userId;

    const review = await prisma.review.findUnique({ where: { id: parseInt(id) } });
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userId !== userId) return res.status(403).json({ message: 'Not authorized to edit this review' });

    const updatedReview = await prisma.review.update({
      where: { id: parseInt(id) },
      data: { rating: parseInt(rating), comment },
      include: { user: true }
    });

    res.status(200).json({ message: 'Review updated!', review: updatedReview });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE A REVIEW
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const review = await prisma.review.findUnique({ where: { id: parseInt(id) } });
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userId !== userId) return res.status(403).json({ message: 'Not authorized to delete this review' });

    await prisma.review.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};