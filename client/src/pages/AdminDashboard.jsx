import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminUsers, getAdminProducts, getAdminWithdrawals } from '../services/api';
import { useIsMobile } from '../hooks/useIsMobile';

function AdminDashboard() {
  const isMobile = useIsMobile();
  const [stats, setStats] = useState({ sellers: 0, customers: 0, products: 0, pendingWithdrawals: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, products, withdrawals] = await Promise.all([
          getAdminUsers(), getAdminProducts(), getAdminWithdrawals()
        ]);
        
        setStats({
          sellers: users.filter(u => u.role === 'SELLER').length,
          customers: users.filter(u => u.role === 'CUSTOMER').length,
          products: products.length,
          pendingWithdrawals: withdrawals.filter(w => w.status === 'PENDING').length
        });
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="spinner"></div>;

  const cards = [
    { title: 'Sellers', count: stats.sellers, link: '/admin/sellers', color: '#8b5a2b', icon: '🏪' },
    { title: 'Customers', count: stats.customers, link: '/admin/customers', color: '#007bff', icon: '👥' },
    { title: 'Products', count: stats.products, link: '/admin/products', color: '#28a745', icon: '📦' },
    { title: 'Withdrawals', count: stats.pendingWithdrawals, link: '/admin/withdrawals', color: '#dc3545', icon: '💰' }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: isMobile ? '20px 15px' : '40px 20px' }}>
      <h1 style={{ color: '#8b5a2b', textAlign: 'center', marginBottom: '30px', fontSize: isMobile ? '24px' : '32px' }}>Admin Dashboard</h1>
      
      {/* NEW: Strict 2-column grid on mobile, auto-fit on desktop */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: isMobile ? '12px' : '20px' 
      }}>
        {cards.map((card, index) => (
          <Link to={card.link} key={index} style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#fff',
              // NEW: Reduce padding on mobile so it fits nicely
              padding: isMobile ? '20px 15px' : '30px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #eee',
              borderLeft: `5px solid ${card.color}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              transition: 'transform 0.2s',
              cursor: 'pointer',
              height: '100%',
              boxSizing: 'border-box'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span style={{ fontSize: isMobile ? '24px' : '32px' }}>{card.icon}</span>
              <h2 style={{ margin: 0, fontSize: isMobile ? '16px' : '20px', color: '#333' }}>{card.title}</h2>
              <p style={{ margin: 0, fontSize: isMobile ? '24px' : '32px', fontWeight: 'bold', color: card.color }}>
                {card.count}
              </p>
              <span style={{ color: '#888', fontSize: isMobile ? '11px' : '14px' }}>
                {card.title === 'Withdrawals' ? `${card.count} Pending` : `Total ${card.title}`}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;