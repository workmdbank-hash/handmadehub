// This automatically detects if you are on localhost (PC) or an IP address (Phone)!
const API_URL = `http://${window.location.hostname}:3000/api`;

// ==========================================
// PRODUCT FUNCTIONS
// ==========================================
export const getProducts = async (searchTerm = '', category = '', sort = '') => {
  let url = `${API_URL}/products?`;
  
  if (searchTerm) url += `search=${searchTerm}&`;
  if (category && category !== 'All') url += `category=${category}&`;
  if (sort) url += `sort=${sort}&`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
};

export const getProductById = async (id) => {
  const response = await fetch(`${API_URL}/products/${id}`);
  if (!response.ok) throw new Error('Failed to fetch product');
  return response.json();
};

export const getCategories = async () => {
  const response = await fetch(`${API_URL}/products/categories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
};

export const createProduct = async (formData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('You must be logged in to create a product');

  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  if (!response.ok) throw new Error('Failed to create product');
  return response.json();
};

export const updateProduct = async (id, formData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  if (!response.ok) throw new Error('Failed to update product');
  return response.json();
};

export const deleteProduct = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to delete product');
  return response.json();
};

// ==========================================
// AUTH & USER FUNCTIONS
// ==========================================
export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!response.ok) throw new Error('Registration failed');
  return response.json();
};

export const loginUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
};

export const updateProfileImage = async (formData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('You must be logged in');

  const response = await fetch(`${API_URL}/users/profile`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  if (!response.ok) throw new Error('Failed to update profile image');
  return response.json();
};

export const getSellerProfile = async (id) => {
  const response = await fetch(`${API_URL}/users/${id}`);
  if (!response.ok) throw new Error('Failed to fetch seller profile');
  return response.json();
};

// ==========================================
// CART & CHECKOUT FUNCTIONS
// ==========================================
export const checkoutCart = async (items, shippingAddress, couponCode) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('You must be logged in to checkout');

  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ items, shippingAddress, couponCode })
  });
  if (!response.ok) throw new Error('Checkout failed');
  return response.json();
};

export const validateCoupon = async (code) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/coupons/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ code })
  });
  if (!response.ok) throw new Error('Invalid coupon code');
  return response.json();
};

// ==========================================
// ORDER FUNCTIONS
// ==========================================
export const getMyOrders = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/orders/myorders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
};

export const getSellerOrders = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/orders/seller-orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch seller orders');
  return response.json();
};

export const updateOrderStatus = async (orderId, status) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update status');
  return response.json();
};

// ==========================================
// REVIEW FUNCTIONS
// ==========================================
export const createReview = async (reviewData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('You must be logged in to review');

  const response = await fetch(`${API_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(reviewData) // Now includes orderItemId
  });
  
  // NEW: Handle the specific 403/400 errors from the backend
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to submit review');
  }
  return response.json();
};

export const updateReview = async (id, reviewData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/reviews/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(reviewData)
  });
  if (!response.ok) throw new Error('Failed to update review');
  return response.json();
};

export const deleteReview = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/reviews/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to delete review');
  return response.json();
};

// ==========================================
// WISHLIST FUNCTIONS
// ==========================================
export const addToWishlist = async (productId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/wishlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ productId })
  });
  if (!response.ok) throw new Error('Failed to add to wishlist');
  return response.json();
};

export const getMyWishlist = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/wishlist`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch wishlist');
  return response.json();
};

export const removeFromWishlist = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/wishlist/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to remove from wishlist');
  return response.json();
};

// ==========================================
// ADMIN FUNCTIONS
// ==========================================
export const getAdminUsers = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/admin/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const getAdminProducts = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/admin/products`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
};

export const deleteProductAdmin = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/admin/products/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to delete product');
  return response.json();
};

export const deleteUserAdmin = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/admin/users/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to delete user');
  return response.json();
};

export const updateUserRole = async (id, role) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/admin/users/${id}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ role })
  });
  if (!response.ok) throw new Error('Failed to update role');
  return response.json();
};

export const updateSellerApproval = async (id, isApproved) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/admin/users/${id}/approval`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ isApproved })
  });
  if (!response.ok) throw new Error('Failed to update approval');
  return response.json();
};

export const getAdminCoupons = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/coupons`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch coupons');
  return response.json();
};

export const createAdminCoupon = async (couponData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/coupons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(couponData)
  });
  if (!response.ok) throw new Error('Failed to create coupon');
  return response.json();
};

export const updateAdminCoupon = async (id, couponData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/coupons/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(couponData)
  });
  if (!response.ok) throw new Error('Failed to update coupon');
  return response.json();
};

export const deleteAdminCoupon = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/coupons/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to delete coupon');
  return response.json();
};

// NEW: Get single order details by ID
export const getOrderById = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/orders/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch order details');
  return response.json();
};

// NEW: Get Seller Statistics
export const getSellerStats = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/orders/seller-stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch seller stats');
  return response.json();
};

// NEW: Check if user can review this product
export const checkReviewEligibility = async (productId) => {
  const token = localStorage.getItem('token');
  if (!token) return { eligible: false };
  
  const response = await fetch(`${API_URL}/orders/check-review-eligibility/${productId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) return { eligible: false };
  return response.json();
};

// NEW: Create seller review
export const createSellerReview = async (reviewData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/reviews/seller`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(reviewData)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to submit seller review');
  }
  return response.json();
};

// NEW: Get seller reviews and rating
export const getSellerReviews = async (sellerId) => {
  const response = await fetch(`${API_URL}/reviews/seller/${sellerId}`);
  if (!response.ok) throw new Error('Failed to fetch seller reviews');
  return response.json();
};

// ==========================================
// CHAT FUNCTIONS
// ==========================================

// 1. Create or get a conversation
export const createConversation = async (sellerId, productId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ sellerId, productId })
  });
  if (!response.ok) throw new Error('Failed to start conversation');
  return response.json();
};

// 2. Get all conversations for the inbox
export const getMyConversations = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conversations`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch conversations');
  return response.json();
};

// 3. Get single conversation and its messages
export const getConversation = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conversations/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch messages');
  return response.json();
};

// 4. Send a message
export const sendMessage = async (conversationId, message) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message })
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
};

// NEW: Get unread message count
export const getUnreadCount = async () => {
  const token = localStorage.getItem('token');
  if (!token) return { count: 0 };
  const response = await fetch(`${API_URL}/conversations/unread-count`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) return { count: 0 };
  return response.json();
};

// ==========================================
// NOTIFICATION FUNCTIONS
// ==========================================
export const getMyNotifications = async () => {
  const token = localStorage.getItem('token');
  if (!token) return [];
  const response = await fetch(`${API_URL}/notifications`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch notifications');
  return response.json();
};

export const markNotificationsRead = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/notifications/read`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to mark notifications as read');
  return response.json();
};

// ==========================================
// SELLER DASHBOARD & FINANCE FUNCTIONS
// ==========================================
export const getSellerDashboardData = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/seller/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch dashboard data');
  return response.json();
};

export const getSellerFinances = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/seller/finances`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch finances');
  return response.json();
};

// ==========================================
// SHOP FUNCTIONS
// ==========================================
export const createOrUpdateShop = async (shopData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/shops`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}` // No Content-Type here! Browser sets it for FormData.
    },
    body: shopData // Sending FormData directly
  });
  if (!response.ok) throw new Error('Failed to save shop');
  return response.json();
};

export const getMyShop = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/shops/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch shop');
  return response.json();
};

export const getPublicShop = async (slug) => {
  const response = await fetch(`${API_URL}/shops/${slug}`);
  if (!response.ok) throw new Error('Shop not found');
  return response.json();
};

// NEW: Seller Withdrawal Functions
export const requestWithdrawal = async (amount) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/seller/withdrawal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ amount })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to request withdrawal');
  }
  return response.json();
};

export const getMyWithdrawals = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/seller/withdrawals`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch withdrawals');
  return response.json();
};

// NEW: Admin Withdrawal Functions
export const getAdminWithdrawals = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/admin/withdrawals`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch withdrawals');
  return response.json();
};

export const updateAdminWithdrawalStatus = async (id, status) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/admin/withdrawals/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update withdrawal status');
  return response.json();
};