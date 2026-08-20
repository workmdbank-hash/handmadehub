import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSellerProfile, getSellerReviews } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useIsMobile } from '../hooks/useIsMobile';

function SellerProfile() {
  const { id } = useParams();
  const isMobile = useIsMobile(); // NEW
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [ratingData, setRatingData] = useState({ averageRating: 0, totalReviews: 0, reviews: [] });

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const data = await getSellerProfile(id);
        setSeller(data);
        setLoading(false);

        const reviewsData = await getSellerReviews(id);
        setRatingData(reviewsData);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchSeller();
  }, [id]);

  if (loading) return <div className="spinner"></div>;
  if (!seller) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Seller not found.</p>;

  const memberSince = new Date(seller.createdAt).toLocaleDateString();
  const products = seller.products || [];

  return (
    <div style={styles.container}>
      {/* Seller Info Header */}
      <div style={{
        ...styles.headerCard,
        flexDirection: isMobile ? 'column' : 'row',
        textAlign: isMobile ? 'center' : 'left',
        padding: isMobile ? '20px' : '30px'
      }}>
        <div style={styles.imageContainer}>
          {seller.profileImage ? (
            <img 
              src={seller.profileImage.startsWith('/images') ? `https://handmadehub-mm.onrender.com${seller.profileImage}` : seller.profileImage} 
              alt={seller.name} 
              style={styles.image}
            />
          ) : (
            <div style={styles.placeholderImage}>
              {seller.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div style={{
          ...styles.infoBox,
          alignItems: isMobile ? 'center' : 'flex-start'
        }}>
          <h1 style={{...styles.name, fontSize: isMobile ? '24px' : '32px'}}>{seller.name}</h1>
          <p style={styles.memberSince}>Member since {memberSince}</p>
          <p style={styles.productCount}>{products.length} Products Listed</p>
          
          {seller.shop && (
            <Link to={`/shop/${seller.shop.slug}`} style={styles.viewShopBtn}>
              🏪 Visit {seller.shop.name}
            </Link>
          )}
          
          {ratingData.totalReviews > 0 ? (
            <div style={styles.ratingBox}>
              <span style={styles.ratingText}>⭐ {ratingData.averageRating} / 5</span>
              <span style={styles.reviewCount}>({ratingData.totalReviews} reviews)</span>
            </div>
          ) : (
            <p style={styles.noReviewsText}>No seller reviews yet</p>
          )}
        </div>
      </div>

      {/* Seller's Products */}
      <h2 style={{...styles.sectionTitle, fontSize: isMobile ? '20px' : '24px'}}>Products by {seller.name}</h2>
      
      {products.length === 0 ? (
        <p style={{ textAlign: 'center' }}>This seller hasn't listed any products yet.</p>
      ) : (
        <div className="product-grid" style={{
          ...styles.productGrid,
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: isMobile ? '10px' : '25px'
        }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Seller Reviews Section */}
      {ratingData.totalReviews > 0 && (
        <div style={styles.reviewsSection}>
          <h2 style={{...styles.sectionTitle, fontSize: isMobile ? '20px' : '24px'}}>Seller Reviews</h2>
          {ratingData.reviews.map((review) => (
            <div key={review.id} style={styles.reviewCard}>
              <p style={styles.reviewUser}>{review.buyer?.name || 'Anonymous'}</p>
              <p style={styles.reviewRating}>Rating: {"⭐".repeat(review.rating)}</p>
              <p style={styles.reviewComment}>{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  headerCard: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '30px', 
    backgroundColor: '#FDFBF7', 
    padding: '30px', 
    borderRadius: '12px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
    marginBottom: '40px' 
  },
  imageContainer: { flexShrink: 0, marginBottom: '10px' },
  image: { width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #8b5a2b' },
  placeholderImage: { 
    width: '120px', 
    height: '120px', 
    borderRadius: '50%', 
    backgroundColor: '#eaeaea', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '50px', 
    color: '#8b5a2b', 
    fontWeight: 'bold' 
  },
  infoBox: { 
    flexGrow: 1, 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '8px'
  },
  name: { margin: 0, color: '#1a1a1a' },
  memberSince: { margin: 0, color: '#666', fontSize: '14px' },
  productCount: { margin: 0, color: '#8b5a2b', fontSize: '16px', fontWeight: 'bold' },
  viewShopBtn: { 
    display: 'inline-block', 
    marginTop: '10px', 
    padding: '8px 16px', 
    backgroundColor: '#1a1a1a', 
    color: 'white', 
    textDecoration: 'none', 
    borderRadius: '8px', 
    fontSize: '14px', 
    fontWeight: '600' 
  },
  ratingBox: { marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' },
  ratingText: { fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a' },
  reviewCount: { fontSize: '14px', color: '#666' },
  noReviewsText: { marginTop: '10px', fontSize: '14px', color: '#999' },
  sectionTitle: { color: '#1a1a1a', borderBottom: '2px solid #eaeaea', paddingBottom: '10px', marginBottom: '30px' },
  productGrid: { display: 'grid' },
  reviewsSection: { marginTop: '40px' },
  reviewCard: { 
    backgroundColor: '#FDFBF7', 
    padding: '15px', 
    borderRadius: '8px', 
    border: '1px solid #eee', 
    marginBottom: '15px' 
  },
  reviewUser: { margin: '0 0 5px 0', fontWeight: 'bold', color: '#1a1a1a' },
  reviewRating: { margin: '5px 0', color: '#8b5a2b' },
  reviewComment: { margin: 0, color: '#555' }
};

export default SellerProfile;