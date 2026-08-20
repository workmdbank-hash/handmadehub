import React, { useState } from 'react';
import { createProduct } from '../services/api';
import { toast } from 'react-toastify';
import { useIsMobile } from '../hooks/useIsMobile';

function SellerDashboard() {
  const isMobile = useIsMobile(); // NEW
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', salePrice: '', category: 'General', stock: '', materials: '', processingTime: '', sku: ''
  });
  const [imageFiles, setImageFiles] = useState([]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setImageFiles(e.target.files);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('salePrice', formData.salePrice);
      data.append('category', formData.category);
      data.append('stock', formData.stock);
      data.append('materials', formData.materials);
      data.append('processingTime', formData.processingTime);
      data.append('sku', formData.sku);
      
      for (let i = 0; i < imageFiles.length; i++) {
        data.append('images', imageFiles[i]);
      }

      await createProduct(data);
      toast.success('Product created successfully!');
      
      setFormData({ name: '', description: '', price: '', salePrice: '', category: 'General', stock: '', materials: '', processingTime: '', sku: '' });
      setImageFiles([]);
      document.getElementById('fileInput').value = '';
    } catch (error) {
      toast.error('Failed to create product. Are you logged in?');
    }
  };

  // NEW: Dynamic row style based on screen size
  const rowStyle = {
    display: 'flex',
    gap: '15px',
    flexDirection: isMobile ? 'column' : 'row' // Stack vertically on mobile!
  };

  return (
    <div style={styles.container}>
      {/* NEW: Changed Title */}
      <h1 style={{...styles.title, fontSize: isMobile ? '24px' : '32px'}}>Add New Product</h1>
      <p style={{...styles.subtitle, fontSize: isMobile ? '14px' : '16px'}}>Add a new handmade product to your store.</p>
      
      <form style={{...styles.form, padding: isMobile ? '20px' : '40px'}} onSubmit={handleSubmit}>
        <input style={styles.input} type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required />
        <textarea style={{...styles.input, ...styles.textarea}} name="description" placeholder="Product Description" value={formData.description} onChange={handleChange} required />
        
        {/* NEW: Using dynamic rowStyle */}
        <div style={rowStyle}>
          <input style={styles.input} type="number" name="price" placeholder="Price (e.g., 25000)" value={formData.price} onChange={handleChange} required />
          <input style={styles.input} type="number" name="salePrice" placeholder="Sale Price (Optional)" value={formData.salePrice} onChange={handleChange} />
        </div>

        <div style={rowStyle}>
          <input style={styles.input} type="text" name="category" placeholder="Category (e.g., Pottery, Art)" value={formData.category} onChange={handleChange} required />
          <input style={styles.input} type="number" name="stock" placeholder="Stock Quantity" value={formData.stock} onChange={handleChange} required />
        </div>

        <div style={rowStyle}>
          <input style={styles.input} type="text" name="materials" placeholder="Materials (e.g., Wood, Cotton)" value={formData.materials} onChange={handleChange} />
          <input style={styles.input} type="text" name="processingTime" placeholder="Processing Time (e.g., 3-5 days)" value={formData.processingTime} onChange={handleChange} />
        </div>

        <input style={styles.input} type="text" name="sku" placeholder="SKU (Stock Keeping Unit - Optional)" value={formData.sku} onChange={handleChange} />
        
        <div style={styles.fileInputContainer}>
          <input id="fileInput" style={{ display: 'none' }} type="file" accept="image/*" multiple onChange={handleFileChange} />
          <label htmlFor="fileInput" style={styles.customFileBtn}>📁 Choose Images</label>
          <span style={styles.fileNameText}>{imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : 'No files chosen'}</span>
        </div>

        <button style={styles.button} type="submit">Create Product</button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '40px auto', padding: '40px 20px' },
  title: { color: '#8b5a2b', textAlign: 'center', marginBottom: '10px' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: '30px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#FDFBF7', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee' },
  input: { 
    flexGrow: 1, 
    width: '100%', // NEW: Ensure inputs take full width of their container
    height: '48px', 
    padding: '0 16px', 
    fontSize: '16px', 
    border: '1px solid #E0E0E0', 
    borderRadius: '8px', 
    outline: 'none', 
    fontFamily: 'inherit', 
    boxSizing: 'border-box' // NEW: Stops padding from stretching the box
  },
  textarea: { height: 'auto', padding: '12px 16px', minHeight: '120px', lineHeight: '1.6', resize: 'vertical' },
  fileInputContainer: { display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #E0E0E0' },
  customFileBtn: { padding: '10px 20px', backgroundColor: '#333', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  fileNameText: { fontSize: '14px', color: '#666', fontStyle: 'italic' },
  button: { height: '48px', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', cursor: 'pointer', fontWeight: '600' }
};

export default SellerDashboard;