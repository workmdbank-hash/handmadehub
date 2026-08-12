// OrderSuccess.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function OrderSuccess() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.checkmark}>✅</div>
        <h1 style={styles.title}>Thank You For Your Order!</h1>
        <p style={styles.text}>
          Your order has been placed successfully. <br/>
          You can track your purchases in the "My Orders" section.
        </p>
        <div style={styles.buttonGroup}>
          <Link to="/myorders" style={styles.link}>
            <button style={styles.btnPrimary}>View My Orders</button>
          </Link>
          <Link to="/" style={styles.link}>
            <button style={styles.btnSecondary}>Continue Shopping</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    padding: '40px'
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '500px'
  },
  checkmark: {
    fontSize: '60px',
    marginBottom: '20px'
  },
  title: {
    color: '#8b5a2b',
    margin: '0 0 15px 0'
  },
  text: {
    color: '#555',
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '30px'
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  link: {
    textDecoration: 'none'
  },
  btnPrimary: {
    padding: '12px',
    backgroundColor: '#8b5a2b',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    width: '100%'
  },
  btnSecondary: {
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#8b5a2b',
    border: '1px solid #8b5a2b',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    width: '100%'
  }
};

export default OrderSuccess;