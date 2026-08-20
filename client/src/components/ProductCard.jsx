import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock <= 0;
  
  // NEW: Check if we are currently on a Shop Page
  const location = useLocation();
  const isOnShopPage = location.pathname.startsWith('/shop/');

  const mainImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://placehold.co/400x300/eee/ccc?text=No+Image';
  const imgSrc = mainImage.startsWith('/images') ? `http://${window.location.hostname}:3000${mainImage}` : mainImage;

  return (
    <div style={styles.card} className="product-card">
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={styles.imageContainer}>
          <img 
            src={imgSrc} 
            alt={product.name} 
            style={styles.image}
            className="card-image"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = "https://placehold.co/400x300/eee/ccc?text=No+Image"
            }}
          />
          {isOutOfStock && (<div style={styles.soldOutBadge}>SOLD OUT</div>)}
        </div>
      </Link>
      
      <div style={styles.info} className="card-info">
        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <p style={styles.categoryText}>{product.category}</p>
          <h3 style={styles.name} className="card-name">{product.name}</h3>
        </Link>
        
        {/* NEW: Context-Aware Link */}
        {isOnShopPage ? (
          // If on Shop Page, show Seller Name
          <Link to={`/seller/${product.user?.id}`} style={styles.sellerLink}>by {product.user?.name || 'Unknown'}</Link>
        ) : (
          // If on Home/Wishlist, show Shop Name
          <Link to={`/shop/${product.user?.shop?.slug}`} style={styles.shopLink}>{product.user?.shop?.name || 'Unknown Shop'}</Link>
        )}
        
        {!isOutOfStock && (<p style={styles.stockText} className="card-stock">In Stock: {product.stock}</p>)}
      </div>
      
      <div style={styles.bottomWrapper} className="card-bottom">
        <span style={styles.price} className="card-price">{product.price} Ks</span>
        <button 
          style={isOutOfStock ? styles.disabledBtn : styles.addButton} 
          className="card-btn"
          onClick={() => addToCart(product)}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'Sold Out' : '🛒 Add'}
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
    backgroundColor: '#FDFBF7', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    paddingTop: '75%', 
    backgroundColor: '#faf9f7',
    overflow: 'hidden' 
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease' 
  },
  soldOutBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: '#ff4d4f',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '20px',
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  info: {
    padding: '16px 20px 0 20px',
  },
  categoryText: {
    margin: '0 0 5px 0',
    fontSize: '11px',
    color: '#8b5a2b',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  name: {
    fontSize: '18px',
    margin: 0,
    color: '#1a1a1a',
    fontWeight: '600',
    lineHeight: '1.4'
  },
  // NEW: Style for Shop Link (Home Page)
  shopLink: {
    display: 'block',
    fontSize: '14px',
    margin: '6px 0 0 0',
    color: '#1a1a1a',
    textDecoration: 'none',
    fontWeight: '700'
  },
  // NEW: Style for Seller Link (Shop Page)
  sellerLink: {
    display: 'block',
    fontSize: '14px',
    margin: '6px 0 0 0',
    color: '#666',
    textDecoration: 'none'
  },
  stockText: {
    margin: '8px 0 0 0',
    fontSize: '12px',
    color: '#28a745',
    fontWeight: '600'
  },
  bottomWrapper: {
    padding: '16px 20px',
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #f9f9f9'
  },
  price: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a'
  },
  addButton: {
    padding: '8px 16px',
    backgroundColor: '#1a1a1a', 
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  },
  disabledBtn: {
    padding: '8px 16px',
    backgroundColor: '#e0e0e0',
    color: '#999',
    border: 'none',
    borderRadius: '8px',
    cursor: 'not-allowed',
    fontSize: '13px',
    fontWeight: '600'
  }
};

export default ProductCard;