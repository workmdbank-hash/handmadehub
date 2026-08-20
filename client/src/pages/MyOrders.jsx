import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../services/api';
import { useIsMobile } from '../hooks/useIsMobile';

function MyOrders() {
  const isMobile = useIsMobile();
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
      <h1 style={{...styles.title, fontSize: isMobile ? '24px' : '32px'}}>My Orders</h1>
      
      {orders.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>You haven't placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={styles.orderCard}>
            <div style={styles.orderHeader}>
              <Link to={`/order/${order.id}`} style={styles.orderIdLink}>
                Order ID: #{order.id} 🔗
              </Link>
              <span style={styles.totalText}>Total: {order.total} Ks</span>
              <span style={{ ...styles.statusBadge, ...getStatusStyle(order.status) }}>
                {order.status}
              </span>
            </div>
            
            <div style={styles.itemsList}>
              {order.items.map((item) => {
                // BULLETPROOF image getter
                let imgSrc = 'https://placehold.co/50x50/eee/ccc?text=No+Img';
                if (item.product.images && item.product.images.length > 0) {
                  const firstImg = item.product.images[0];
                  imgSrc = firstImg.startsWith('/images') ? `https://handmadehub-mm.onrender.com${firstImg}` : firstImg;
                }

                return (
                  <div key={item.id} style={styles.itemRow}>
                  <img 
                    src={imgSrc} 
                    alt={item.product?.name || 'Product'} 
                    style={styles.itemImage} 
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = "https://placehold.co/50x50/eee/ccc?text=No+Img"
                    }}
                  />
                    <div style={styles.itemInfo}>
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
  container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  title: { color: '#8b5a2b', textAlign: 'center', marginBottom: '3rem' },
  orderCard: { 
    backgroundColor: '#fcfcfc', 
    border: 'none', 
    borderRadius: '12px', 
    padding: '24px 30px', 
    marginBottom: '24px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)' 
  },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #f0f0f0', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },
  orderIdLink: { textDecoration: 'none', color: '#8b5a2b', fontWeight: '600', fontSize: '16px' },
  totalText: { fontSize: '16px', fontWeight: '600', color: '#1a1a1a' },
  statusBadge: { padding: '8px 16px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' },
  itemsList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '15px' },
  itemImage: { width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 },
  itemInfo: { display: 'flex', flexDirection: 'column' },
  itemName: { margin: '0 0 5px 0', fontSize: '16px', color: '#1a1a1a', fontWeight: '600' },
  itemDetails: { margin: 0, color: '#666', fontSize: '14px' }
};

export default MyOrders;