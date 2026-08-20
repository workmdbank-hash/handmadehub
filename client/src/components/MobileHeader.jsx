import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { getUnreadCount, getMyNotifications, markNotificationsRead } from '../services/api';

function MobileHeader() {
  const { cartItems, toggleCart } = useCart(); 
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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

  const notifRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) { navigate(`/?search=${searchTerm}`); } else { navigate('/'); }
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('profileImage');
    localStorage.removeItem('shopSlug');
    toast.success('Logged out successfully!');
    navigate('/');
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

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
      {/* TOP ROW: Menu, Logo, Cart */}
      <div style={styles.topRow}>
        <button style={styles.iconBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✖' : '☰'}
        </button>
        <Link to="/" style={styles.logo} onClick={closeMenu}>HandmadeHub</Link>
        
        <div style={styles.rightIcons}>
          {token && (
            <div style={styles.bellContainer} ref={notifRef}>
              <button style={styles.iconBtn} onClick={handleBellClick}>
                🔔
                {unreadNotifs.total > 0 && <span style={styles.badge}>{unreadNotifs.total}</span>}
              </button>
              {showNotifs && (
                <div style={styles.notifDropdown}>
                  <h3 style={styles.notifTitle}>Notifications</h3>
                  <div style={styles.notifList}>
                    {notifications.length === 0 ? (
                      <p style={styles.noNotifs}>No notifications yet</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} style={n.isRead ? styles.notifItem : {...styles.notifItem, backgroundColor: '#f0f8ff'}} onClick={() => handleNotifClick(n.link)}>
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
            🛒 ({cartItems.length})
          </button>
        </div>
      </div>

      {/* BOTTOM ROW: Search Bar (Full Width) */}
      <form onSubmit={handleSearch} style={styles.searchForm}>
        <input 
          type="text" 
          placeholder="Search handmade items..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={styles.searchInput}
        />
        <button type="submit" style={styles.searchBtn}>Search</button>
      </form>

      {/* MOBILE DROPDOWN MENU (Full Screen Overlay) */}
      {isMenuOpen && (
        <nav style={styles.mobileNav}>
          <div style={styles.mobileHeader}>
            <span style={styles.mobileLogo}>Menu</span>
            <button style={styles.mobileCloseBtn} onClick={() => setIsMenuOpen(false)}>✖</button>
          </div>
          
          <div style={styles.mobileLinks}>
            {!token ? (
              <div style={styles.mobileAuthRow}>
                <Link to="/register" style={{width: '100%'}} onClick={closeMenu}><button style={{...styles.mobileAuthBtn, backgroundColor: '#8b5a2b', color: 'white'}}>Register</button></Link>
                <Link to="/login" style={{width: '100%'}} onClick={closeMenu}><button style={styles.mobileAuthBtn}>Login</button></Link>
              </div>
            ) : (
              <Link to="/profile" style={styles.mobileProfileCard} onClick={closeMenu}>
                <div style={styles.profileAvatar}>
                  {profileImage && profileImage !== 'null' ? (
                    <img src={profileImage.startsWith('/images') ? `https://handmadehub-mm.onrender.com${profileImage}` : profileImage} alt="Profile" style={styles.avatarImg} />
                  ) : (
                    <span>{name ? name.charAt(0).toUpperCase() : 'U'}</span>
                  )}
                </div>
                <div>
                  <span style={styles.profileLabel}>My Profile</span>
                  <span style={styles.profileName}>{name}</span>
                </div>
              </Link>
            )}

            <Link to="/" style={styles.mobileLink} onClick={closeMenu}>🏠 Home</Link>
            {canSell && (
              <>
                <Link to="/seller-dashboard" style={styles.mobileLink} onClick={closeMenu}>📊 Dashboard</Link>
                <Link to="/seller" style={styles.mobileLink} onClick={closeMenu}>🏷️ Sell</Link>
                <Link to="/seller-orders" style={styles.mobileLink} onClick={closeMenu}>📦 My Sales</Link>
                <Link to={localStorage.getItem('shopSlug') ? `/shop/${localStorage.getItem('shopSlug')}` : '/seller/shop-settings'} style={styles.mobileLink} onClick={closeMenu}>🏪 My Shop</Link>
              </>
            )}
            <Link to="/myorders" style={styles.mobileLink} onClick={closeMenu}>🛍️ My Orders</Link>
            <Link to="/wishlist" style={styles.mobileLink} onClick={closeMenu}>❤️ Wishlist</Link>
            <Link to="/messages" style={styles.mobileLink} onClick={closeMenu}>
              💬 Messages
              {unreadMessages > 0 && <span style={styles.badge}>{unreadMessages}</span>}
            </Link>
            {role === 'ADMIN' && (<Link to="/admin" style={styles.mobileLink} onClick={closeMenu}>⚙️ Admin</Link>)}
            
            {token && (
              <button style={styles.logoutBtn} onClick={handleLogout}>🚪 Logout</button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

const styles = {
  header: { 
    backgroundColor: '#ffffff', 
    borderBottom: '1px solid #eaeaea', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
    position: 'sticky', 
    top: 0, 
    zIndex: 100, 
    padding: '10px 16px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px' 
  },
  topRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    width: '100%' 
  },
  iconBtn: { 
    background: 'none', 
    border: 'none', 
    fontSize: '24px', 
    cursor: 'pointer', 
    color: '#333', 
    padding: '0 5px',
    position: 'relative'
  },
  logo: { 
    fontSize: '20px', 
    fontWeight: '800', 
    fontFamily: "'Poppins', sans-serif", 
    color: '#8b5a2b', 
    textDecoration: 'none' 
  },
  rightIcons: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '15px' 
  },
  cartBtn: { 
    background: 'none', 
    border: 'none', 
    fontSize: '18px', 
    cursor: 'pointer', 
    color: '#333', 
    padding: '0 5px' 
  },
  searchForm: { 
    display: 'flex', 
    width: '100%' 
  },
  searchInput: { 
    flexGrow: 1, 
    height: '40px', 
    paddingLeft: '12px', 
    border: '1px solid #ccc', 
    borderRadius: '8px 0 0 8px', 
    fontSize: '14px', 
    outline: 'none' 
  },
  searchBtn: { 
    height: '40px', 
    padding: '0 15px', 
    backgroundColor: '#8b5a2b', 
    color: 'white', 
    border: 'none', 
    borderRadius: '0 8px 8px 0', 
    cursor: 'pointer', 
    fontSize: '14px', 
    fontWeight: '600' 
  },
  
  // Mobile Menu Overlay Styles
  mobileNav: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: '#ffffff', 
    display: 'flex', 
    flexDirection: 'column', 
    padding: '0 20px 20px 20px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
    zIndex: 9999, 
    overflowY: 'auto' 
  },
  mobileHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '20px 0', 
    borderBottom: '1px solid #eee', 
    marginBottom: '20px' 
  },
  mobileLogo: { 
    fontSize: '18px', 
    fontWeight: '800', 
    color: '#8b5a2b' 
  },
  mobileCloseBtn: { 
    background: 'none', 
    border: 'none', 
    fontSize: '24px', 
    cursor: 'pointer', 
    color: '#333' 
  },
  mobileLinks: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '5px' 
  },
  mobileAuthRow: { 
    display: 'flex', 
    gap: '10px', 
    marginBottom: '20px' 
  },
  mobileAuthBtn: { 
    width: '100%', 
    padding: '12px', 
    backgroundColor: 'transparent', 
    border: '1px solid #8b5a2b', 
    color: '#8b5a2b', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '16px', 
    fontWeight: 'bold' 
  },
  mobileProfileCard: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '15px', 
    padding: '15px 0', 
    marginBottom: '15px', 
    borderBottom: '1px solid #eee' 
  },
  profileAvatar: { 
    width: '50px', 
    height: '50px', 
    borderRadius: '50%', 
    backgroundColor: '#8b5a2b', 
    color: 'white', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '24px', 
    fontWeight: 'bold' 
  },
  avatarImg: { 
    width: '100%', 
    height: '100%', 
    borderRadius: '50%', 
    objectFit: 'cover' 
  },
  profileLabel: { 
    display: 'block', 
    fontSize: '12px', 
    color: '#888' 
  },
  profileName: { 
    display: 'block', 
    fontSize: '16px', 
    fontWeight: 'bold', 
    color: '#333' 
  },
  mobileLink: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    gap: '15px', 
    textDecoration: 'none', 
    color: '#333', 
    fontSize: '16px', 
    fontWeight: '500', 
    padding: '15px 0', 
    borderBottom: '1px solid #f0f0f0' 
  },
  logoutBtn: { 
    width: '100%', 
    padding: '15px', 
    marginTop: '20px', 
    backgroundColor: 'transparent', 
    border: '1px solid #ff4d4f', 
    color: '#ff4d4f', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '16px', 
    fontWeight: 'bold' 
  },
  
  // Notifications - Fixed for Mobile
  bellContainer: { 
    position: 'relative' 
  },
  badge: { 
    position: 'absolute', 
    top: '-5px', 
    right: '-5px', 
    backgroundColor: 'red', 
    color: 'white', 
    fontSize: '10px', 
    fontWeight: 'bold', 
    borderRadius: '10px', 
    padding: '2px 5px' 
  },
  notifDropdown: { 
    position: 'fixed', 
    top: '110px', 
    left: '15px', 
    right: '15px', 
    width: 'auto', 
    backgroundColor: 'white', 
    border: '1px solid #ccc', 
    borderRadius: '8px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
    zIndex: 1000 
  },
  notifTitle: { 
    margin: 0, 
    padding: '12px 15px', 
    borderBottom: '1px solid #eee', 
    color: '#333', 
    fontSize: '15px', 
    fontWeight: '600'
  },
  notifList: { 
    maxHeight: '300px', 
    overflowY: 'auto' 
  },
  notifItem: { 
    padding: '12px 15px', 
    borderBottom: '1px solid #f0f0f0' 
  },
  notifMsg: { 
    margin: '0 0 4px 0', 
    fontSize: '13px', 
    color: '#333',
    lineHeight: '1.4'
  },
  notifTime: { 
    fontSize: '10px', 
    color: '#999' 
  },
  noNotifs: { 
    padding: '20px', 
    textAlign: 'center', 
    color: '#999', 
    fontSize: '13px' 
  }
};

export default MobileHeader;