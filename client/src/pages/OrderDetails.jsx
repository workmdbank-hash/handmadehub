import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, createReview, createSellerReview } from '../services/api';
import { toast } from 'react-toastify';

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeReviewItem, setActiveReviewItem] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [sellerRating, setSellerRating] = useState(5);
  const [sellerComment, setSellerComment] = useState('');
  const [showSellerReviewForm, setShowSellerReviewForm] = useState(false);
  const [sellerReviewed, setSellerReviewed] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load order details.');
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleReviewSubmit = async (e, orderItemId, productId) => {
    e.preventDefault();
    try {
      const response = await createReview({ rating, comment, productId, orderItemId });
      setOrder({
        ...order,
        items: order.items.map(item => 
          item.id === orderItemId ? { ...item, review: response.review } : item
        )
      });
      setActiveReviewItem(null);
      setComment('');
      setRating(5);
      toast.success('Product review submitted!');
    } catch (error) {
      toast.error(error.message || 'Failed to submit review.');
    }
  };

  const handleSellerReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const sellerId = order.items[0].product.userId;
      await createSellerReview({ orderId: order.id, sellerId, rating: sellerRating, comment: sellerComment });
      
      setSellerReviewed(true);
      setShowSellerReviewForm(false);
      setSellerComment('');
      setSellerRating(5);
      toast.success('Seller review submitted!');
    } catch (error) {
      toast.error(error.message || 'Failed to submit seller review.');
    }
  };

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
        {order.items.map((item) => {
          let imgSrc = 'https://placehold.co/70x70/eee/ccc?text=No+Img';
          if (item.product.images && item.product.images.length > 0) {
            imgSrc = item.product.images[0].startsWith('/images') ? `http://localhost:3000${item.product.images[0]}` : item.product.images[0];
          }

          return (
            <div key={item.id} style={styles.itemRow}>
              <img src={imgSrc} alt={item.product.name} style={styles.itemImage} />
              <div style={styles.itemInfo}>
                <Link to={`/product/${item.productId}`} style={styles.itemName}>{item.product.name}</Link>
                <p style={styles.itemDetails}>Quantity: {item.quantity}</p>
                
                {order.status === 'DELIVERED' && (
                  <div style={styles.reviewSection}>
                    {item.review ? (
                      <div style={styles.existingReview}>
                        <p style={styles.reviewRating}>{"⭐".repeat(item.review.rating)}</p>
                        <p style={styles.reviewComment}>{item.review.comment}</p>
                      </div>
                    ) : activeReviewItem === item.id ? (
                      <form onSubmit={(e) => handleReviewSubmit(e, item.id, item.productId)} style={styles.reviewForm}>
                        <select value={rating} onChange={(e) => setRating(e.target.value)} style={styles.select}>
                          <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                          <option value="4">⭐⭐⭐⭐ (4/5)</option>
                          <option value="3">⭐⭐⭐ (3/5)</option>
                          <option value="2">⭐⭐ (2/5)</option>
                          <option value="1">⭐ (1/5)</option>
                        </select>
                        <textarea style={styles.textarea} placeholder="Write your product review..." value={comment} onChange={(e) => setComment(e.target.value)} required />
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button type="submit" style={styles.submitBtn}>Submit Product Review</button>
                          <button type="button" onClick={() => setActiveReviewItem(null)} style={styles.cancelBtn}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <button onClick={() => setActiveReviewItem(item.id)} style={styles.leaveReviewBtn}>Review this Product</button>
                    )}
                  </div>
                )}
              </div>
              <p style={styles.itemPrice}>{item.price} Ks</p>
            </div>
          );
        })}
      </div>

      {/* Seller Rating Section */}
      {order.status === 'DELIVERED' && (
        <div style={styles.sellerReviewBox}>
          <h2 style={styles.boxTitle}>Rate the Seller</h2>
          {sellerReviewed ? (
            <p style={{ color: 'green', fontWeight: 'bold' }}>✅ Thank you for rating the seller!</p>
          ) : showSellerReviewForm ? (
            <form onSubmit={handleSellerReviewSubmit} style={styles.reviewForm}>
              <select value={sellerRating} onChange={(e) => setSellerRating(e.target.value)} style={styles.select}>
                <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                <option value="4">⭐⭐⭐⭐ (4/5)</option>
                <option value="3">⭐⭐⭐ (3/5)</option>
                <option value="2">⭐⭐ (2/5)</option>
                <option value="1">⭐ (1/5)</option>
              </select>
              <textarea style={styles.textarea} placeholder="How was your experience with this seller?" value={sellerComment} onChange={(e) => setSellerComment(e.target.value)} required />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={styles.submitBtn}>Submit Seller Rating</button>
                <button type="button" onClick={() => setShowSellerReviewForm(false)} style={styles.cancelBtn}>Cancel</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowSellerReviewForm(true)} style={styles.leaveReviewBtn}>Leave a Seller Rating</button>
          )}
        </div>
      )}

      <Link to="/myorders" style={styles.backLink}>← Back to My Orders</Link>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #8b5a2b', paddingBottom: '20px', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' },
  title: { color: '#8b5a2b', margin: '0 0 5px 0', fontSize: '32px' },
  orderId: { margin: '0 0 5px 0', color: '#333', fontWeight: '600', fontSize: '16px' },
  date: { margin: 0, color: '#666', fontSize: '14px' },
  statusBadge: { padding: '8px 16px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold', height: 'fit-content' },
  grid: { display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' },
  // NEW: Soft bg, no dashed border
  shippingBox: { flex: '1', minWidth: '250px', backgroundColor: '#fcfcfc', borderRadius: '8px', padding: '20px' },
  paymentBox: { flex: '1', minWidth: '250px', backgroundColor: '#fff', border: '1px solid #eaeaea', borderRadius: '8px', padding: '20px' },
  boxTitle: { color: '#8b5a2b', marginTop: '0', marginBottom: '15px', fontSize: '18px' },
  shippingText: { margin: '5px 0', color: '#555', lineHeight: '1.5' },
  row: { display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: '10px' },
  totalRow: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px', fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a' },
  // NEW: Soft shadow, no border
  itemsSection: { backgroundColor: '#fcfcfc', border: 'none', borderRadius: '12px', padding: '24px 30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px' },
  itemRow: { display: 'flex', alignItems: 'flex-start', gap: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '15px', marginBottom: '15px' },
  itemImage: { width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' },
  itemInfo: { flexGrow: 1 },
  itemName: { margin: '0 0 5px 0', fontSize: '16px', color: '#1a1a1a', textDecoration: 'none', fontWeight: '600' },
  itemDetails: { margin: '0 0 10px 0', color: '#666', fontSize: '14px' },
  reviewSection: { marginTop: '10px' },
  existingReview: { backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px', border: '1px solid #eee' },
  reviewRating: { margin: '0 0 5px 0', color: '#8b5a2b' },
  reviewComment: { margin: 0, color: '#555', fontSize: '14px' },
  leaveReviewBtn: { padding: '8px 16px', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  reviewForm: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' },
  select: { height: '40px', padding: '8px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #ccc' },
  textarea: { height: 'auto', minHeight: '80px', padding: '8px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' },
  submitBtn: { height: '40px', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  cancelBtn: { height: '40px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  itemPrice: { fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a' },
  // NEW: Soft shadow, no border
  sellerReviewBox: { backgroundColor: '#fcfcfc', border: 'none', borderRadius: '12px', padding: '24px 30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px' },
  backLink: { display: 'block', marginTop: '30px', color: '#8b5a2b', textDecoration: 'none', fontWeight: 'bold' }
};

export default OrderDetails;