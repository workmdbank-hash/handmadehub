import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, updateProduct } from '../services/api';
import { toast } from 'react-toastify';
import { useIsMobile } from '../hooks/useIsMobile';

function EditProduct() {
  const isMobile = useIsMobile(); // NEW
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', salePrice: '', category: '', stock: '', materials: '', processingTime: '', sku: ''
  });
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
        setFormData({
          name: data.name,
          description: data.description,
          price: data.price,
          salePrice: data.salePrice || '',
          category: data.category,
          stock: data.stock,
          materials: data.materials || '',
          processingTime: data.processingTime || '',
          sku: data.sku || ''
        });
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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

      await updateProduct(id, data);
      toast.success('Product updated successfully!');
      navigate('/profile');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update product.');
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (!product) return <p style={{ textAlign: 'center' }}>Product not found.</p>;

  let currentImgSrc = 'https://placehold.co/400x300?text=No+Image';
  if (product.images && product.images.length > 0) {
    const firstImg = product.images[0];
    currentImgSrc = firstImg.startsWith('/images') ? `http://${window.location.hostname}:3000${firstImg}` : firstImg;
  }

  // NEW: Dynamic row style based on screen size
  const rowStyle = {
    display: 'flex',
    gap: '15px',
    flexDirection: isMobile ? 'column' : 'row'
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: isMobile ? '20px 15px' : '40px 20px' }}>
      <h1 style={{ color: '#8b5a2b', textAlign: 'center', marginBottom: '30px', fontSize: isMobile ? '24px' : '32px' }}>Edit Product</h1>
      
      <form style={{...styles.form, padding: isMobile ? '20px' : '40px'}} onSubmit={handleSubmit}>
        <input style={styles.input} type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required />
        <textarea style={{...styles.input, ...styles.textarea}} name="description" placeholder="Product Description" value={formData.description} onChange={handleChange} required />
        
        {/* NEW: Using dynamic rowStyle */}
        <div style={rowStyle}>
          <input style={styles.input} type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required />
          <input style={styles.input} type="number" name="salePrice" placeholder="Sale Price (Optional)" value={formData.salePrice} onChange={handleChange} />
        </div>

        <div style={rowStyle}>
          <input style={styles.input} type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required />
          <input style={styles.input} type="number" name="stock" placeholder="Stock Quantity" value={formData.stock} onChange={handleChange} required />
        </div>

        <div style={rowStyle}>
          <input style={styles.input} type="text" name="materials" placeholder="Materials" value={formData.materials} onChange={handleChange} />
          <input style={styles.input} type="text" name="processingTime" placeholder="Processing Time" value={formData.processingTime} onChange={handleChange} />
        </div>

        <input style={styles.input} type="text" name="sku" placeholder="SKU (Optional)" value={formData.sku} onChange={handleChange} />
        
        {/* Image Previews */}
        <div style={{...styles.currentImageBox, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'flex-start'}}>
          <p style={styles.fileLabel}>Current Image:</p>
          <img src={currentImgSrc} alt="Current" style={{...styles.currentImage, width: isMobile ? '100%' : '150px', height: isMobile ? 'auto' : '150px'}} />
        </div>

        <div>
          <label style={styles.fileLabel}>Change Images (Leave blank to keep current):</label>
          <div style={styles.fileInputContainer}>
            <input id="fileInput" style={{ display: 'none' }} type="file" accept="image/*" multiple onChange={handleFileChange} />
            <label htmlFor="fileInput" style={styles.customFileBtn}>📁 Choose Images</label>
            <span style={styles.fileNameText}>{imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : 'No files chosen'}</span>
          </div>
        </div>

        <button style={styles.button} type="submit">Update Product</button>
      </form>
    </div>
  );
}

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#FDFBF7', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee' },
  input: { 
    flexGrow: 1, 
    width: '100%', 
    height: '48px', 
    padding: '0 16px', 
    fontSize: '16px', 
    border: '1px solid #E0E0E0', 
    borderRadius: '8px', 
    outline: 'none', 
    fontFamily: 'inherit', 
    boxSizing: 'border-box' 
  },
  textarea: { height: 'auto', padding: '12px 16px', minHeight: '120px', lineHeight: '1.6', resize: 'vertical' },
  currentImageBox: { display: 'flex', gap: '15px' },
  currentImage: { objectFit: 'cover', borderRadius: '8px', border: '1px solid #E0E0E0' },
  fileLabel: { fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '5px', display: 'block' },
  fileInputContainer: { display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #E0E0E0' },
  customFileBtn: { padding: '10px 20px', backgroundColor: '#333', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  fileNameText: { fontSize: '14px', color: '#666', fontStyle: 'italic' },
  button: { height: '48px', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', cursor: 'pointer', fontWeight: '600' }
};

export default EditProduct;