import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { updateProfileImage, getSellerProfile, deleteProduct } from '../services/api';
import { toast } from 'react-toastify';

function Profile() {
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

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Profile</h1>
      
      {/* UPPER SECTION: User Info */}
      <div style={styles.card}>
        <div style={styles.imageContainer}>
          {profileImage && profileImage !== 'null' ? (
            <img 
              src={profileImage.startsWith('/images') ? `https://handmadehub-6c0t.onrender.com${profileImage}` : profileImage} 
              alt="Profile" 
              style={styles.image}
            />
          ) : (
            <div style={styles.placeholderImage}>
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div style={styles.infoBox}>
          <h2 style={styles.name}>{name}</h2>
          <p style={styles.email}>{email}</p>
          <p style={styles.roleBadge}>{role}</p>
          
          <form onSubmit={handleUpload} style={styles.form}>
            <label style={styles.fileLabel}>Change Profile Picture:</label>
            <div style={styles.fileInputContainer}>
              {/* The actual input is hidden */}
              <input 
                id="fileInput"
                type="file" 
                accept="image/*"
                onChange={handleFileChange} 
                style={{ display: 'none' }}
              />
              {/* The custom label acts as a button */}
              <label htmlFor="fileInput" style={styles.customFileBtn}>
                📁 Choose Image
              </label>
              <span style={styles.fileNameText}>
                {imageFile ? imageFile.name : 'No file chosen'}
              </span>
            </div>
            <button type="submit" style={styles.uploadBtn}>Upload Photo</button>
          </form>
        </div>
      </div>

      {/* LOWER SECTION: My Products (Only for Sellers/Admins) */}
      {(role === 'SELLER' || role === 'ADMIN') && (
        <div style={styles.productsSection}>
          <div style={styles.productsHeader}>
            <h2 style={styles.sectionTitle}>My Products</h2>
            <Link to="/seller" style={styles.addBtn}>+ Add New Product</Link>
          </div>
          
          {!sellerData ? (
            <div className="spinner"></div>
          ) : sellerData.products.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>You haven't listed any products yet.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Image</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Stock</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellerData.products.map((product) => {
                  // NEW: Get the first image from the array
                  const mainImage = product.images && product.images.length > 0 
                    ? product.images[0] 
                    : 'https://placehold.co/400x300?text=No+Image';
                  const imgSrc = mainImage.startsWith('/images') ? `https://handmadehub-6c0t.onrender.com${mainImage}` : mainImage;

                  return (
                    <tr key={product.id}>
                      <td style={styles.td}>
                        <img 
                          src={imgSrc} 
                          alt={product.name} 
                          style={styles.productImage}
                        />
                      </td>
                      <td style={styles.td}>{product.name}</td>
                      <td style={styles.td}>{product.price} Ks</td>
                      <td style={styles.td}>{product.stock}</td>
                      <td style={styles.td}>
                        <Link to={`/seller/edit/${product.id}`}>
                          <button style={styles.editBtn}>Edit</button>
                        </Link>
                        <button style={styles.deleteBtn} onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1000px', margin: '40px auto', padding: '20px' },
  title: { color: '#8b5a2b', textAlign: 'center', marginBottom: '30px' },
  card: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'flex', gap: '40px', alignItems: 'center', marginBottom: '40px' },
  imageContainer: { flexShrink: 0 },
  image: { width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #8b5a2b' },
  placeholderImage: { width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', color: '#8b5a2b', fontWeight: 'bold' },
  infoBox: { flexGrow: 1 },
  name: { margin: '0 0 5px 0', fontSize: '28px', color: '#333' },
  email: { margin: '0 0 15px 0', color: '#666', fontSize: '16px' },
  roleBadge: { display: 'inline-block', padding: '4px 12px', backgroundColor: '#f0f0f0', color: '#333', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  fileLabel: { fontSize: '14px', fontWeight: 'bold', color: '#555' },
  // NEW: Beautiful upload styles
  fileInputContainer: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '15px',
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '8px',
    border: '2px dashed #ccc'
  },
  customFileBtn: { 
    padding: '10px 20px', 
    backgroundColor: '#333', 
    color: 'white', 
    borderRadius: '5px', 
    cursor: 'pointer', 
    fontSize: '14px', 
    fontWeight: 'bold',
    display: 'inline-block'
  },
  fileNameText: { 
    fontSize: '14px', 
    color: '#666', 
    fontStyle: 'italic' 
  },
  uploadBtn: { padding: '10px 15px', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', width: 'fit-content' },
  productsSection: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  productsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sectionTitle: { color: '#8b5a2b', margin: 0 },
  addBtn: { padding: '8px 16px', backgroundColor: '#8b5a2b', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '14px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #eaeaea', color: '#333' },
  td: { padding: '12px', borderBottom: '1px solid #f0f0f0', color: '#555' },
  productImage: { width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' },
  editBtn: { padding: '6px 12px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '5px', fontSize: '12px' },
  deleteBtn: { padding: '6px 12px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }
};

export default Profile;