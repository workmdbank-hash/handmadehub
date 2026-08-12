import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock <= 0;

  // NEW: Get the first image from the array
  const mainImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://placehold.co/400x300?text=No+Image';

  const imgSrc = mainImage.startsWith('/images') ? `https://handmadehub-6c0t.onrender.com${mainImage}` : mainImage;

  return (
    <div style={styles.card} className="product-card">
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={styles.imageContainer}>
          <img 
            src={imgSrc} 
            alt={product.name} 
            style={styles.image}
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = "https://placehold.co/400x300?text=No+Image"
            }}
          />
          {isOutOfStock && (
            <div style={styles.soldOutBadge}>SOLD OUT</div>
          )}
        </div>
        
        <div style={styles.info}>
          <p style={styles.categoryText}>{product.category}</p>
          <h3 style={styles.name}>{product.name}</h3>
          <Link to={`/seller/${product.userId}`} style={styles.seller}>by {product.user?.name || 'Unknown Seller'}</Link>
          
          {!isOutOfStock && (
            <p style={styles.stockText}>In Stock: {product.stock}</p>
          )}
        </div>
      </Link>
      
      <div style={styles.bottomWrapper}>
        <span style={styles.price}>{product.price} Ks</span>
        <button 
          style={isOutOfStock ? styles.disabledBtn : styles.addButton} 
          onClick={() => addToCart(product)}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'Sold Out' : '🛒 Add to Cart'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #f0f0f0',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '220px',
    backgroundColor: '#faf9f7'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  soldOutBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: '#ff4d4f',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  info: { padding: '16px 20px 0 20px' },
  categoryText: { margin: '0 0 5px 0', fontSize: '11px', color: '#8b5a2b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' },
  name: { fontSize: '18px', margin: 0, color: '#1a1a1a', fontWeight: '600', lineHeight: '1.4' },
  seller: { display: 'block', fontSize: '13px', margin: '6px 0 0 0', color: '#666', textDecoration: 'none' },
  stockText: { margin: '8px 0 0 0', fontSize: '12px', color: '#28a745', fontWeight: '600' },
  bottomWrapper: { padding: '16px 20px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f9f9f9' },
  price: { fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a' },
  addButton: { padding: '8px 16px', backgroundColor: '#1a1a1a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'background-color 0.2s' },
  disabledBtn: { padding: '8px 16px', backgroundColor: '#e0e0e0', color: '#999', border: 'none', borderRadius: '8px', cursor: 'not-allowed', fontSize: '13px', fontWeight: '600' }
};

export default ProductCard;