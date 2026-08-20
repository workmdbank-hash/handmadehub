// CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { checkoutCart } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // NEW: Initialize state from localStorage, or start empty
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  // NEW: Save cart to localStorage every time it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const addToCart = (product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error(`Cannot add more. Only ${product.stock} left in stock!`);
        return;
      }
      setCartItems(
        cartItems.map((item) => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      if (product.stock <= 0) {
        toast.error("Sorry, this item is out of stock!");
        return;
      }
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
    toast.success(`${product.name} added to cart!`); 
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => item.id !== productId));
    toast.info("Item removed from cart"); 
  };

  const updateQuantity = (productId, newQuantity) => {
    const item = cartItems.find((i) => i.id === productId);
    if (!item) return;

    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else if (newQuantity > item.stock) {
      toast.error(`Cannot add more. Only ${item.stock} left in stock!`);
    } else {
      setCartItems(
        cartItems.map((i) => 
          i.id === productId ? { ...i, quantity: newQuantity } : i
        )
      );
    }
  };

  const handleCheckout = async (address, couponCode) => {
    try {
      await checkoutCart(cartItems, address, couponCode);
      setCartItems([]); // Empties the state
      localStorage.removeItem('cartItems'); // NEW: Empties the local storage
      setIsCartOpen(false); 
      toast.success("Order placed successfully!"); 
      return true; 
    } catch (error) {
      console.error(error);
      toast.error("Checkout failed. Are you logged in?"); 
      return false; 
    }
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, cartTotal, isCartOpen, toggleCart, handleCheckout }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};