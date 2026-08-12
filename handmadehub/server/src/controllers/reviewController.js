// reviewController.js
import prisma from '../prisma.js';

// CREATE A REVIEW
export const createReview = async (req, res) => {
  try {
    const { rating, comment, productId } = req.body;
    const userId = req.userId; // from authMiddleware

    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment,
        productId: parseInt(productId),
        userId
      },
      include: { user: true } // include user name so we can show who wrote it
    });

    res.status(201).json({ message: 'Review added!', review });
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

    // Find the review
    const review = await prisma.review.findUnique({ where: { id: parseInt(id) } });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Security check: Make sure the user editing it is the one who wrote it
    if (review.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

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
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await prisma.review.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};