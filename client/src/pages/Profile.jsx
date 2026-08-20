import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { updateProfileImage, getSellerProfile, deleteProduct } from '../services/api';
import { toast } from 'react-toastify';
import { useIsMobile } from '../hooks/useIsMobile';

function Profile() {
  const isMobile = useIsMobile(); // NEW
  const [name, setName] = useState(localStorage.getItem('name') || '');
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [profileImage, setProfileImage] = useState(localStorage.getItem('profileImage'));
  const [imageFile, setImageFile] = useState(null);

  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');
  const [sellerData, setSellerData] = useState(null);

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error('Please choose an image first.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const data = await updateProfileImage(formData);
      
      localStorage.setItem('profileImage', data.profileImage);
      setProfileImage(data.profileImage);
      setImageFile(null);
      document.getElementById('fileInput').value = '';
      toast.success('Profile photo updated!');
    } catch (error) {
      toast.error('Failed to upload photo.');
    }
  };

  useEffect(() => {
    if (role === 'SELLER' || role === 'ADMIN') {
      const fetchSellerData = async () => {
        try {
          const data = await getSellerProfile(userId);
          setSellerData(data);
        } catch (error) {
          console.error("Failed to load seller products");
        }
      };
      fetchSellerData();
    }
  }, [role, userId]);

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        toast.success('Product deleted!');
        setSellerData({ ...sellerData, products: sellerData.products.filter(p => p.id !== id) });
      } catch (error) {
        toast.error('Failed to delete product.');
      }
    }
  };

  const getImgSrc = (path) => path && path.startsWith('/images') ? `http://${window.location.hostname}:3000${path}` : path;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '20px 15px' : '40px 20px' }}>
      <h1 style={{ color: '#8b5a2b', textAlign: 'center', marginBottom: '30px', fontSize: isMobile ? '24px' : '32px' }}>My Profile</h1>
      
      {/* UPPER SECTION: User Info */}
      <div style={{
        ...styles.card,
        flexDirection: isMobile ? 'column' : 'row',
        textAlign: isMobile ? 'center' : 'left',
        padding: isMobile ? '20px' : '30px'
      }}>
        <div style={{ ...styles.imageContainer, marginBottom: isMobile ? '15px' : '0' }}>
          {profileImage && profileImage !== 'null' ? (
            <img src={getImgSrc(profileImage)} alt="Profile" style={styles.image} />
          ) : (
            <div style={styles.placeholderImage}>{name.charAt(0).toUpperCase()}</div>
          )}
        </div>

        <div style={{ ...styles.infoBox, alignItems: isMobile ? 'center' : 'flex-start' }}>
          <h2 style={{ ...styles.name, fontSize: isMobile ? '24px' : '28px' }}>{name}</h2>
          <p style={styles.email}>{email}</p>
          <span style={styles.roleBadge}>{role}</span>
          
          <form onSubmit={handleUpload} style={{ ...styles.form, width: '100%', marginTop: '15px' }}>
            <label style={styles.fileLabel}>Change Profile Picture:</label>
            <div style={{
              ...styles.fileInputContainer,
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: isMobile ? 'center' : 'flex-start',
              gap: '10px'
            }}>
              <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              <label htmlFor="fileInput" style={styles.customFileBtn}>📁 Choose Image</label>
              <span style={styles.fileNameText}>{imageFile ? imageFile.name : 'No file chosen'}</span>
            </div>
            <button type="submit" style={{ ...styles.uploadBtn, width: isMobile ? '100%' : 'fit-content' }}>Upload Photo</button>
          </form>
        </div>
      </div>

      {/* LOWER SECTION: My Products (Only for Sellers/Admins) */}
      {(role === 'SELLER' || role === 'ADMIN') && (
        <div style={styles.productsSection}>
          <div style={styles.productsHeader}>
            <h2 style={{ ...styles.sectionTitle, fontSize: isMobile ? '20px' : '24px' }}>My Products</h2>
            <Link to="/seller" style={styles.addBtn}>+ Add New</Link>
          </div>
          
          {!sellerData ? (
            <div className="spinner"></div>
          ) : sellerData.products.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>You haven't listed any products yet.</p>
          ) : (
            // NEW: Strict 2-column grid on mobile
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: isMobile ? '10px' : '15px'
            }}>
              {sellerData.products.map((product) => {
                const mainImg = product.images && product.images.length > 0 
                  ? product.images[0] 
                  : 'https://placehold.co/400x300/eee/ccc?text=No+Image';
                const imgSrc = getImgSrc(mainImg);

                return (
                  <div key={product.id} style={styles.productItem}>
                    <img src={imgSrc} alt={product.name} style={styles.productImage} />
                    
                    <div style={styles.productInfo}>
                      <h4 style={styles.productName}>{product.name}</h4>
                      <p style={styles.productPrice}>{product.price} Ks</p>
                      <span style={styles.stockBadge}>Stock: {product.stock}</span>
                    </div>

                    <div style={styles.productActions}>
                      <Link to={`/seller/edit/${product.id}`}>
                        <button style={styles.editBtn}>✏️</button>
                      </Link>
                      <button style={styles.deleteBtn} onClick={() => handleDeleteProduct(product.id)}>🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: { 
    backgroundColor: '#fcfcfc', 
    border: 'none', 
    borderRadius: '12px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
    display: 'flex', 
    gap: '40px', 
    alignItems: 'center', 
    marginBottom: '40px', 
    flexWrap: 'wrap',
    overflow: 'hidden'
  },
  imageContainer: { flexShrink: 0 },
  image: { width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #8b5a2b' },
  placeholderImage: { width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', color: '#8b5a2b', fontWeight: 'bold' },
  infoBox: { flexGrow: 1, minWidth: 250, display: 'flex', flexDirection: 'column', gap: '5px' },
  name: { margin: 0, color: '#1a1a1a' },
  email: { margin: 0, color: '#666', fontSize: '16px' },
  roleBadge: { display: 'inline-block', padding: '6px 16px', backgroundColor: '#e0e0e0', color: '#333', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' },
  
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  fileLabel: { fontSize: '14px', fontWeight: '600', color: '#555' },
  fileInputContainer: { display: 'flex', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #E0E0E0' },
  customFileBtn: { padding: '10px 20px', backgroundColor: '#333', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  fileNameText: { fontSize: '14px', color: '#666', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  uploadBtn: { padding: '10px 20px', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },

  productsSection: { backgroundColor: '#fcfcfc', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', padding: '30px', overflow: 'hidden' },
  productsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sectionTitle: { color: '#8b5a2b', margin: 0 },
  addBtn: { padding: '8px 16px', backgroundColor: '#1a1a1a', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px' },
  
  // Vertical Card Layout for Products
  productItem: { 
    display: 'flex', 
    flexDirection: 'column', 
    backgroundColor: '#f9f9f9', 
    borderRadius: '8px', 
    border: '1px solid #eee',
    boxSizing: 'border-box',
    overflow: 'hidden'
  },
  productImage: { width: '100%', height: '120px', objectFit: 'cover', flexShrink: 0 },
  productInfo: { padding: '10px', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px' },
  productName: { margin: 0, fontSize: '14px', color: '#1a1a1a', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' },
  productPrice: { margin: 0, fontSize: '13px', color: '#8b5a2b', fontWeight: '600' },
  stockBadge: { display: 'inline-block', width: 'fit-content', padding: '3px 8px', backgroundColor: '#e0e0e0', color: '#333', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' },
  productActions: { display: 'flex', gap: '8px', padding: '10px', borderTop: '1px solid #eee' },
  editBtn: { flex: 1, padding: '8px', backgroundColor: '#1a1a1a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  deleteBtn: { flex: 1, padding: '8px', backgroundColor: 'transparent', color: 'red', border: '1px solid red', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }
};

export default Profile;