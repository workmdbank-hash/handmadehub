// SellerDashboard.jsx
import React, { useState } from 'react';
import { createProduct } from '../services/api';
import { toast } from 'react-toastify';

function SellerDashboard() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'General',
    stock: ''
  });
  const [imageFiles, setImageFiles] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('stock', formData.stock);
      
      for (let i = 0; i < imageFiles.length; i++) {
        data.append('images', imageFiles[i]);
      }

      await createProduct(data);
      toast.success('Product created successfully!');
      
      // Clear the form
      setFormData({ name: '', description: '', price: '', category: 'General', stock: '' });
      setImageFiles([]);
      document.getElementById('fileInput').value = '';
    } catch (error) {
      console.error(error);
      toast.error('Failed to create product. Are you logged in?');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Seller Dashboard</h1>
      <p style={styles.subtitle}>Add a new handmade product to your store.</p>
      
      <form style={styles.form} onSubmit={handleSubmit}>
        <input style={styles.input} type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required />
        <textarea style={styles.textarea} name="description" placeholder="Product Description" value={formData.description} onChange={handleChange} required />
        <input style={styles.input} type="number" name="price" placeholder="Price (e.g., 25000)" value={formData.price} onChange={handleChange} required />
        <input style={styles.input} type="text" name="category" placeholder="Category (e.g., Pottery, Candles, Art)" value={formData.category} onChange={handleChange} required />
        <input style={styles.input} type="number" name="stock" placeholder="Stock Quantity (e.g., 10)" value={formData.stock} onChange={handleChange} required />
        
        {/* NEW: Beautiful Custom File Upload */}
        <div>
          <label style={styles.fileLabel}>Product Images (You can select multiple):</label>
          <div style={styles.fileInputContainer}>
            {/* The actual input is hidden */}
            <input 
              id="fileInput"
              style={{ display: 'none' }} 
              type="file" 
              accept="image/*"
              multiple 
              onChange={handleFileChange} 
            />
            {/* The custom label acts as a button */}
            <label htmlFor="fileInput" style={styles.customFileBtn}>
              📁 Choose Images
            </label>
            <span style={styles.fileNameText}>
              {imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : 'No files chosen'}
            </span>
          </div>
        </div>

        <button style={styles.button} type="submit">Create Product</button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '40px auto', padding: '20px' },
  title: { color: '#8b5a2b', textAlign: 'center' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: '30px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  input: { padding: '12px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' },
  textarea: { padding: '12px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', minHeight: '100px' },
  fileLabel: { fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '5px', display: 'block' },
  // NEW: Styles for the beautiful upload button
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
    display: 'inline-block',
    transition: 'background-color 0.2s'
  },
  fileNameText: { 
    fontSize: '14px', 
    color: '#666', 
    fontStyle: 'italic' 
  },
  button: { padding: '12px', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '5px', fontSize: '18px', cursor: 'pointer', marginTop: '10px' }
};

export default SellerDashboard;