// api.js
const API_URL = 'http://localhost:3000/api';

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
    body: JSON.stringify(reviewData)
  });
  if (!response.ok) throw new Error('Failed to submit review');
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