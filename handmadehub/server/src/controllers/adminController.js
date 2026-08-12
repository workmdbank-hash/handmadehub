// adminController.js
import prisma from '../prisma.js';

// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true, isApproved: true } // NEW: isApproved
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET ALL PRODUCTS (Admin view)
export const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { user: true } // include who sells it
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE A PRODUCT (Admin)
export const deleteProductAdmin = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    // NEW: Clean up related data before deleting the product
    await prisma.$transaction([
      prisma.review.deleteMany({ where: { productId: productId } }),
      prisma.wishlist.deleteMany({ where: { productId: productId } }),
      // Note: We don't delete OrderItems because we want to keep historical order records intact, 
      // but Prisma will allow deleting the product if we handle the relations. 
      // Actually, if OrderItem has a required relation, we must delete it. Let's delete them to be safe:
      prisma.orderItem.deleteMany({ where: { productId: productId } }),
      prisma.product.delete({ where: { id: productId } })
    ]);

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE A USER (Admin)
export const deleteUserAdmin = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // We must delete in a specific order so the database doesn't complain!
    await prisma.$transaction([
      // 1. Delete Order Items where the product belongs to this user (seller)
      prisma.orderItem.deleteMany({ where: { product: { userId: userId } } }),
      // 2. Delete Order Items where the order belongs to this user (buyer)
      prisma.orderItem.deleteMany({ where: { order: { userId: userId } } }),
      // 3. NOW we can delete the user's Orders safely
      prisma.order.deleteMany({ where: { userId: userId } }),
      // 4. Delete Reviews written by this user
      prisma.review.deleteMany({ where: { userId: userId } }),
      // 5. Delete Reviews on products created by this user
      prisma.review.deleteMany({ where: { product: { userId: userId } } }),
      // 6. Delete Wishlists belonging to this user
      prisma.wishlist.deleteMany({ where: { userId: userId } }),
      // 7. Delete Wishlist items for products created by this user
      prisma.wishlist.deleteMany({ where: { product: { userId: userId } } }),
      // 8. Delete the products the user created
      prisma.product.deleteMany({ where: { userId: userId } }),
      // 9. FINALLY, delete the user
      prisma.user.delete({ where: { id: userId } })
    ]);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE USER ROLE (Admin)
export const updateUserRole = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body; // "ADMIN" or "CUSTOMER"

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    res.status(200).json({ message: 'User role updated!', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE SELLER APPROVAL (Admin)
export const updateSellerApproval = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { isApproved } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isApproved }
    });

    res.status(200).json({ message: 'Seller approval updated!', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};