import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../services/api';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="spinner"></div>;
  if (error) return <p style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</p>;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': return { backgroundColor: '#fff3cd', color: '#856404' };
      case 'PROCESSING': return { backgroundColor: '#cce5ff', color: '#004085' };
      case 'SHIPPED': return { backgroundColor: '#d4edda', color: '#155724' };
      case 'DELIVERED': return { backgroundColor: '#d1ecf1', color: '#0c5460' };
      default: return { backgroundColor: '#eee', color: '#333' };
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Orders</h1>
      
      {orders.length === 0 ? (
        <p style={{ textAlign: 'center' }}>You haven't placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={styles.orderCard}>
            <div style={styles.orderHeader}>
              <Link to={`/order/${order.id}`} style={{ textDecoration: 'none', color: '#8b5a2b', fontWeight: 'bold' }}>
                Order ID: #{order.id} 🔗
              </Link>
              <span>Total: {order.total} Ks</span>
              <span style={{ ...styles.statusBadge, ...getStatusStyle(order.status) }}>
                {order.status}
              </span>
            </div>
            <div style={styles.itemsList}>
              {order.items.map((item) => {
                // NEW: Safely get the image URL
                const mainImg = item.product.images && item.product.images.length > 0 
                  ? item.product.images[0] 
                  : 'https://placehold.co/50x50?text=No+Img';
                const imgSrc = mainImg.startsWith('/images') ? `https://handmadehub-6c0t.onrender.com${mainImg}` : mainImg;

                return (
                  <div key={item.id} style={styles.itemRow}>
                    <img src={imgSrc} alt={item.product.name} style={styles.itemImage} />
                    <div>
                      <h4 style={styles.itemName}>{item.product.name}</h4>
                      <p style={styles.itemDetails}>Qty: {item.quantity} x {item.price} Ks</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '40px auto', padding: '20px' },
  title: { color: '#8b5a2b', textAlign: 'center', marginBottom: '30px' },
  orderCard: { border: '1px solid #eaeaea', borderRadius: '8px', backgroundColor: '#fff', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingBottom: '10px', borderBottom: '1px solid #eee', marginBottom: '15px', color: '#333', flexWrap: 'wrap', gap: '10px' },
  statusBadge: { padding: '5px 15px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' },
  itemsList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '15px' },
  itemImage: { width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px', border: '1px solid #eee' },
  itemName: { margin: 0, fontSize: '16px', color: '#333' },
  itemDetails: { margin: '5px 0 0 0', color: '#666', fontSize: '14px' }
};

export default MyOrders;