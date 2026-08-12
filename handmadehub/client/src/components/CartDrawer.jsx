// CartDrawer.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function CartDrawer() {
  const { cartItems, isCartOpen, toggleCart, removeFromCart, updateQuantity, cartTotal, handleCheckout } = useCart();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const onCheckoutClick = async () => {
    setIsProcessing(true);
    if (!phone.trim() || !address.trim()) {
      alert('Please enter both your phone number and shipping address.');
      setIsProcessing(false);
      return;
    }
    const fullShippingInfo = `Phone: ${phone} | Address: ${address}`;
    const success = await handleCheckout(fullShippingInfo, couponCode || null);
    
    if (success) {
      setPhone('');
      setAddress('');
      setCouponCode('');
      navigate('/success');
    }
    setIsProcessing(false);
  };

  return (
    <>
      {isCartOpen && <div style={styles.overlay} onClick={toggleCart}></div>}
      
      <div style={{ ...styles.drawer, right: isCartOpen ? '0' : '-400px' }}>
        <div style={styles.header}>
          <h2>Your Cart</h2>
          <button style={styles.closeBtn} onClick={toggleCart}>X</button>
        </div>

        <div style={styles.itemsList}>
          {cartItems.length === 0 ? (
            <p style={{ textAlign: 'center', marginTop: '20px' }}>Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} style={styles.item}>
                             <img src={item.images[0].startsWith('/images') ? `http://localhost:3000${item.images[0]}` : item.images[0]} alt={item.name} style={styles.itemImage} />
                <div style={styles.itemInfo}>
                  <h4 style={styles.itemName}>{item.name}</h4>
                  <div style={styles.qtyContainer}>
                    <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span style={styles.qtyText}>{item.quantity}</span>
                    <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button style={styles.removeBtn} onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
                <div style={styles.itemPriceBox}>
                  <p style={styles.itemPrice}>{item.price} Ks</p>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <>
            <div style={styles.couponBox}>
              <input 
                type="text"
                style={styles.couponInput}
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button style={styles.couponBtn} onClick={() => handleApplyCoupon(couponCode)}>Apply</button>
            </div>

            <div style={styles.addressBox}>
              <label style={styles.addressLabel}>Phone Number:</label>
              <input type="text" style={styles.inputField} placeholder="e.g., 09 123 456 789" value={phone} onChange={(e) => setPhone(e.target.value)} />
              
              <label style={{...styles.addressLabel, marginTop: '10px'}}>Shipping Address:</label>
              <textarea style={styles.addressInput} placeholder="Enter your street, city, and state..." value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div style={styles.footer}>
              <p style={styles.subtotalText}>Subtotal: {cartTotal} Ks</p>
              <h3 style={styles.totalText}>Total: {cartTotal} Ks</h3>
              <button 
                style={{...styles.checkoutBtn, backgroundColor: (cartItems.length === 0 || isProcessing) ? '#ccc' : '#1a1a1a'}} 
                onClick={onCheckoutClick}
                disabled={cartItems.length === 0 || isProcessing} 
              >
                {isProcessing ? 'Processing Order...' : 'Proceed to Checkout'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200 },
  drawer: { position: 'fixed', top: 0, right: '-400px', width: '350px', height: '100vh', backgroundColor: '#fff', boxShadow: '-2px 0 10px rgba(0,0,0,0.1)', transition: 'right 0.3s ease-in-out', display: 'flex', flexDirection: 'column', zIndex: 300 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #eaeaea' },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#333' },
  itemsList: { flexGrow: 1, overflowY: 'auto', padding: '20px' },
  item: { display: 'flex', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0', gap: '10px' },
  itemImage: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '5px' },
  itemInfo: { display: 'flex', flexDirection: 'column', flexGrow: 1 },
  itemName: { margin: '0 0 5px 0', fontSize: '16px', color: '#333' },
  qtyContainer: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' },
  qtyBtn: { width: '25px', height: '25px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer', borderRadius: '3px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: '14px', color: '#333' },
  removeBtn: { background: 'none', border: 'none', color: 'red', cursor: 'pointer', padding: 0, fontSize: '13px', textAlign: 'left', width: 'fit-content' },
  itemPriceBox: { display: 'flex', alignItems: 'flex-start' },
  itemPrice: { margin: 0, color: '#666', fontSize: '14px', fontWeight: 'bold' },
  couponBox: { display: 'flex', gap: '10px', padding: '15px 20px', borderBottom: '1px solid #eaeaea' },
  couponInput: { flexGrow: 1, padding: '10px', fontSize: '14px', border: '1px solid #1a1a1a', borderRadius: '5px', textTransform: 'uppercase' },
  couponBtn: { padding: '10px 15px', backgroundColor: '#1a1a1a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  addressBox: { padding: '15px 20px', borderTop: '1px solid #eaeaea', borderBottom: '1px solid #eaeaea' },
  addressLabel: { display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#333' },
  inputField: { width: '100%', padding: '10px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' },
  addressInput: { width: '100%', padding: '10px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '5px', minHeight: '70px', resize: 'vertical', boxSizing: 'border-box' },
  footer: { padding: '20px', borderTop: '1px solid #eaeaea' },
  subtotalText: { margin: '0 0 5px 0', color: '#666', fontSize: '14px' },
  totalText: { margin: '0 0 15px 0', fontSize: '24px', color: '#1a1a1a' },
  checkoutBtn: { width: '100%', padding: '12px', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', marginTop: '5px', cursor: 'pointer' }
};

export default CartDrawer;