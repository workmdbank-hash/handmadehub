// sellerController.js
import prisma from '../prisma.js';

// Helper function to ensure seller has a balance record
const ensureBalanceExists = async (sellerId) => {
  let balance = await prisma.sellerBalance.findUnique({ where: { sellerId } });
  if (!balance) {
    balance = await prisma.sellerBalance.create({ data: { sellerId } });
  }
  return balance;
};

// GET SELLER DASHBOARD DATA (Analytics, Balance, Recent Orders)
export const getSellerDashboardData = async (req, res) => {
  try {
    const sellerId = req.userId;

    // 1. Ensure Balance Record Exists
    const balance = await ensureBalanceExists(sellerId);

    // 2. Get Seller's Products
    const products = await prisma.product.findMany({
      where: { userId: sellerId },
      select: { id: true, stock: true }
    });
    const productIds = products.map(p => p.id);
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.stock > 0).length;

    // 3. Get Seller's Order Items
    const orderItems = await prisma.orderItem.findMany({
      where: { productId: { in: productIds } },
      include: { order: true }
    });

    // 4. Calculate Total Sales & Pending Orders
    const totalOrders = await prisma.order.count({
      where: { items: { some: { productId: { in: productIds } } } }
    });

    const pendingOrders = await prisma.order.count({
      where: { 
        items: { some: { productId: { in: productIds } } },
        status: { in: ['PAID', 'PROCESSING'] } 
      }
    });

    // Total Revenue (Sum of price * quantity for all order items)
    const grossRevenue = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // 5. Get Recent Orders (Max 5)
    const recentOrders = await prisma.order.findMany({
      where: { items: { some: { productId: { in: productIds } } } },
      include: { 
        user: { select: { name: true } },
        items: { where: { productId: { in: productIds } }, include: { product: true } } 
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.status(200).json({
      balance: { available: balance.available, pending: balance.pending, withdrawn: balance.withdrawn },
      analytics: {
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        grossRevenue,
        averageOrderValue: totalOrders > 0 ? (grossRevenue / totalOrders).toFixed(2) : 0
      },
      recentOrders
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET SELLER BALANCE & TRANSACTIONS
export const getSellerFinances = async (req, res) => {
  try {
    const sellerId = req.userId;
    const balance = await ensureBalanceExists(sellerId);

    const transactions = await prisma.sellerTransaction.findMany({
      where: { sellerId },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.status(200).json({ balance, transactions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// REQUEST WITHDRAWAL
export const requestWithdrawal = async (req, res) => {
  try {
    const sellerId = req.userId;
    const { amount } = req.body;

    let balance = await prisma.sellerBalance.findUnique({ where: { sellerId } });
    if (!balance) {
      balance = await prisma.sellerBalance.create({ data: { sellerId } });
    }

    // Check if seller has enough available balance
    if (amount > balance.available) {
      return res.status(400).json({ message: 'Insufficient available balance.' });
    }

    // Deduct from available balance
    await prisma.sellerBalance.update({
      where: { sellerId },
      data: { available: { decrement: parseFloat(amount) } }
    });

    // Create Withdrawal Record
    const withdrawal = await prisma.sellerWithdrawal.create({
      data: { sellerId, amount: parseFloat(amount) }
    });

    // Create a Transaction Record
    await prisma.sellerTransaction.create({
      data: { 
        sellerId, 
        type: "WITHDRAWAL", 
        amount: parseFloat(amount), 
        netAmount: parseFloat(amount), 
        status: "PENDING" 
      }
    });

    res.status(201).json(withdrawal);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET SELLER WITHDRAWALS (History)
export const getMyWithdrawals = async (req, res) => {
  try {
    const sellerId = req.userId;
    const withdrawals = await prisma.sellerWithdrawal.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};