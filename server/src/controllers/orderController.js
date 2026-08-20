// orderController.js
import prisma from '../prisma.js';

// CREATE A NEW ORDER (CHECKOUT)
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, couponCode } = req.body; 
    const userId = req.userId;  

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 1. Subtract stock
    await Promise.all(items.map(item => 
      prisma.product.update({
        where: { id: item.id },
        data: { stock: { decrement: item.quantity } }
      })
    ));

    // 2. Handle Coupon (if exists)
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

    // 3. Create the Order
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

    // 4. NEW: Calculate Seller Earnings & Update Balances
    // Get unique product IDs from the order
    const productIds = [...new Set(order.items.map(item => item.productId))];
    // Fetch products to find their sellers
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    // Get unique seller IDs
    const uniqueSellerIds = [...new Set(products.map(p => p.userId))];
    
    for (const sellerId of uniqueSellerIds) {
      // Find items belonging to THIS specific seller
      const sellerItems = order.items.filter(item => 
        products.find(p => p.id === item.productId && p.userId === sellerId)
      );
      
      // Calculate gross revenue for this seller from this order
      const grossAmount = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Calculate 5% commission
      const commission = grossAmount * 0.05;
      const netAmount = grossAmount - commission;

      // Create a Transaction Record
      await prisma.sellerTransaction.create({
        data: {
          sellerId,
          orderId: order.id,
          type: "SALE",
          amount: grossAmount,
          commission,
          netAmount,
          status: "COMPLETED"
        }
      });

      // Update Seller Balance (Money goes to PENDING until delivered)
      let balance = await prisma.sellerBalance.findUnique({ where: { sellerId } });
      if (!balance) {
        balance = await prisma.sellerBalance.create({ data: { sellerId } });
      }
      
      await prisma.sellerBalance.update({
        where: { sellerId },
        data: { pending: { increment: netAmount } }
      });
    }

    // 5. Notify the seller(s) about the new order
    for (const sellerId of uniqueSellerIds) {
      await prisma.notification.create({
        data: { 
          userId: sellerId, 
          message: `🎉 You received a new order! (Order #${order.id})`,
          type: "ORDER_SELLER", 
          link: "/seller-orders" 
        }
      });
    }

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

    // NEW: If status is DELIVERED, move money from Pending to Available
    if (status === 'DELIVERED' && order.status !== 'DELIVERED') {
      console.log("Order is being marked as DELIVERED. Moving funds...");
      
      const transaction = await prisma.sellerTransaction.findFirst({
        where: { orderId: order.id, sellerId: sellerId }
      });

      console.log("Transaction found:", transaction);

      if (transaction && transaction.netAmount > 0) {
        let balance = await prisma.sellerBalance.findUnique({ where: { sellerId } });
        if (!balance) {
          balance = await prisma.sellerBalance.create({ data: { sellerId } });
        }

        // Move money from Pending to Available
        await prisma.sellerBalance.update({
          where: { sellerId },
          data: {
            pending: { decrement: transaction.netAmount },
            available: { increment: transaction.netAmount }
          }
        });
        console.log("Balance updated successfully!");
      } else {
        console.log("No transaction found or netAmount is 0. Money was not moved.");
      }
    }

    // Notify the buyer about the status update
    await prisma.notification.create({
      data: { 
        userId: order.userId, 
        message: `📦 Your order #${order.id} status was updated to ${status}!`,
        type: "ORDER_BUYER", 
        link: "/myorders" 
      }
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

    if (order.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.log("THE EXACT ERROR IS:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET SELLER STATISTICS (Total Revenue, Orders, etc.)
export const getSellerStats = async (req, res) => {
  try {
    const sellerId = req.userId;

    const products = await prisma.product.findMany({
      where: { userId: sellerId },
      select: { id: true, stock: true }
    });

    const productIds = products.map(p => p.id);
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.stock > 0).length;

    const orderItems = await prisma.orderItem.findMany({
      where: { productId: { in: productIds } },
      include: { order: true }
    });

    const totalOrders = await prisma.order.count({
      where: { items: { some: { productId: { in: productIds } } } }
    });

    const pendingOrders = await prisma.order.count({
      where: { 
        items: { some: { productId: { in: productIds } } },
        status: 'PAID' 
      }
    });

    const completedOrders = await prisma.order.count({
      where: { 
        items: { some: { productId: { in: productIds } } },
        status: 'DELIVERED' 
      }
    });

    const totalRevenue = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.status(200).json({
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CHECK IF USER CAN REVIEW THIS PRODUCT
export const checkReviewEligibility = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userId;

    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId: parseInt(productId),
        order: {
          userId: userId,
          status: 'DELIVERED'
        },
        review: null
      },
      select: { id: true }
    });

    if (orderItem) {
      return res.status(200).json({ eligible: true, orderItemId: orderItem.id });
    }

    res.status(200).json({ eligible: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};