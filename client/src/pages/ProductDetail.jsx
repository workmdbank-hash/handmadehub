import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, createReview, addToWishlist, updateReview, deleteReview } from '../services/api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  // NEW: State for the active image in the gallery
  const [activeImage, setActiveImage] = useState('');

  const loggedInUserId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
        // NEW: Set the first image as the active image when product loads
        if (data.images && data.images.length > 0) {
          const firstImg = data.images[0];
          setActiveImage(firstImg.startsWith('/images') ? `https://handmadehub-6c0t.onrender.com${firstImg}` : firstImg);
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
      const response = await createReview({ rating, comment, productId: id });
      setProduct({ ...product, reviews: [...product.reviews, response.review] });
      setComment('');
      setRating(5);
      toast.success('Review submitted!');
    } catch (error) {
      toast.error('Failed to submit review. Are you logged in?');
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
    <div style={styles.container}>
      <div className="detail-grid" style={styles.grid}>
        {/* LEFT: Image Gallery */}
        <div style={styles.imageBox}>
          <div style={styles.imageContainer}>
            <img className="detail-image" src={activeImage} alt={product.name} style={styles.image} />
            {isOutOfStock && (<div style={styles.soldOutBadge}>SOLD OUT</div>)}
          </div>
          
          {/* NEW: Thumbnails Row */}
          {product.images && product.images.length > 1 && (
            <div style={styles.thumbnailsRow}>
              {product.images.map((img, index) => {
                const thumbSrc = img.startsWith('/images') ? `https://handmadehub-6c0t.onrender.com${img}` : img;
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
          <h1 className="detail-name" style={styles.name}>{product.name}</h1>
          <Link to={`/seller/${product.userId}`} style={styles.sellerLink}>by {product.user?.name || 'Unknown Seller'}</Link>
          <h2 className="detail-price" style={styles.price}>{product.price} Ks</h2>
          
          {isOutOfStock ? (
            <p style={styles.outOfStockText}>Currently Sold Out</p>
          ) : (
            <p style={styles.inStockText}>In Stock: {product.stock}</p>
          )}

          <div style={styles.descriptionBox}>
            <h3 style={styles.descTitle}>Description</h3>
            <p style={styles.descText}>{product.description}</p>
          </div>

          <div style={styles.buttonGroup}>
            <button style={isOutOfStock ? styles.disabledBtn : styles.addButton} onClick={() => addToCart(product)} disabled={isOutOfStock}>
              {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>
            <button style={styles.wishlistBtn} onClick={async () => {
              try { await addToWishlist(product.id); toast.success('Added to Wishlist!'); } 
              catch (error) { toast.error('Failed to add. Are you logged in?'); }
            }}>❤️ Add to Wishlist</button>
          </div>

          <div style={styles.reviewSection}>
            <h3 style={styles.reviewTitle}>Leave a Review</h3>
            {localStorage.getItem('token') ? (
              <form onSubmit={handleReviewSubmit} style={styles.reviewForm}>
                <select value={rating} onChange={(e) => setRating(e.target.value)} style={styles.select}>
                  <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value="4">⭐⭐⭐⭐ (4/5)</option>
                  <option value="3">⭐⭐⭐ (3/5)</option>
                  <option value="2">⭐⭐ (2/5)</option>
                  <option value="1">⭐ (1/5)</option>
                </select>
                <textarea style={styles.textarea} placeholder="Write your comment here..." value={comment} onChange={(e) => setComment(e.target.value)} required />
                <button type="submit" style={styles.reviewBtn}>Submit Review</button>
              </form>
            ) : (
              <p style={{ color: '#666' }}>Please <Link to="/login" style={{color: '#8b5a2b'}}>login</Link> to leave a review.</p>
            )}
          </div>
        </div>
      </div>

      <div style={styles.reviewsListSection}>
        <h2 style={styles.reviewTitle}>Customer Reviews</h2>
        {product.reviews?.length === 0 ? (
          <p style={{ color: '#666' }}>No reviews yet. Be the first to leave one!</p>
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
                    <p style={styles.reviewUser}>{review.user?.name || 'Anonymous'}</p>
                    {String(review.userId) === loggedInUserId && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => { setEditingReviewId(review.id); setEditRating(review.rating); setEditComment(review.comment); }} style={styles.editBtn}>Edit</button>
                        <button onClick={() => handleDeleteReview(review.id)} style={styles.deleteBtn}>Delete</button>
                      </div>
                    )}
                  </div>
                  <p style={styles.reviewRating}>Rating: {"⭐".repeat(review.rating)}</p>
                  <p style={styles.reviewComment}>{review.comment}</p>
                </>
              )}
            </div>
          ))
        )}
      </div>
      
      <Link to="/" style={styles.backLink}>← Back to Home</Link>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1000px', margin: '40px auto', padding: '20px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' },
  imageBox: { backgroundColor: '#f9f9f9', borderRadius: '8px', overflow: 'hidden' },
  imageContainer: { position: 'relative', width: '100%', height: '400px' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  // NEW: Thumbnails styles
  thumbnailsRow: { display: 'flex', gap: '10px', padding: '10px', overflowX: 'auto' },
  thumbnail: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '5px', cursor: 'pointer', opacity: 0.6, border: '2px solid transparent' },
  activeThumbnail: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '5px', cursor: 'pointer', opacity: 1, border: '2px solid #8b5a2b' },
  infoBox: { display: 'flex', flexDirection: 'column' },
  name: { margin: 0, fontSize: '28px', color: '#333' },
  sellerLink: { margin: '5px 0 15px 0', color: '#8b5a2b', fontSize: '16px', textDecoration: 'none', display: 'block', fontWeight: 'bold' },
  price: { margin: '0 0 10px 0', fontSize: '32px', color: '#8b5a2b' },
  outOfStockText: { margin: '0 0 20px 0', color: 'red', fontWeight: 'bold', fontSize: '16px' },
  inStockText: { margin: '0 0 20px 0', color: 'green', fontWeight: 'bold', fontSize: '16px' },
  descriptionBox: { backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '20px' },
  descTitle: { margin: '0 0 10px 0', color: '#8b5a2b' },
  descText: { margin: 0, color: '#555', lineHeight: '1.6' },
  buttonGroup: { display: 'flex', gap: '15px', marginBottom: '30px' },
  addButton: { padding: '15px', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', flexGrow: 1 },
  disabledBtn: { padding: '15px', backgroundColor: '#ccc', color: '#666', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'not-allowed', flexGrow: 1 },
  wishlistBtn: { padding: '15px', backgroundColor: 'transparent', color: '#8b5a2b', border: '1px solid #8b5a2b', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', flexGrow: 1 },
  soldOutBadge: { position: 'absolute', top: '15px', right: '15px', backgroundColor: 'red', color: 'white', padding: '5px 15px', borderRadius: '5px', fontSize: '14px', fontWeight: 'bold' },
  reviewSection: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #eee' },
  reviewTitle: { color: '#8b5a2b', marginTop: 0, marginBottom: '15px' },
  reviewForm: { display: 'flex', flexDirection: 'column', gap: '10px' },
  select: { padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' },
  textarea: { padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc', minHeight: '80px' },
  reviewBtn: { padding: '10px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' },
  reviewsListSection: { borderTop: '2px solid #eee', paddingTop: '30px' },
  reviewCard: { backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '15px' },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  reviewUser: { margin: 0, fontWeight: 'bold', color: '#333' },
  reviewRating: { margin: '5px 0', color: '#8b5a2b' },
  reviewComment: { margin: 0, color: '#555' },
  editBtn: { padding: '4px 10px', backgroundColor: 'transparent', border: '1px solid #8b5a2b', color: '#8b5a2b', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
  deleteBtn: { padding: '4px 10px', backgroundColor: 'transparent', border: '1px solid red', color: 'red', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
  editBox: { display: 'flex', flexDirection: 'column', gap: '10px' },
  saveBtn: { padding: '8px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  cancelBtn: { padding: '8px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  backLink: { display: 'block', marginTop: '30px', color: '#888', textDecoration: 'none' }
};

export default ProductDetail;