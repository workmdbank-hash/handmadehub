import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../services/api';

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load order details. Please try again.');
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="spinner"></div>;
  if (error) return <p style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</p>;
  if (!order) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Order not found.</p>;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': return { backgroundColor: '#fff3cd', color: '#856404' };
      case 'PROCESSING': return { backgroundColor: '#cce5ff', color: '#004085' };
      case 'SHIPPED': return { backgroundColor: '#d4edda', color: '#155724' };
      case 'DELIVERED': return { backgroundColor: '#d1ecf1', color: '#0c5460' };
      default: return { backgroundColor: '#eee', color: '#333' };
    }
  };

  const orderDate = new Date(order.createdAt).toLocaleDateString();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Order Receipt</h1>
          <p style={styles.orderId}>Order ID: #{order.id}</p>
          <p style={styles.date}>Placed on: {orderDate}</p>
        </div>
        <span style={{ ...styles.statusBadge, ...getStatusStyle(order.status) }}>
          {order.status}
        </span>
      </div>

      <div style={styles.grid}>
        <div style={styles.shippingBox}>
          <h3 style={styles.boxTitle}>Shipping Information</h3>
          <p style={styles.shippingText}>{order.user?.name}</p>
          {order.shippingAddress && order.shippingAddress.split('|').map((part, index) => (
            <p key={index} style={styles.shippingText}>{part.trim()}</p>
          ))}
        </div>

        <div style={styles.paymentBox}>
          <h3 style={styles.boxTitle}>Payment Summary</h3>
            <div style={styles.row}>
                <span>Subtotal</span>
                <span>{order.total} Ks</span>
            </div>
            <div style={styles.totalRow}>
                <span>Total</span>
                <span>{order.total} Ks</span>
            </div>
        </div>
      </div>

      <div style={styles.itemsSection}>
        <h2 style={styles.boxTitle}>Items in this Order</h2>
        {order.items.map((item) => (
          <div key={item.id} style={styles.itemRow}>
                <img src={item.product.images[0].startsWith('/images') ? `http://localhost:3000${item.product.images[0]}` : item.product.images[0]} alt={item.product.name} style={styles.itemImage} />
            <div style={styles.itemInfo}>
              <Link to={`/product/${item.productId}`} style={styles.itemName}>{item.product.name}</Link>
              <p style={styles.itemDetails}>Quantity: {item.quantity}</p>
            </div>
            <p style={styles.itemPrice}>{item.price} Ks</p>
          </div>
        ))}
      </div>

      <Link to="/myorders" style={styles.backLink}>← Back to My Orders</Link>
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px', margin: '40px auto', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #8b5a2b', paddingBottom: '20px', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' },
  title: { color: '#8b5a2b', margin: '0 0 5px 0' },
  orderId: { margin: '0 0 5px 0', color: '#333', fontWeight: 'bold' },
  date: { margin: 0, color: '#666', fontSize: '14px' },
  statusBadge: { padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', height: 'fit-content' },
  grid: { display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' },
  shippingBox: { flex: '1', minWidth: '250px', backgroundColor: '#fffaf0', border: '1px dashed #8b5a2b', borderRadius: '8px', padding: '20px' },
  paymentBox: { flex: '1', minWidth: '250px', backgroundColor: '#fff', border: '1px solid #eaeaea', borderRadius: '8px', padding: '20px' },
  boxTitle: { color: '#8b5a2b', marginTop: '0', marginBottom: '15px', fontSize: '18px' },
  shippingText: { margin: '5px 0', color: '#555', lineHeight: '1.5' },
  row: { display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: '10px' },
  totalRow: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px', fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a' },
  itemsSection: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '15px', marginBottom: '15px' },
  itemImage: { width: '70px', height: '70px', objectFit: 'cover', borderRadius: '5px' },
  itemInfo: { flexGrow: 1 },
  itemName: { margin: '0 0 5px 0', fontSize: '16px', color: '#333', textDecoration: 'none', fontWeight: '600' },
  itemDetails: { margin: 0, color: '#666', fontSize: '14px' },
  itemPrice: { fontSize: '16px', fontWeight: 'bold', color: '#333' },
  backLink: { display: 'block', marginTop: '30px', color: '#8b5a2b', textDecoration: 'none', fontWeight: 'bold' }
};

export default OrderDetails;