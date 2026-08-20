import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminProducts, deleteProductAdmin } from '../services/api';
import { toast } from 'react-toastify';
import { useIsMobile } from '../hooks/useIsMobile';

function AdminProducts() {
  const isMobile = useIsMobile();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAdminProducts();
        setProducts(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await deleteProductAdmin(id);
        toast.success('Product deleted!');
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        toast.error('Failed to delete.');
      }
    }
  };

  if (loading) return <div className="spinner"></div>;

  let filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.user?.name && p.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (sortOption === 'newest') filteredProducts = [...filteredProducts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sortOption === 'oldest') filteredProducts = [...filteredProducts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  else if (sortOption === 'az') filteredProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
  else if (sortOption === 'za') filteredProducts = [...filteredProducts].sort((a, b) => b.name.localeCompare(a.name));
  else if (sortOption === 'price_low') filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  else if (sortOption === 'price_high') filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);

  // Bulletproof image getter
  const getImgSrc = (product) => {
    let imgSrc = 'https://placehold.co/50x50/eee/ccc?text=No+Img';
    if (product.images && product.images.length > 0) {
      const firstImg = product.images[0];
      imgSrc = firstImg.startsWith('/images') ? `https://handmadehub-mm.onrender.com${firstImg}` : firstImg;
    }
    return imgSrc;
  };

  return (
    <div className="admin-sub-page" style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <h1 style={{ color: '#28a745', margin: 0 }}>Manage Products</h1>
        <Link to="/admin" style={{ padding: '10px 20px', backgroundColor: '#1a1a1a', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' }}>← Back</Link>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search product or seller..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flexGrow: 1, minWidth: '200px', height: '40px', padding: '0 15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px' }} />
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} style={{ height: '40px', padding: '0 15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', cursor: 'pointer' }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="az">Name (A-Z)</option>
          <option value="za">Name (Z-A)</option>
          <option value="price_low">Price (Low to High)</option>
          <option value="price_high">Price (High to Low)</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>No products found.</p>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredProducts.map(p => (
            <div key={p.id} style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '15px', display: 'flex', gap: '15px' }}>
              {/* NEW: Product Image */}
              <img src={getImgSrc(p)} alt={p.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>{p.name}</strong>
                  <button style={{ padding: '5px 10px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }} onClick={() => handleDelete(p.id)}>Delete</button>
                </div>
                <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>{p.price} Ks</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>by {p.user?.name || 'Unknown'}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead><tr style={{ borderBottom: '2px solid #28a745' }}>
              <th style={styles.th}>Image</th><th style={styles.th}>ID</th><th style={styles.th}>Name</th><th style={styles.th}>Price</th><th style={styles.th}>Seller</th><th style={styles.th}>Action</th>
            </tr></thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={styles.td}>
                    {/* NEW: Product Image */}
                    <img src={getImgSrc(p)} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} />
                  </td>
                  <td style={styles.td}>{p.id}</td><td style={styles.td}>{p.name}</td><td style={styles.td}>{p.price} Ks</td><td style={styles.td}>{p.user?.name || 'Unknown'}</td>
                  <td style={styles.td}><button style={{ padding: '6px 12px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }} onClick={() => handleDelete(p.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  th: { textAlign: 'left', padding: '12px', color: '#666', fontSize: '12px', textTransform: 'uppercase' },
  td: { padding: '15px 12px', color: '#333', fontSize: '15px' }
};

export default AdminProducts;