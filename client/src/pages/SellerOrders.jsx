import React, { useState, useEffect } from 'react';
import { getSellerOrders, updateOrderStatus } from '../services/api';
import { toast } from 'react-toastify';

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getSellerOrders();
        setOrders(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
      toast.success('Order status updated!');
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Sales</h1>
      
      {orders.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>No one has bought your products yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={styles.orderCard}>
            <div style={styles.orderHeader}>
              <div>
                <span style={styles.label}>Order ID:</span> <span style={styles.data}>#{order.id}</span>
              </div>
              <div>
                <span style={styles.label}>Customer:</span> <span style={styles.data}>{order.user?.name}</span>
              </div>
              <div>
                <span style={styles.label}>Date:</span> <span style={styles.data}>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              
              <select 
                value={order.status} 
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                style={order.status === 'DELIVERED' ? styles.statusDelivered : styles.statusPending}
              >
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
              </select>
            </div>
            
            <div style={styles.body}>
              <div style={styles.shippingBox}>
                <h3 style={styles.boxTitle}>Ship To:</h3>
                <p style={styles.shippingText}>{order.user?.name}</p>
                <p style={styles.shippingText}>{order.shippingAddress}</p>
              </div>

              <div style={styles.itemsBox}>
                <h3 style={styles.boxTitle}>Items to Ship:</h3>
                {order.items.map((item) => {
                  let imgSrc = 'https://placehold.co/60x60?text=No+Img';
                  if (item.product.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
                    const firstImg = item.product.images[0];
                    if (firstImg && typeof firstImg === 'string') {
                      imgSrc = firstImg.startsWith('/images') ? `https://handmadehub-mm.onrender.com${firstImg}` : firstImg;
                    }
                  } else if (item.product.imageUrl && typeof item.product.imageUrl === 'string') {
                    imgSrc = item.product.imageUrl.startsWith('/images') ? `https://handmadehub-mm.onrender.com${item.product.imageUrl}` : item.product.imageUrl;
                  }

                  return (
                    <div key={item.id} style={styles.itemRow}>
                      <img src={imgSrc} alt={item.product.name} style={styles.itemImage} />
                      <div style={styles.itemInfo}>
                        <h4 style={styles.itemName}>{item.product.name}</h4>
                        <p style={styles.itemDetails}>Qty: {item.quantity} x {item.price} Ks</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  title: { color: '#8b5a2b', textAlign: 'center', marginBottom: '3rem', fontSize: '32px' },
  // NEW: Removed border, added subtle shadow and light bg, rounded 12px
  orderCard: { 
    backgroundColor: '#fcfcfc', 
    border: 'none', 
    borderRadius: '12px', 
    marginBottom: '24px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
    overflow: 'hidden' 
  },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 30px', backgroundColor: '#FDFBF7', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '15px' },
  // NEW: Typography hierarchy
  label: { fontSize: '12px', color: '#888', fontWeight: '500', textTransform: 'uppercase' },
  data: { fontSize: '16px', color: '#1a1a1a', fontWeight: '600', marginLeft: '5px' },
  // NEW: Pill-shaped status badges
  statusPending: { padding: '8px 16px', fontSize: '12px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#856404', backgroundColor: '#fff3cd' },
  statusDelivered: { padding: '8px 16px', fontSize: '12px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#2E7D32', backgroundColor: '#E8F5E9' },
  body: { display: 'flex', gap: '30px', padding: '30px', flexWrap: 'wrap' },
  // NEW: Removed dashed border, soft bg
  shippingBox: { flex: '1', minWidth: '250px', backgroundColor: '#f9f9f9', borderRadius: '8px', padding: '20px' },
  boxTitle: { margin: '0 0 15px 0', color: '#8b5a2b', fontSize: '18px', fontWeight: '600' },
  shippingText: { margin: '5px 0', color: '#333', lineHeight: '1.6', fontSize: '16px', fontWeight: '500' },
  itemsBox: { flex: '2', minWidth: '300px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f0f0f0' },
  itemImage: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' },
  itemInfo: { display: 'flex', flexDirection: 'column' },
  itemName: { margin: '0 0 5px 0', fontSize: '16px', color: '#1a1a1a', fontWeight: '600' },
  itemDetails: { margin: 0, color: '#666', fontSize: '14px' }
};

export default SellerOrders;