import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, updateProduct } from '../services/api';
import { toast } from 'react-toastify';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: '', stock: ''
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
        // Pre-fill the form with current product data
        setFormData({
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          stock: data.stock
        });
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
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
      if (imageFile) {
        data.append('image', imageFile);
      }

      await updateProduct(id, data);
      toast.success('Product updated successfully!');
      navigate('/seller/my-products');
    } catch (error) {
      toast.error('Failed to update product.');
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (!product) return <p style={{ textAlign: 'center' }}>Product not found.</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Edit Product</h1>
      
      <form style={styles.form} onSubmit={handleSubmit}>
        <input style={styles.input} type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required />
        <textarea style={styles.textarea} name="description" placeholder="Product Description" value={formData.description} onChange={handleChange} required />
        <input style={styles.input} type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required />
        <input style={styles.input} type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required />
        <input style={styles.input} type="number" name="stock" placeholder="Stock Quantity" value={formData.stock} onChange={handleChange} required />
        
        <div>
          <label style={styles.fileLabel}>Change Image (Leave blank to keep current):</label>
          <input id="fileInput" style={styles.fileInput} type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <button style={styles.button} type="submit">Update Product</button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '40px auto', padding: '20px' },
  title: { color: '#8b5a2b', textAlign: 'center', marginBottom: '30px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  input: { padding: '12px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' },
  textarea: { padding: '12px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', minHeight: '100px' },
  fileLabel: { fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '5px', display: 'block' },
  fileInput: { fontSize: '14px', width: '100%' },
  button: { padding: '12px', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '5px', fontSize: '18px', cursor: 'pointer', marginTop: '10px' }
};

export default EditProduct;