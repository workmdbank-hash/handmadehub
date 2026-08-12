// couponController.js
import prisma from '../prisma.js';

// VALIDATE A COUPON CODE
export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.userId; // NEW: Get the logged-in user's ID

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: { userUsage: true } // NEW: Include the usage records
    });

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ message: 'Invalid or expired coupon code' });
    }

    // NEW: Check per-user limit
    if (coupon.usageLimit !== null) {
      // Find if this specific user has used this coupon before
      const userRecord = coupon.userUsage.find(u => u.userId === userId);
      
      if (userRecord && userRecord.timesUsed >= coupon.usageLimit) {
        return res.status(400).json({ message: `You have already used this coupon ${coupon.usageLimit} times.` });
      }
    }

    res.status(200).json({ 
      message: 'Coupon applied successfully!', 
      discountPercent: coupon.discountPercent 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ADMIN: GET ALL COUPONS
export const getCoupons = async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ADMIN: CREATE A COUPON
export const createCoupon = async (req, res) => {
  try {
    const { code, discountPercent, usageLimit } = req.body;
    const newCoupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountPercent: parseFloat(discountPercent),
        usageLimit: usageLimit ? parseInt(usageLimit) : null
      }
    });
    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ADMIN: UPDATE A COUPON
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, discountPercent } = req.body;

    const updatedCoupon = await prisma.coupon.update({
      where: { id: parseInt(id) },
      data: {
        isActive: isActive !== undefined ? isActive : undefined,
        discountPercent: discountPercent ? parseFloat(discountPercent) : undefined
      }
    });

    res.status(200).json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ADMIN: DELETE A COUPON
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const couponId = parseInt(id);

    // NEW: Delete all user usage records for this coupon first!
    await prisma.userCouponUsage.deleteMany({
      where: { couponId: couponId }
    });

    // Now we can safely delete the coupon
    await prisma.coupon.delete({ where: { id: couponId } });
    
    res.status(200).json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};