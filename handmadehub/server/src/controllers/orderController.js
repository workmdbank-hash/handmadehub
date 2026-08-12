// orderController.js
import prisma from '../prisma.js';

// CREATE A NEW ORDER (CHECKOUT)
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, couponCode } = req.body; 
    const userId = req.userId;  

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Update all stock at the same time (much faster!)
    await Promise.all(items.map(item => 
      prisma.product.update({
        where: { id: item.id },
        data: { stock: { decrement: item.quantity } }
      })
    ));

    // If a coupon was used, increase global count AND per-user count
    if (couponCode) {
      const upperCode = couponCode.toUpperCase();
      
      const couponRecord = await prisma.coupon.update({
        where: { code: upperCode },
        data: { timesUsed: { increment: 1 } }
      });

      const existingUsage = await prisma.userCouponUsage.findUnique({
        where: { userId_couponId: { userId: userId, couponId: couponRecord.id } }
      });

      if (existingUsage) {
        await prisma.userCouponUsage.update({
          where: { id: existingUsage.id },
          data: { timesUsed: { increment: 1 } }
        });
      } else {
        await prisma.userCouponUsage.create({
          data: { userId: userId, couponId: couponRecord.id, timesUsed: 1 }
        });
      }
    }

    const order = await prisma.order.create({
      data: {
        userId: userId,
        total: total,
        status: "PAID", 
        shippingAddress: shippingAddress || 'Not provided', 
        items: {
          create: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: { items: true }
    });

    res.status(201).json({ message: "Order created successfully!", order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET USER'S ORDER HISTORY
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await prisma.order.findMany({
      where: { userId: userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET SELLER'S ORDERS
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.userId;

    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: { userId: sellerId }
          }
        }
      },
      include: {
        user: true,
        items: {
          where: {
            product: { userId: sellerId }
          },
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE ORDER STATUS (Seller only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const sellerId = req.userId;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: { include: { product: true } } }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const ownsProduct = order.items.some(item => item.product.userId === sellerId);
    if (!ownsProduct) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.status(200).json({ message: 'Order status updated!', order: updatedOrder });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET ORDER BY ID (For Customer to view receipt)
export const getOrderById = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const userId = req.userId;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: { include: { product: true } },
        user: true 
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Security check: Make sure the person asking for the order is the one who placed it
    if (order.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.log("THE EXACT ERROR IS:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};