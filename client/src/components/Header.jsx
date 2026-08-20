import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { getUnreadCount, getMyNotifications, markNotificationsRead } from '../services/api';

function Header() {
  const { cartItems, toggleCart } = useCart(); 
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name');
  const profileImage = localStorage.getItem('profileImage');

  const canSell = role === 'SELLER' || role === 'ADMIN';

  const [unreadMessages, setUnreadMessages] = useState(0);
  const prevMessagesRef = useRef(0);

  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState({ total: 0, ORDER_SELLER: 0, ORDER_BUYER: 0, REVIEW: 0 });
  const prevNotifsRef = useRef(0);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) { navigate(`/?search=${searchTerm}`); } else { navigate('/'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('profileImage');
    localStorage.removeItem('shopSlug');
    toast.success('Logged out successfully!');
    navigate('/');
    setShowUserMenu(false);
  };

  useEffect(() => {
    if (!token) return;
    const checkUnread = async () => {
      try {
        const data = await getUnreadCount();
        if (data.count > prevMessagesRef.current) { toast.info(`💬 You have ${data.count} new message(s)!`); }
        prevMessagesRef.current = data.count;
        setUnreadMessages(data.count);
      } catch (error) {}
    };
    checkUnread();
    const interval = setInterval(checkUnread, 10000); 
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const fetchNotifs = async () => {
      try {
        const data = await getMyNotifications();
        setNotifications(data.notifications);
        setUnreadNotifs(data.unreadCounts);
        if (data.unreadCounts.total > prevNotifsRef.current) {
          const newNotifs = data.notifications.filter(n => !n.isRead);
          if (newNotifs.length > 0) { toast.info(newNotifs[0].message); }
        }
        prevNotifsRef.current = data.unreadCounts.total;
      } catch (error) {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); 
    
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifs(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [token]);

  const handleBellClick = async () => {
    setShowNotifs(!showNotifs);
    if (unreadNotifs.total > 0) {
      try {
        await markNotificationsRead();
        setUnreadNotifs({ total: 0, ORDER_SELLER: 0, ORDER_BUYER: 0, REVIEW: 0 });
        setNotifications(notifs => notifs.map(n => ({ ...n, isRead: true })));
        prevNotifsRef.current = 0;
      } catch (error) {}
    }
  };

  const handleNotifClick = (link) => {
    setShowNotifs(false);
    navigate(link);
  };

  return (
    <header style={styles.header}>
      {/* ROW 1: Logo, Search, User Actions */}
      <div style={styles.topRow} className="topRow">
        <div style={styles.leftSection} className="leftSection">
          <Link to="/" style={styles.logo} className="brand-logo">HandmadeHub</Link>
        </div>

        {/* Search is now in its own separate container */}
        <div style={styles.searchContainer} className="searchContainer">
          <form onSubmit={handleSearch} style={styles.searchForm} className="search-form">
            <input type="text" placeholder="Search handmade items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
            <button type="submit" style={styles.searchBtn}>Search</button>
          </form>
        </div>

        <div style={styles.rightActions} className="rightActions">
          {token ? (
            <div style={styles.userMenuContainer} className="userMenuContainer" ref={userMenuRef}>
              <button style={styles.userMenuBtn} onClick={() => setShowUserMenu(!showUserMenu)}>
                {profileImage && profileImage !== 'null' ? (
                  <img src={profileImage.startsWith('/images') ? `https://handmadehub-mm.onrender.com${profileImage}` : profileImage} alt="Profile" style={styles.headerProfileImg} />
                ) : (
                  <div style={styles.headerPlaceholder}>{name ? name.charAt(0).toUpperCase() : 'U'}</div>
                )}
                <span style={styles.welcome}>Hi, {name}</span>
                <span style={styles.dropdownArrow}>▼</span>
              </button>
              
              {showUserMenu && (
                <div style={styles.userDropdown}>
                  <Link to="/profile" style={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>
                    👤 My Profile
                  </Link>
                  <button style={styles.dropdownLogoutBtn} onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.authBox} className="auth-box">
              <Link to="/register" style={{ textDecoration: 'none' }}><button style={styles.btn}>Register</button></Link>
              <Link to="/login" style={{ textDecoration: 'none' }}><button style={styles.btn}>Login</button></Link>
            </div>
          )}
          
          {token && (
            <div style={styles.bellContainer} className="bellContainer" ref={notifRef}>
              <button style={styles.bellBtn} onClick={handleBellClick}>
                🔔
                {unreadNotifs.total > 0 && <span style={styles.bellBadge}>{unreadNotifs.total}</span>}
              </button>
              {showNotifs && (
                <div style={styles.notifDropdown}>
                  <h3 style={styles.notifTitle}>Notifications</h3>
                  <div style={styles.notifList}>
                    {notifications.length === 0 ? (
                      <p style={styles.noNotifs}>No notifications yet</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} style={n.isRead ? styles.notifItem : {...styles.notifItem, backgroundColor: '#f0f8ff', cursor: 'pointer'}} onClick={() => handleNotifClick(n.link)}>
                          <p style={styles.notifMsg}>{n.message}</p>
                          <span style={styles.notifTime}>{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <button style={styles.cartBtn} onClick={() => toggleCart()}>
            Cart ({cartItems.length})
          </button>
        </div>
      </div>

      {/* ROW 2: Desktop Navigation Links (Completely Separate) */}
      <nav style={styles.desktopNavRow} className="desktop-nav">
        <Link to="/" style={styles.navLink}>Home</Link>
        {canSell && (
          <>
            <Link to="/seller-dashboard" style={styles.navLink}>Dashboard</Link>
            <Link to="/seller" style={styles.navLink}>Sell</Link>
            <Link to="/seller-orders" style={styles.navLink}>
              My Sales
              {unreadNotifs.ORDER_SELLER > 0 && (<span style={styles.badge}>{unreadNotifs.ORDER_SELLER}</span>)}
            </Link>
            <Link to={localStorage.getItem('shopSlug') ? `/shop/${localStorage.getItem('shopSlug')}` : '/seller/shop-settings'} style={styles.navLink}>My Shop</Link>
          </>
        )}
        <Link to="/myorders" style={styles.navLink}>
          My Orders
          {unreadNotifs.ORDER_BUYER > 0 && (<span style={styles.badge}>{unreadNotifs.ORDER_BUYER}</span>)}
        </Link>
        <Link to="/wishlist" style={styles.navLink}>Wishlist</Link>
        <Link to="/messages" style={styles.navLink}>
          Messages
          {unreadMessages > 0 && (<span style={styles.badge}>{unreadMessages}</span>)}
        </Link>
        {role === 'ADMIN' && (<Link to="/admin" style={styles.navLink}>Admin</Link>)}
      </nav>
    </header>
  );
}

const styles = {
  // Header is now a column, holding Row 1 and Row 2
  header: { 
    backgroundColor: '#ffffff', 
    borderBottom: '1px solid #eaeaea', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
    position: 'sticky', 
    top: 0, 
    zIndex: 100, 
    padding: '1rem 2rem', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '1rem' 
  },
  
  // Row 1
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '2rem' },
  leftSection: { display: 'flex', alignItems: 'center', gap: '15px', flexShrink: 0 },
  searchContainer: { flexGrow: 1, display: 'flex', justifyContent: 'center' },
  rightActions: { display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 },
  
  // Row 2
  desktopNavRow: { display: 'flex', justifyContent: 'center', gap: '30px', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '1rem' },
  
  logo: { fontSize: '24px', fontWeight: '800', fontFamily: "'Poppins', sans-serif", color: '#8b5a2b', textDecoration: 'none' },
  navLink: { textDecoration: 'none', color: '#5D4037', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', transition: 'color 0.2s' },
  
  userMenuContainer: { position: 'relative', zIndex: 1002 },
  userMenuBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', padding: '5px', borderRadius: '8px' },
  headerProfileImg: { width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ccc' },
  headerPlaceholder: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#8b5a2b', fontWeight: 'bold' },
  welcome: { fontSize: '14px', color: '#333', fontWeight: '600' },
  dropdownArrow: { fontSize: '10px', color: '#888' },
  userDropdown: { position: 'absolute', top: 'calc(100% + 10px)', right: '0', width: '200px', backgroundColor: '#fff', border: '1px solid #E0E0E0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 1002, overflow: 'hidden' },
  dropdownItem: { display: 'block', padding: '15px 20px', color: '#333', textDecoration: 'none', fontWeight: '500', borderBottom: '1px solid #f0f0f0', transition: 'background-color 0.2s' },
  dropdownLogoutBtn: { display: 'block', width: '100%', textAlign: 'left', padding: '15px 20px', backgroundColor: 'transparent', border: 'none', color: 'red', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },

  authBox: { display: 'flex', alignItems: 'center', gap: '10px' },
  btn: { padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid #8b5a2b', color: '#8b5a2b', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  cartBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#8b5a2b', border: 'none', color: '#ffffff', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: "'Poppins', sans-serif", display: 'flex', alignItems: 'center', gap: '8px' },
  
  searchForm: { display: 'flex', flexGrow: 1, width: '100%', maxWidth: '600px' },
  searchInput: { flexGrow: 1, height: '44px', boxSizing: 'border-box', paddingLeft: '1rem', border: '1px solid #ccc', borderRadius: '8px 0 0 8px', fontSize: '15px', outline: 'none' },
  searchBtn: { height: '44px', boxSizing: 'border-box', padding: '0 1.5rem', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '0 8px 8px 0', cursor: 'pointer', fontSize: '15px', fontWeight: '600' },
  
  badge: { backgroundColor: 'red', color: 'white', fontSize: '10px', fontWeight: 'bold', borderRadius: '10px', padding: '2px 6px', marginLeft: '5px' },
  bellContainer: { position: 'relative' },
  bellBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', position: 'relative', padding: '5px' },
  bellBadge: { position: 'absolute', top: '0', right: '0', backgroundColor: 'red', color: 'white', fontSize: '9px', fontWeight: 'bold', borderRadius: '10px', padding: '2px 5px' },
  notifDropdown: { position: 'absolute', top: 'calc(100% + 10px)', right: '0', width: '300px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000 },
  notifTitle: { margin: 0, padding: '15px', borderBottom: '1px solid #eee', color: '#333', fontSize: '16px', fontFamily: "'Poppins', sans-serif" },
  notifList: { maxHeight: '300px', overflowY: 'auto' },
  notifItem: { padding: '15px', borderBottom: '1px solid #f0f0f0' },
  notifMsg: { margin: '0 0 5px 0', fontSize: '14px', color: '#333' },
  notifTime: { fontSize: '11px', color: '#999' },
  noNotifs: { padding: '20px', textAlign: 'center', color: '#999', fontSize: '14px' }
};

export default Header;