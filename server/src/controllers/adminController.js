// adminController.js
import prisma from '../prisma.js';

// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { 
        id: true, name: true, email: true, role: true, createdAt: true, isApproved: true,
        phone: true, country: true, city: true, nrc: true, shopAddress: true, shop: true // NEW
      }
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

    // NEW: Perfectly ordered deletion to prevent ALL relational constraint errors
    await prisma.$transaction([
      // 1. Delete Notifications & Messages
      prisma.notification.deleteMany({ where: { userId: userId } }),
      prisma.message.deleteMany({ where: { senderId: userId } }),
      
      // 2. Delete Conversations
      prisma.conversation.deleteMany({ where: { buyerId: userId } }),
      prisma.conversation.deleteMany({ where: { sellerId: userId } }),

      // 3. Delete Seller Reviews (Must happen before Orders)
      prisma.sellerReview.deleteMany({ where: { sellerId: userId } }),
      prisma.sellerReview.deleteMany({ where: { buyerId: userId } }),

      // 4. Delete Product Reviews (Must happen before OrderItems and Products)
      prisma.review.deleteMany({ where: { userId: userId } }),
      prisma.review.deleteMany({ where: { product: { userId: userId } } }),

      // 5. Delete Wishlists (Must happen before Products)
      prisma.wishlist.deleteMany({ where: { userId: userId } }),
      prisma.wishlist.deleteMany({ where: { product: { userId: userId } } }),

      // 6. Delete Seller Financials (Must happen before Orders)
      prisma.sellerWithdrawal.deleteMany({ where: { sellerId: userId } }),
      prisma.sellerTransaction.deleteMany({ where: { sellerId: userId } }),
      prisma.sellerBalance.deleteMany({ where: { sellerId: userId } }),
      prisma.sellerShop.deleteMany({ where: { sellerId: userId } }),

      // 7. Delete Coupon Usage
      prisma.userCouponUsage.deleteMany({ where: { userId: userId } }),

      // 8. Delete Order Items (NOW safe because Reviews are gone)
      prisma.orderItem.deleteMany({ where: { product: { userId: userId } } }),
      prisma.orderItem.deleteMany({ where: { order: { userId: userId } } }),

      // 9. Delete Orders (NOW safe because SellerReviews/Transactions are gone)
      prisma.order.deleteMany({ where: { userId: userId } }),

      // 10. Finally, delete Products and the User
      prisma.product.deleteMany({ where: { userId: userId } }),
      prisma.user.delete({ where: { id: userId } })
    ]);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.log("DELETE USER ERROR:", error); // This will print the exact error in Render logs!
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

// GET ALL WITHDRAWALS (Admin)
export const getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await prisma.sellerWithdrawal.findMany({
      include: { 
        seller: { select: { name: true, email: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE WITHDRAWAL STATUS (Admin)
export const updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "COMPLETED" or "REJECTED"
    const withdrawalId = parseInt(id);

    const withdrawal = await prisma.sellerWithdrawal.findUnique({ where: { id: withdrawalId } });
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });

    // If Admin completes the withdrawal, update the seller's withdrawn total
    if (status === 'COMPLETED') {
      await prisma.sellerBalance.update({
        where: { sellerId: withdrawal.sellerId },
        data: { withdrawn: { increment: withdrawal.amount } }
      });
    } 
    
    // If Admin rejects the withdrawal, give the money back to available balance
    if (status === 'REJECTED') {
      await prisma.sellerBalance.update({
        where: { sellerId: withdrawal.sellerId },
        data: { available: { increment: withdrawal.amount } }
      });
      // Also update the transaction record
      await prisma.sellerTransaction.updateMany({
        where: { 
          sellerId: withdrawal.sellerId, 
          type: 'WITHDRAWAL', 
          amount: withdrawal.amount, 
          status: 'PENDING' 
        },
        data: { status: 'REJECTED' }
      });
    }

    const updatedWithdrawal = await prisma.sellerWithdrawal.update({
      where: { id: withdrawalId },
      data: { status }
    });

    res.status(200).json(updatedWithdrawal);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};