// SellerProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSellerProfile } from '../services/api';
import ProductCard from '../components/ProductCard';


function SellerProfile() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const data = await getSellerProfile(id);
        setSeller(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchSeller();
  }, [id]);

  if (loading) return <div className="spinner"></div>;
  if (!seller) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Seller not found.</p>;

  // Format the date nicely
  const memberSince = new Date(seller.createdAt).toLocaleDateString();

  return (
    <div style={styles.container}>
      {/* Seller Info Header */}
      <div style={styles.headerCard}>
        <div style={styles.imageContainer}>
          {seller.profileImage ? (
            <img 
              src={seller.profileImage.startsWith('/images') ? `https://handmadehub-6c0t.onrender.com${seller.profileImage}` : seller.profileImage} 
              alt={seller.name} 
              style={styles.image}
            />
          ) : (
            <div style={styles.placeholderImage}>
              {seller.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div style={styles.infoBox}>
          <h1 style={styles.name}>{seller.name}</h1>
          <p style={styles.memberSince}>Member since {memberSince}</p>
          <p style={styles.productCount}>{seller.products.length} Products Listed</p>
        </div>
      </div>

      {/* Seller's Products */}
      <h2 style={styles.sectionTitle}>Products by {seller.name}</h2>
      
      {seller.products.length === 0 ? (
        <p style={{ textAlign: 'center' }}>This seller hasn't listed any products yet.</p>
      ) : (
        <div className="product-grid" style={styles.productGrid}>
          {seller.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '30px' },
  headerCard: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '30px', 
    backgroundColor: '#fff', 
    padding: '30px', 
    borderRadius: '12px', 
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)', 
    marginBottom: '40px' 
  },
  imageContainer: { flexShrink: 0 },
  image: { width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #8b5a2b' },
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
  infoBox: { flexGrow: 1 },
  name: { margin: '0 0 10px 0', fontSize: '32px', color: '#333' },
  memberSince: { margin: '0 0 5px 0', color: '#666', fontSize: '16px' },
  productCount: { margin: 0, color: '#8b5a2b', fontSize: '16px', fontWeight: 'bold' },
  sectionTitle: { color: '#333', borderBottom: '2px solid #eaeaea', paddingBottom: '10px', marginBottom: '30px' },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' }
};

export default SellerProfile;