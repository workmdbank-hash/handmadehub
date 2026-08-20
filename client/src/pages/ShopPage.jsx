import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPublicShop, deleteProduct } from '../services/api';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-toastify';
import { useIsMobile } from '../hooks/useIsMobile';

function ShopPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loggedInUserId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const data = await getPublicShop(slug);
        setShop(data);
        setLoading(false);
      } catch (err) {
        setError('Shop not found or unavailable.');
        setLoading(false);
      }
    };
    fetchShop();
  }, [slug]);

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        toast.success('Product deleted!');
        setShop({
          ...shop,
          seller: {
            ...shop.seller,
            products: shop.seller.products.filter(p => p.id !== id)
          }
        });
      } catch (error) {
        toast.error('Failed to delete product.');
      }
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;
  if (!shop) return null;

  const products = shop.seller?.products || [];
  const isOwner = String(shop.sellerId) === loggedInUserId;

  const sidePadding = isMobile ? '15px' : '40px';

  return (
    <div style={styles.container}>
      {/* Shop Banner */}
      <div style={{...styles.banner, height: isMobile ? '150px' : '250px'}}>
        {shop.banner ? (
          <img src={shop.banner.startsWith('/images') ? `https://handmadehub-mm.onrender.com${shop.banner}` : shop.banner} alt="Shop Banner" style={styles.bannerImg} />
        ) : (
          <div style={styles.bannerPlaceholder}></div>
        )}
      </div>

      {/* Shop Header - VERTICAL STACK */}
      <div style={{...styles.header, padding: `0 ${sidePadding}`}}>
        <div style={styles.logoContainer}>
          {shop.logo ? (
            <img 
              src={shop.logo.startsWith('/images') ? `https://handmadehub-mm.onrender.com${shop.logo}` : shop.logo} 
              alt="Shop Logo" 
              style={{
                ...styles.logo, 
                width: isMobile ? '80px' : '120px', 
                height: isMobile ? '80px' : '120px'
              }} 
            />
          ) : (
            <div 
              style={{
                ...styles.logoPlaceholder, 
                width: isMobile ? '80px' : '120px', 
                height: isMobile ? '80px' : '120px', 
                fontSize: isMobile ? '36px' : '48px'
              }}
            >
              {shop.name.charAt(0)}
            </div>
          )}
        </div>
        
        <div style={styles.headerInfo}>
          <h1 style={{...styles.name, fontSize: isMobile ? '24px' : '32px'}}>{shop.name}</h1>
          <p style={{...styles.description, fontSize: isMobile ? '14px' : '16px'}}>{shop.description || 'Welcome to our shop!'}</p>
          <p style={{...styles.meta, fontSize: isMobile ? '12px' : '14px'}}>
            Processing time: {shop.processingTime || 'N/A'} • {products.length} Products
          </p>
          {isOwner && (
            <Link to="/seller/shop-settings" style={styles.editShopBtn}>Edit Shop Settings</Link>
          )}
        </div>
      </div>

      {/* About Section */}
      {shop.about && (
        <div style={{...styles.section, padding: `0 ${sidePadding}`}}>
          <h2 style={{...styles.sectionTitle, fontSize: isMobile ? '20px' : '24px'}}>About Us</h2>
          <p style={{...styles.sectionText, fontSize: isMobile ? '14px' : '16px'}}>{shop.about}</p>
        </div>
      )}

      {/* Policies Grid */}
      <div style={{...styles.policiesGrid, padding: `0 ${sidePadding}`}}>
        {shop.shippingPolicy && (
          <div style={styles.policyCard}>
            <h3 style={styles.policyTitle}>🚚 Shipping</h3>
            <p style={styles.policyText}>{shop.shippingPolicy}</p>
          </div>
        )}
        {shop.returnPolicy && (
          <div style={styles.policyCard}>
            <h3 style={styles.policyTitle}>↩️ Returns</h3>
            <p style={styles.policyText}>{shop.returnPolicy}</p>
          </div>
        )}
      </div>

      {/* Products */}
      <h2 style={{...styles.productsTitle, padding: `0 ${sidePadding}`, fontSize: isMobile ? '20px' : '24px'}}>Products</h2>
      {products.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>This shop has no products yet.</p>
      ) : (
        <div className="product-grid" style={{...styles.productGrid, padding: `0 ${sidePadding}`}}>
          {products.map((product) => (
            <div key={product.id} style={styles.productWrapper}>
              <ProductCard product={product} />
              {isOwner && (
                <div style={styles.ownerActions}>
                  <Link to={`/seller/edit/${product.id}`} style={styles.editBtn}>✏️ Edit</Link>
                  <button style={styles.deleteBtn} onClick={() => handleDeleteProduct(product.id)}>🗑️ Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 0 40px 0', overflow: 'hidden' },
  
  // Banner
  banner: { width: '100%', overflow: 'hidden', position: 'relative', zIndex: 1 },
  bannerImg: { width: '100%', height: '100%', objectFit: 'cover' },
  bannerPlaceholder: { width: '100%', height: '100%', backgroundColor: '#e0e0e0' },
  
  // NEW: Vertical Flex Column
  header: { 
    display: 'flex', 
    flexDirection: 'column', // Stack vertically!
    alignItems: 'center',    // Center horizontally!
    justifyContent: 'center',
    gap: '15px',             // Space between photo and text
    marginTop: '-60px',      // Pulls logo up over the banner
    position: 'relative', 
    zIndex: 2, 
    marginBottom: '40px',
    textAlign: 'center'
  },
  
  // Logo
  logoContainer: { 
    flexShrink: 0, 
    backgroundColor: '#FDFBF7', 
    borderRadius: '50%', 
    padding: '5px'
  },
  logo: { 
    borderRadius: '50%', 
    objectFit: 'cover', 
    border: '4px solid #FDFBF7', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
    backgroundColor: '#fff' 
  },
  logoPlaceholder: { 
    borderRadius: '50%', 
    backgroundColor: '#8b5a2b', 
    color: 'white', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontWeight: 'bold', 
    border: '4px solid #FDFBF7' 
  },
  
  // Text - Centered
  headerInfo: { 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px'
  },
  name: { margin: 0, color: '#1a1a1a' },
  description: { margin: 0, color: '#666' },
  meta: { margin: 0, color: '#999' },
  editShopBtn: { display: 'inline-block', marginTop: '10px', padding: '8px 16px', backgroundColor: '#1a1a1a', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600' },
  
  // Sections
  section: { marginBottom: '40px' },
  sectionTitle: { color: '#8b5a2b', marginBottom: '15px' },
  sectionText: { color: '#555', lineHeight: '1.8', whiteSpace: 'pre-wrap' },
  
  // Policies
  policiesGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '40px' },
  policyCard: { 
    backgroundColor: '#FDFBF7', 
    padding: '15px', 
    borderRadius: '8px', 
    border: '1px solid #eee',
    boxSizing: 'border-box'
  },
  policyTitle: { margin: '0 0 8px 0', color: '#1a1a1a', fontSize: '16px' },
  policyText: { margin: 0, color: '#666', fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-wrap' },
  
  // Products
  productsTitle: { color: '#8b5a2b', marginBottom: '20px' },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' },
  productWrapper: { display: 'flex', flexDirection: 'column' },
  ownerActions: { display: 'flex', gap: '8px', padding: '10px', backgroundColor: '#fff', borderRadius: '0 0 12px 12px', border: '1px solid #f0f0f0', borderTop: 'none' },
  editBtn: { flex: 1, padding: '8px', backgroundColor: '#1a1a1a', color: 'white', textAlign: 'center', textDecoration: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
  deleteBtn: { flex: 1, padding: '8px', backgroundColor: 'transparent', color: 'red', border: '1px solid red', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }
};

export default ShopPage;