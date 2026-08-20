import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, createReview, addToWishlist, updateReview, deleteReview, checkReviewEligibility, createConversation } from '../services/api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { useIsMobile } from '../hooks/useIsMobile';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile(); // NEW
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [canReview, setCanReview] = useState(false);
  const [orderItemIdForReview, setOrderItemIdForReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  const [activeImage, setActiveImage] = useState('');

  const loggedInUserId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
        
        if (data.images && data.images.length > 0) {
          const firstImg = data.images[0];
          setActiveImage(firstImg.startsWith('/images') ? `http://${window.location.hostname}:3000${firstImg}` : firstImg);
        }

        const eligibility = await checkReviewEligibility(id);
        if (eligibility.eligible) {
          setCanReview(true);
          setOrderItemIdForReview(eligibility.orderItemId);
        }

        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createReview({ rating, comment, productId: id, orderItemId: orderItemIdForReview });
      setProduct({ ...product, reviews: [...product.reviews, response.review] });
      setComment('');
      setRating(5);
      setShowReviewForm(false);
      setCanReview(false);
      toast.success('Review submitted!');
    } catch (error) {
      toast.error(error.message || 'Failed to submit review.');
    }
  };

  const handleUpdateReview = async (reviewId) => {
    try {
      const response = await updateReview(reviewId, { rating: editRating, comment: editComment });
      setProduct({ ...product, reviews: product.reviews.map(r => r.id === reviewId ? response.review : r) });
      setEditingReviewId(null);
      toast.success('Review updated!');
    } catch (error) {
      toast.error('Failed to update review.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Delete this review?')) {
      try {
        await deleteReview(reviewId);
        setProduct({ ...product, reviews: product.reviews.filter(r => r.id !== reviewId) });
        toast.success('Review deleted!');
      } catch (error) {
        toast.error('Failed to delete review.');
      }
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (!product) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Product not found.</p>;

  const isOutOfStock = product.stock <= 0;

  return (
    <div style={{...styles.container, padding: isMobile ? '20px 15px' : '40px 20px'}}>
      <div className="detail-grid" style={{...styles.grid, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '20px' : '40px', marginBottom: '40px'}}>
        {/* LEFT: Image Gallery */}
        <div style={styles.imageBox}>
          <div style={{...styles.imageContainer, height: isMobile ? '300px' : '400px'}}>
            <img className="detail-image" src={activeImage} alt={product.name} style={styles.image} />
            {isOutOfStock && (<div style={styles.soldOutBadge}>SOLD OUT</div>)}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div style={styles.thumbnailsRow}>
              {product.images.map((img, index) => {
                const thumbSrc = img.startsWith('/images') ? `http://${window.location.hostname}:3000${img}` : img;
                return (
                  <img 
                    key={index} 
                    src={thumbSrc} 
                    alt={`thumbnail ${index}`} 
                    style={activeImage === thumbSrc ? styles.activeThumbnail : styles.thumbnail}
                    onClick={() => setActiveImage(thumbSrc)}
                  />
                );
              })}
            </div>
          )}
        </div>
        
        {/* RIGHT: Info */}
        <div style={styles.infoBox}>
          <h1 className="detail-name" style={{...styles.name, fontSize: isMobile ? '22px' : '28px'}}>{product.name}</h1>
          
          {/* Shop & Seller Links */}
          <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {/* Show Shop Name if it exists */}
            {product.user?.shop?.name && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: isMobile ? '13px' : '15px', color: '#888', fontWeight: '600', flexShrink: 0 }}>🏪 Shop:</span>
                <Link to={`/shop/${product.user.shop.slug}`} style={{ fontSize: isMobile ? '15px' : '18px', color: '#1a1a1a', fontWeight: '700', textDecoration: 'none' }}>
                  {product.user.shop.name}
                </Link>
              </div>
            )}
            {/* Always show Seller Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: isMobile ? '13px' : '15px', color: '#888', fontWeight: '600', flexShrink: 0 }}>👤 Seller:</span>
              <Link to={`/seller/${product.user?.id}`} style={{ fontSize: isMobile ? '15px' : '18px', color: '#8b5a2b', fontWeight: '600', textDecoration: 'none' }}>
                {product.user?.name || 'Unknown Seller'}
              </Link>
            </div>
          </div>
          
          {/* Price */}
          {product.salePrice ? (
            <div style={styles.priceContainer}>
              <span style={{...styles.originalPrice, fontSize: isMobile ? '16px' : '20px'}}>{product.price} Ks</span>
              <h2 className="detail-price" style={{...styles.salePrice, fontSize: isMobile ? '24px' : '32px'}}>{product.salePrice} Ks</h2>
            </div>
          ) : (
            <h2 className="detail-price" style={{...styles.price, fontSize: isMobile ? '24px' : '32px'}}>{product.price} Ks</h2>
          )}
          
          {isOutOfStock ? (
            <p style={styles.outOfStockText}>Currently Sold Out</p>
          ) : (
            <p style={styles.inStockText}>In Stock: {product.stock}</p>
          )}

          {/* Details Box */}
          {(product.materials || product.processingTime || product.sku) && (
            <div style={styles.detailsBox}>
              {product.materials && <p style={{...styles.detailItem, fontSize: isMobile ? '13px' : '14px'}}><strong style={styles.detailLabel}>Materials:</strong> {product.materials}</p>}
              {product.processingTime && <p style={{...styles.detailItem, fontSize: isMobile ? '13px' : '14px'}}><strong style={styles.detailLabel}>Processing Time:</strong> {product.processingTime}</p>}
              {product.sku && <p style={{...styles.detailItem, fontSize: isMobile ? '13px' : '14px'}}><strong style={styles.detailLabel}>SKU:</strong> {product.sku}</p>}
            </div>
          )}

          <div style={styles.descriptionBox}>
            <h3 style={{...styles.descTitle, fontSize: isMobile ? '16px' : '18px'}}>Description</h3>
            <p style={{...styles.descText, fontSize: isMobile ? '14px' : '16px'}}>{product.description}</p>
          </div>

          {/* Buttons: Stack vertically on mobile */}
          <div style={{...styles.buttonGroup, flexDirection: isMobile ? 'column' : 'row'}}>
            <button style={{...styles.addButton, fontSize: isMobile ? '14px' : '16px', padding: isMobile ? '12px' : '15px'}} onClick={() => addToCart(product)} disabled={isOutOfStock}>
              {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>
            <button style={{...styles.wishlistBtn, fontSize: isMobile ? '14px' : '16px', padding: isMobile ? '12px' : '15px'}} onClick={async () => {
              try { await addToWishlist(product.id); toast.success('Added to Wishlist!'); } 
              catch (error) { toast.error('Failed to add. Are you logged in?'); }
            }}>❤️ Add to Wishlist</button>
            
            <button style={{...styles.chatBtn, fontSize: isMobile ? '14px' : '16px', padding: isMobile ? '12px' : '15px'}} onClick={async () => {
              try {
                const conv = await createConversation(product.userId, product.id);
                navigate(`/messages?id=${conv.id}`);
              } catch (error) {
                toast.error('Failed to start chat. Are you logged in?');
              }
            }}>💬 Chat with Seller</button>
          </div>

          {/* Smart Review Form */}
          {canReview && (
            <div style={styles.reviewSection}>
              <h3 style={{...styles.reviewTitle, fontSize: isMobile ? '16px' : '18px'}}>Leave a Review</h3>
              {!showReviewForm ? (
                <button onClick={() => setShowReviewForm(true)} style={styles.leaveReviewBtn}>Write a Review for this item</button>
              ) : (
                <form onSubmit={handleReviewSubmit} style={styles.reviewForm}>
                  <select value={rating} onChange={(e) => setRating(e.target.value)} style={styles.select}>
                    <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value="4">⭐⭐⭐⭐ (4/5)</option>
                    <option value="3">⭐⭐⭐ (3/5)</option>
                    <option value="2">⭐⭐ (2/5)</option>
                    <option value="1">⭐ (1/5)</option>
                  </select>
                  <textarea style={styles.textarea} placeholder="Write your comment here..." value={comment} onChange={(e) => setComment(e.target.value)} required />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={styles.reviewBtn}>Submit Review</button>
                    <button type="button" onClick={() => setShowReviewForm(false)} style={styles.cancelBtn}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM: Existing Reviews */}
      <div style={styles.reviewsListSection}>
        <h2 style={{...styles.reviewTitle, fontSize: isMobile ? '18px' : '24px'}}>Customer Reviews</h2>
        {product.reviews?.length === 0 ? (
          <p style={{ color: '#666', fontSize: isMobile ? '14px' : '16px' }}>No reviews yet. Be the first to leave one!</p>
        ) : (
          product.reviews?.map((review) => (
            <div key={review.id} style={styles.reviewCard}>
              {editingReviewId === review.id ? (
                <div style={styles.editBox}>
                  <select value={editRating} onChange={(e) => setEditRating(e.target.value)} style={styles.select}>
                    <option value="5">5 Stars</option><option value="4">4 Stars</option>
                    <option value="3">3 Stars</option><option value="2">2 Stars</option><option value="1">1 Star</option>
                  </select>
                  <textarea style={styles.textarea} value={editComment} onChange={(e) => setEditComment(e.target.value)} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleUpdateReview(review.id)} style={styles.saveBtn}>Save</button>
                    <button onClick={() => setEditingReviewId(null)} style={styles.cancelBtn}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={styles.reviewHeader}>
                    <div>
                      <p style={{...styles.reviewUser, fontSize: isMobile ? '14px' : '16px'}}>{review.user?.name || 'Anonymous'}</p>
                      {review.orderItemId && (
                        <span style={styles.verifiedBadge}>✅ Verified Purchase</span>
                      )}
                    </div>
                    {String(review.userId) === loggedInUserId && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => { setEditingReviewId(review.id); setEditRating(review.rating); setEditComment(review.comment); }} style={styles.editBtn}>Edit</button>
                        <button onClick={() => handleDeleteReview(review.id)} style={styles.deleteBtn}>Delete</button>
                      </div>
                    )}
                  </div>
                  <p style={{...styles.reviewRating, fontSize: isMobile ? '13px' : '14px'}}>Rating: {"⭐".repeat(review.rating)}</p>
                  <p style={{...styles.reviewComment, fontSize: isMobile ? '14px' : '15px'}}>{review.comment}</p>
                </>
              )}
            </div>
          ))
        )}
      </div>
      
      <Link to="/" style={{...styles.backLink, fontSize: isMobile ? '14px' : '16px'}}>← Back to Home</Link>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1000px', margin: '0 auto' },
  grid: { display: 'grid', marginBottom: '40px' },
  imageBox: { backgroundColor: '#f9f9f9', borderRadius: '8px', overflow: 'hidden' },
  imageContainer: { position: 'relative', width: '100%' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  thumbnailsRow: { display: 'flex', gap: '10px', padding: '10px', overflowX: 'auto' },
  thumbnail: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '5px', cursor: 'pointer', opacity: 0.6, border: '2px solid transparent' },
  activeThumbnail: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '5px', cursor: 'pointer', opacity: 1, border: '2px solid #8b5a2b' },
  infoBox: { display: 'flex', flexDirection: 'column' },
  name: { margin: 0, color: '#333' },
  sellerLink: { margin: '0', color: '#8b5a2b', textDecoration: 'none', display: 'block', fontWeight: 'normal' },
  shopLink: { margin: '0 0 5px 0', color: '#1a1a1a', textDecoration: 'none', fontWeight: '700' },
  
  priceContainer: { display: 'flex', alignItems: 'center', gap: '15px', margin: '0 0 10px 0' },
  originalPrice: { color: '#999', textDecoration: 'line-through' },
  salePrice: { margin: 0, color: '#ff4d4f', fontWeight: '700' },
  price: { margin: '0 0 10px 0', color: '#8b5a2b', fontWeight: '700' },
  
  outOfStockText: { margin: '0 0 20px 0', color: 'red', fontWeight: 'bold', fontSize: '16px' },
  inStockText: { margin: '0 0 20px 0', color: 'green', fontWeight: 'bold', fontSize: '16px' },
  
  detailsBox: { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '20px' },
  detailItem: { margin: '0 0 8px 0', color: '#555' },
  detailLabel: { color: '#333', fontWeight: '600' },
  
  descriptionBox: { backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '20px' },
  descTitle: { margin: '0 0 10px 0', color: '#8b5a2b' },
  descText: { margin: 0, color: '#555', lineHeight: '1.6' },
  
  buttonGroup: { display: 'flex', gap: '15px', marginBottom: '30px' },
  addButton: { backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', flexGrow: 1 },
  disabledBtn: { backgroundColor: '#ccc', color: '#666', cursor: 'not-allowed', flexGrow: 1 },
  wishlistBtn: { backgroundColor: 'transparent', color: '#8b5a2b', border: '1px solid #8b5a2b', borderRadius: '5px', cursor: 'pointer', flexGrow: 1 },
  chatBtn: { backgroundColor: 'transparent', color: '#333', border: '1px solid #333', borderRadius: '5px', cursor: 'pointer', flexGrow: 1 },
  soldOutBadge: { position: 'absolute', top: '15px', right: '15px', backgroundColor: 'red', color: 'white', padding: '5px 15px', borderRadius: '5px', fontSize: '14px', fontWeight: 'bold' },
  
  reviewSection: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '20px' },
  reviewTitle: { color: '#8b5a2b', marginTop: 0, marginBottom: '15px' },
  leaveReviewBtn: { padding: '10px 20px', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  reviewForm: { display: 'flex', flexDirection: 'column', gap: '10px' },
  select: { padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' },
  textarea: { padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc', minHeight: '80px' },
  reviewBtn: { padding: '10px', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' },
  cancelBtn: { padding: '10px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' },
  
  reviewsListSection: { borderTop: '2px solid #eee', paddingTop: '30px' },
  reviewCard: { backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '15px' },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  reviewUser: { margin: '0 0 5px 0', fontWeight: 'bold', color: '#333' },
  verifiedBadge: { fontSize: '11px', color: 'green', fontWeight: 'bold', backgroundColor: '#e6ffe6', padding: '2px 6px', borderRadius: '4px' },
  reviewRating: { margin: '5px 0', color: '#8b5a2b' },
  reviewComment: { margin: 0, color: '#555' },
  editBtn: { padding: '4px 10px', backgroundColor: 'transparent', border: '1px solid #8b5a2b', color: '#8b5a2b', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
  deleteBtn: { padding: '4px 10px', backgroundColor: 'transparent', border: '1px solid red', color: 'red', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
  editBox: { display: 'flex', flexDirection: 'column', gap: '10px' },
  saveBtn: { padding: '8px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  backLink: { display: 'block', marginTop: '30px', color: '#888', textDecoration: 'none' }
};

export default ProductDetail;