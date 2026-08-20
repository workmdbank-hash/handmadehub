// userController.js
import prisma from '../prisma.js';

// UPDATE USER PROFILE IMAGE
export const updateProfileImage = async (req, res) => {
  try {
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const profileImage = `/images/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profileImage }
    });

    res.status(200).json({ 
      message: 'Profile image updated successfully!', 
      profileImage: updatedUser.profileImage 
    });
  } catch (error) {
    console.log("THE EXACT ERROR IS:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET SELLER PROFILE BY ID
export const getSellerProfile = async (req, res) => {
  try {
    const sellerId = parseInt(req.params.id); // THIS LINE WAS MISSING!

    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        profileImage: true,
        products: true,
        shop: true // Include Shop Info
      }
    });

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    res.status(200).json(seller);
  } catch (error) {
    console.log("GET SELLER PROFILE ERROR:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};