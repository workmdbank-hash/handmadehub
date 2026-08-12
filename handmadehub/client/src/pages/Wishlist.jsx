// Wishlist.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyWishlist, removeFromWishlist } from '../services/api';

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const data = await getMyWishlist();
      setWishlist(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (id) => {
    try {
      await removeFromWishlist(id);
      // Instantly update UI
      setWishlist(wishlist.filter(item => item.id !== id));
    } catch (error) {
      alert('Failed to remove item.');
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading wishlist...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Wishlist</h1>
      
      {wishlist.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Your wishlist is empty.</p>
      ) : (
        <div className="detail-grid" style={styles.grid}>
          {wishlist.map((item) => (
            <div key={item.id} style={styles.card}>
              <Link to={`/product/${item.product.id}`}>
                <img 
                  src={item.product.imageUrl.startsWith('/images') ? `http://localhost:3000${item.product.imageUrl}` : item.product.imageUrl} 
                  alt={item.product.name} 
                  style={styles.image}
                />
                <h3 style={styles.name}>{item.product.name}</h3>
                <p style={styles.price}>{item.product.price} Ks</p>
              </Link>
              <button style={styles.removeBtn} onClick={() => handleRemove(item.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1000px', margin: '40px auto', padding: '20px' },
  title: { color: '#8b5a2b', textAlign: 'center', marginBottom: '30px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' },
  card: { border: '1px solid #eee', borderRadius: '8px', padding: '10px', textAlign: 'center' },
  image: { width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px' },
  name: { fontSize: '16px', color: '#333', margin: '10px 0 5px 0' },
  price: { color: '#8b5a2b', fontWeight: 'bold', margin: 0 },
  removeBtn: { marginTop: '10px', padding: '5px 10px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default Wishlist;