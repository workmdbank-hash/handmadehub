import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSellerProfile, deleteProduct } from '../services/api';
import { toast } from 'react-toastify';

function MyProducts() {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      // We use the seller profile route to get the seller's products!
      const userId = localStorage.getItem('userId');
      const data = await getSellerProfile(userId);
      setSeller(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        toast.success('Product deleted!');
        // Remove from UI instantly
        setSeller({ ...seller, products: seller.products.filter(p => p.id !== id) });
      } catch (error) {
        toast.error('Failed to delete product.');
      }
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (!seller) return <p style={{ textAlign: 'center' }}>Seller profile not found.</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Products</h1>
        <Link to="/seller" style={styles.addBtn}>+ Add New Product</Link>
      </div>
      
      {seller.products.length === 0 ? (
        <p style={{ textAlign: 'center' }}>You haven't listed any products yet.</p>
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
            {seller.products.map((product) => (
              <tr key={product.id}>
                <td style={styles.td}>
                  <img 
                    src={product.imageUrl.startsWith('/images') ? `http://${window.location.hostname}:3000${product.imageUrl}` : product.imageUrl} 
                    alt={product.name} 
                    style={styles.image}
                  />
                </td>
                <td style={styles.td}>{product.name}</td>
                <td style={styles.td}>{product.price} Ks</td>
                <td style={styles.td}>{product.stock}</td>
                <td style={styles.td}>
                  <Link to={`/seller/edit/${product.id}`}>
                    <button style={styles.editBtn}>Edit</button>
                  </Link>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(product.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1000px', margin: '40px auto', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { color: '#8b5a2b', margin: 0 },
  addBtn: { padding: '10px 20px', backgroundColor: '#8b5a2b', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#FDFBF7', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  th: { textAlign: 'left', padding: '15px', borderBottom: '2px solid #8b5a2b', color: '#333' },
  td: { padding: '15px', borderBottom: '1px solid #eee', color: '#555' },
  image: { width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' },
  editBtn: { padding: '6px 12px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '5px', fontSize: '12px' },
  deleteBtn: { padding: '6px 12px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }
};

export default MyProducts;