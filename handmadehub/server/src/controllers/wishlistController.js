// wishlistController.js
import prisma from '../prisma.js';

// ADD TO WISHLIST
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.userId;

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId,
        productId: parseInt(productId)
      }
    });

    res.status(201).json({ message: 'Added to wishlist!', wishlistItem });
  } catch (error) {
    // If it's already in the wishlist, Prisma throws an error. We just ignore it.
    if (error.code === 'P2002') {
      return res.status(200).json({ message: 'Already in wishlist' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET MY WISHLIST
export const getMyWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: { product: true }
    });

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// REMOVE FROM WISHLIST
export const removeFromWishlist = async (req, res) => {
  try {
    const wishlistId = parseInt(req.params.id);
    
    await prisma.wishlist.delete({
      where: { id: wishlistId }
    });

    res.status(200).json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};