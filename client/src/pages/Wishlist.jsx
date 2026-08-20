import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyWishlist, removeFromWishlist } from '../services/api';
import { toast } from 'react-toastify';
import { useIsMobile } from '../hooks/useIsMobile';

function Wishlist() {
  const isMobile = useIsMobile(); // NEW
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
      setWishlist(wishlist.filter(item => item.id !== id));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item.');
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div style={{...styles.container, padding: isMobile ? '20px 10px' : '40px 20px'}}>
      <h1 style={{...styles.title, fontSize: isMobile ? '24px' : '32px', marginBottom: isMobile ? '20px' : '30px'}}>My Wishlist</h1>
      
      {wishlist.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Your wishlist is empty.</p>
      ) : (
        // NEW: Strictly 2 columns on mobile, auto-fill on desktop
        <div style={{...styles.grid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: isMobile ? '10px' : '20px'}}>
          {wishlist.map((item) => {
            // Bulletproof image getter
            let imgSrc = 'https://placehold.co/200x150/eee/ccc?text=No+Img';
            if (item.product.images && item.product.images.length > 0) {
              const firstImg = item.product.images[0];
              imgSrc = firstImg.startsWith('/images') ? `http://${window.location.hostname}:3000${firstImg}` : firstImg;
            }

            return (
              <div key={item.id} style={styles.card}>
                <Link to={`/product/${item.product.id}`}>
                  <img 
                    src={imgSrc} 
                    alt={item.product.name} 
                    style={styles.image}
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = "https://placehold.co/200x150/eee/ccc?text=No+Img"
                    }}
                  />
                  <h3 style={styles.name}>{item.product.name}</h3>
                  <p style={styles.price}>{item.product.price} Ks</p>
                </Link>
                <button style={styles.removeBtn} onClick={() => handleRemove(item.id)}>
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto' },
  title: { color: '#8b5a2b', textAlign: 'center' },
  grid: { display: 'grid' },
  card: { 
    border: '1px solid #eee', 
    borderRadius: '8px', 
    padding: '10px', 
    textAlign: 'center', 
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  image: { width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px' },
  name: { 
    fontSize: '16px', 
    color: '#333', 
    margin: '10px 0 5px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis', // Stops long names from breaking the grid
    width: '100%'
  },
  price: { color: '#8b5a2b', fontWeight: 'bold', margin: '0 0 10px 0' },
  removeBtn: { 
    marginTop: 'auto', 
    padding: '5px 10px', 
    backgroundColor: 'red', 
    color: 'white', 
    border: 'none', 
    borderRadius: '5px', 
    cursor: 'pointer', 
    fontSize: '12px',
    width: '100%'
  }
};

export default Wishlist;