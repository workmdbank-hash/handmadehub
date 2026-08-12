// Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

function Header() {
  const { cartItems, toggleCart } = useCart(); 
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name');
  const profileImage = localStorage.getItem('profileImage');

  // NEW: Check if user can see seller links
  const canSell = role === 'SELLER' || role === 'ADMIN';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${searchTerm}`);
    } else {
      navigate('/');
    }
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('profileImage');
    toast.success('Logged out successfully!');
    navigate('/');
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header style={styles.header}>
      {/* TOP ROW: Logo, User Actions, Cart */}
      <div style={styles.topRow}>
        <Link to="/" style={styles.logo} onClick={closeMenu}>
          HandmadeHub
        </Link>

        {/* Desktop Navigation (Hidden on mobile) */}
        <nav style={styles.nav} className="desktop-nav">
          <Link to="/" style={styles.navLink}>Home</Link>
          {/* NEW: Only show Sell and My Sales if canSell is true */}
          {canSell && (
            <>
              <Link to="/seller" style={styles.navLink}>Sell</Link>
              <Link to="/seller-orders" style={styles.navLink}>My Sales</Link>
            </>
          )}
          <Link to="/myorders" style={styles.navLink}>My Orders</Link>
          <Link to="/wishlist" style={styles.navLink}>Wishlist</Link>
          {role === 'ADMIN' && (
            <Link to="/admin" style={styles.navLink}>Admin</Link>
          )}
          {token && (
            <button style={styles.logoutLink} onClick={handleLogout}>Logout</button>
          )}
        </nav>

        <div style={styles.rightActions}>
          {token ? (
            <div style={styles.userBox} className="user-box">
              <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {profileImage && profileImage !== 'null' ? (
                  <img src={profileImage.startsWith('/images') ? `http://localhost:3000${profileImage}` : profileImage} alt="Profile" style={styles.headerProfileImg} />
                ) : (
                  <div style={styles.headerPlaceholder}>{name.charAt(0).toUpperCase()}</div>
                )}
                <span style={styles.welcome}>Hi, {name}</span>
              </Link>
            </div>
          ) : (
            <div style={styles.authBox} className="auth-box">
              <Link to="/register" style={{ textDecoration: 'none' }} onClick={closeMenu}>
                <button style={styles.btn}>Register</button>
              </Link>
              <Link to="/login" style={{ textDecoration: 'none' }} onClick={closeMenu}>
                <button style={styles.btn}>Login</button>
              </Link>
            </div>
          )}
          <button style={styles.cartBtn} onClick={() => { toggleCart(); closeMenu(); }}>
            Cart ({cartItems.length})
          </button>
        </div>
      </div>

      {/* BOTTOM ROW: Menu Button + Search Bar */}
      <div style={styles.bottomRow}>
        <button className="mobile-menu-btn" style={styles.menuBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✖' : '☰'}
        </button>
        
        <form onSubmit={handleSearch} style={styles.searchForm} className="search-form">
          <input type="text" placeholder="Search handmade items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
          <button type="submit" style={styles.searchBtn}>Search</button>
        </form>
      </div>

      {/* Mobile Dropdown Navigation */}
      {isMenuOpen && (
        <nav className="mobile-nav" style={styles.mobileNav}>
          <Link to="/" style={styles.mobileNavLink} onClick={closeMenu}>Home</Link>
          {/* NEW: Only show Sell and My Sales if canSell is true */}
          {canSell && (
            <>
              <Link to="/seller" style={styles.mobileNavLink} onClick={closeMenu}>Sell</Link>
              <Link to="/seller-orders" style={styles.mobileNavLink} onClick={closeMenu}>My Sales</Link>
            </>
          )}
          <Link to="/myorders" style={styles.mobileNavLink} onClick={closeMenu}>My Orders</Link>
          <Link to="/wishlist" style={styles.mobileNavLink} onClick={closeMenu}>Wishlist</Link>
          {token && (
            <Link to="/profile" style={styles.mobileNavLink} onClick={closeMenu}>My Profile</Link>
          )}
          {role === 'ADMIN' && (
            <Link to="/admin" style={styles.mobileNavLink} onClick={closeMenu}>Admin</Link>
          )}
          
          {!token ? (
            <div style={styles.mobileAuthRow}>
              <Link to="/register" style={{ textDecoration: 'none', width: '48%' }} onClick={closeMenu}><button style={styles.mobileAuthBtn}>Register</button></Link>
              <Link to="/login" style={{ textDecoration: 'none', width: '48%' }} onClick={closeMenu}><button style={styles.mobileAuthBtn}>Login</button></Link>
            </div>
          ) : (
            <div style={styles.mobileAuthRow}>
              <button style={styles.mobileLogoutBtn} onClick={handleLogout}>Logout</button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}

const styles = {
  header: { backgroundColor: '#ffffff', borderBottom: '1px solid #eaeaea', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100, padding: '15px 20px', display: 'flex', flexDirection: 'column', gap: '15px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  logo: { fontSize: '24px', fontWeight: 'bold', color: '#8b5a2b', textDecoration: 'none' },
  nav: { display: 'flex', gap: '20px', alignItems: 'center' },
  navLink: { textDecoration: 'none', color: '#333', fontSize: '16px', fontWeight: '500' },
  logoutLink: { background: 'none', border: 'none', color: '#8b5a2b', fontSize: '16px', fontWeight: '500', cursor: 'pointer', padding: 0 },
  rightActions: { display: 'flex', alignItems: 'center', gap: '15px' },
  userBox: { display: 'flex', alignItems: 'center', gap: '10px' },
  headerProfileImg: { width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ccc' },
  headerPlaceholder: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#8b5a2b', fontWeight: 'bold' },
  welcome: { fontSize: '14px', color: '#333', fontWeight: 'bold' },
  authBox: { display: 'flex', alignItems: 'center', gap: '10px' },
  btn: { padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid #8b5a2b', color: '#8b5a2b', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  cartBtn: { padding: '8px 16px', backgroundColor: '#8b5a2b', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
    // Bottom Row (Menu + Search)
  bottomRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    justifyContent: 'center' // NEW: Centers the search bar group
  },
  menuBtn: {
    display: 'none', 
    background: 'none',
    border: '1px solid #ccc',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#8b5a2b',
    padding: '8px 12px',
    borderRadius: '5px',
    height: '42px'
  },
  searchForm: {
    display: 'flex',
    flexGrow: 1,
    width: '100%',
    maxWidth: '600px', // Stops it from getting too wide on desktop
    margin: '0 auto' // NEW: Perfectly centers the search bar itself!
  },
  searchInput: { flexGrow: 1, padding: '10px 12px', border: '1px solid #ccc', borderRadius: '5px 0 0 5px', fontSize: '16px', outline: 'none' },
  searchBtn: { padding: '10px 20px', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '0 5px 5px 0', cursor: 'pointer', fontSize: '16px' },
  mobileNav: { display: 'flex', flexDirection: 'column', gap: '5px', paddingBottom: '15px', borderTop: '1px solid #eaeaea', paddingTop: '15px' },
  mobileNavLink: { textDecoration: 'none', color: '#333', fontSize: '18px', fontWeight: '500', padding: '12px 10px', borderBottom: '1px solid #eee' },
  mobileAuthRow: { display: 'flex', justifyContent: 'space-between', padding: '15px 10px 0 10px', gap: '10px' },
  mobileAuthBtn: { padding: '12px', backgroundColor: 'transparent', border: '1px solid #8b5a2b', color: '#8b5a2b', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', width: '100%' },
  mobileLogoutBtn: { padding: '12px', backgroundColor: 'transparent', border: '1px solid red', color: 'red', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', width: '100%' }
};

export default Header;