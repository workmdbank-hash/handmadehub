// SellerOrders.jsx
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
      
      // Update the UI instantly so the seller sees the change
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
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
        <p style={{ textAlign: 'center' }}>No one has bought your products yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={styles.orderCard}>
            <div style={styles.orderHeader}>
              <span>Order #{order.id}</span>
              <span>Customer: {order.user?.name}</span>
              <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
              
              {/* NEW: Status Dropdown */}
              <select 
                value={order.status} 
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                style={styles.statusDropdown}
              >
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
              </select>
            </div>
            
            <div style={styles.body}>
              <div style={styles.shippingBox}>
                <h3 style={styles.shippingTitle}>Ship To:</h3>
                <p style={styles.shippingText}>{order.user?.name}</p>
                <p style={styles.shippingText}>{order.shippingAddress}</p>
              </div>

              <div style={styles.itemsBox}>
                <h3 style={styles.shippingTitle}>Items to Ship:</h3>
                {order.items.map((item) => (
                  <div key={item.id} style={styles.itemRow}>
                    <img src={item.product.images[0].startsWith('/images') ? `https://handmadehub-6c0t.onrender.com${item.product.images[0]}` : item.product.images[0]} alt={item.product.name} style={styles.itemImage} />
                    <div style={styles.itemInfo}>
                      <h4 style={styles.itemName}>{item.product.name}</h4>
                      <p style={styles.itemDetails}>Qty: {item.quantity} x {item.price} Ks</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px', margin: '40px auto', padding: '20px' },
  title: { color: '#8b5a2b', textAlign: 'center', marginBottom: '30px' },
  orderCard: { backgroundColor: '#fff', border: '1px solid #eaeaea', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', overflow: 'hidden' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eaeaea', fontWeight: 'bold', color: '#333', flexWrap: 'wrap', gap: '10px' },
  // NEW: Dropdown styles
  statusDropdown: { padding: '6px 12px', fontSize: '14px', borderRadius: '5px', border: '1px solid #8b5a2b', cursor: 'pointer', fontWeight: 'bold', color: '#8b5a2b', backgroundColor: 'white' },
  body: { display: 'flex', gap: '20px', padding: '20px', flexWrap: 'wrap' },
  shippingBox: { flex: '1', minWidth: '250px', backgroundColor: '#fffaf0', border: '1px dashed #8b5a2b', borderRadius: '8px', padding: '15px' },
  shippingTitle: { margin: '0 0 10px 0', color: '#8b5a2b', fontSize: '18px' },
  shippingText: { margin: '5px 0', color: '#555', lineHeight: '1.5', fontSize: '16px' },
  itemsBox: { flex: '2', minWidth: '300px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' },
  itemImage: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '5px' },
  itemInfo: { display: 'flex', flexDirection: 'column' },
  itemName: { margin: '0 0 5px 0', fontSize: '16px', color: '#333' },
  itemDetails: { margin: 0, color: '#666', fontSize: '14px' }
};

export default SellerOrders;