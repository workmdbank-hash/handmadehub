import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSellerDashboardData, getMyWithdrawals, requestWithdrawal } from '../services/api';
import { toast } from 'react-toastify';
import { useIsMobile } from '../hooks/useIsMobile';

function SellerDashboardHome() {
  const isMobile = useIsMobile();
  const [data, setData] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const fetchData = async () => {
    try {
      const [dashRes, withRes] = await Promise.all([getSellerDashboardData(), getMyWithdrawals()]);
      setData(dashRes);
      setWithdrawals(withRes);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    try {
      await requestWithdrawal(withdrawAmount);
      toast.success('Withdrawal requested successfully!');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      fetchData(); 
    } catch (error) {
      toast.error(error.message || 'Failed to request withdrawal');
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (!data) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Failed to load dashboard data.</p>;

  return (
    <div style={styles.container}>
      <h1 style={{...styles.title, fontSize: isMobile ? '24px' : '32px'}}>Seller Dashboard</h1>
      
      {/* FINANCIAL CARDS */}
      <div style={{...styles.grid3, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))'}}>
        <div style={styles.financeCard}>
          <h3 style={styles.financeTitle}>Available Balance</h3>
          <p style={{...styles.financeValue, fontSize: isMobile ? '22px' : '28px'}}>{data.balance.available.toFixed(2)} Ks</p>
          <button 
            style={styles.withdrawBtn} 
            onClick={() => setShowWithdrawModal(true)}
            disabled={data.balance.available <= 0}
          >
            Request Withdrawal
          </button>
        </div>
        <div style={styles.financeCard}>
          <h3 style={styles.financeTitle}>Pending Balance</h3>
          <p style={{...styles.financeValue, fontSize: isMobile ? '22px' : '28px'}}>{data.balance.pending.toFixed(2)} Ks</p>
        </div>
        <div style={styles.financeCard}>
          <h3 style={styles.financeTitle}>Total Withdrawn</h3>
          <p style={{...styles.financeValue, fontSize: isMobile ? '22px' : '28px'}}>{data.balance.withdrawn.toFixed(2)} Ks</p>
        </div>
      </div>

      {/* ANALYTICS CARDS */}
      <div style={{...styles.grid4, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))'}}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Gross Revenue</span>
          <span style={{...styles.statValue, fontSize: isMobile ? '18px' : '24px'}}>{data.analytics.grossRevenue.toFixed(2)} Ks</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Total Orders</span>
          <span style={{...styles.statValue, fontSize: isMobile ? '18px' : '24px'}}>{data.analytics.totalOrders}</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Pending Orders</span>
          <span style={{...styles.statValue, fontSize: isMobile ? '18px' : '24px'}}>{data.analytics.pendingOrders}</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Total Products</span>
          <span style={{...styles.statValue, fontSize: isMobile ? '18px' : '24px'}}>{data.analytics.totalProducts}</span>
        </div>
      </div>

      {/* RECENT ORDERS & WITHDRAWALS */}
      <div style={{...styles.grid2, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr'}}>
        
        {/* RECENT ORDERS SECTION */}
        <div style={{...styles.sectionCard, padding: isMobile ? '15px' : '30px'}}>
          <div style={styles.sectionHeader}>
            <h2 style={{...styles.sectionTitle, fontSize: isMobile ? '18px' : '24px'}}>Recent Orders</h2>
            <Link to="/seller-orders" style={styles.viewAllBtn}>View All</Link>
          </div>
          
          {data.recentOrders.length === 0 ? (
            <p style={styles.emptyText}>No orders yet.</p>
          ) : isMobile ? (
            // MOBILE VIEW: Stacked Cards
            <div style={styles.mobileList}>
              {data.recentOrders.map((order) => (
                <Link to={`/order/${order.id}`} key={order.id} style={styles.mobileCard}>
                  <div style={styles.mobileCardTop}>
                    <span style={styles.mobileOrderId}>#{order.id}</span>
                    <span style={styles.statusBadge(order.status)}>{order.status}</span>
                  </div>
                  <div style={styles.mobileCardBottom}>
                    <span style={styles.mobileCustomer}>{order.user?.name || 'Unknown'}</span>
                    <span style={styles.mobileTotal}>{order.total} Ks</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            // DESKTOP VIEW: Table
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr><th style={styles.th}>Order ID</th><th style={styles.th}>Customer</th><th style={styles.th}>Status</th><th style={styles.th}>Total</th></tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={styles.td}><Link to={`/order/${order.id}`} style={styles.link}>#{order.id}</Link></td>
                      <td style={styles.td}>{order.user?.name || 'Unknown'}</td>
                      <td style={styles.td}><span style={styles.statusBadge(order.status)}>{order.status}</span></td>
                      <td style={styles.td}><strong>{order.total} Ks</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* WITHDRAWALS SECTION */}
        <div style={{...styles.sectionCard, padding: isMobile ? '15px' : '30px'}}>
          <div style={styles.sectionHeader}>
            <h2 style={{...styles.sectionTitle, fontSize: isMobile ? '18px' : '24px'}}>Withdrawals</h2>
          </div>
          
          {withdrawals.length === 0 ? (
            <p style={styles.emptyText}>No withdrawals yet.</p>
          ) : isMobile ? (
            // MOBILE VIEW: Stacked Cards
            <div style={styles.mobileList}>
              {withdrawals.map((w) => (
                <div key={w.id} style={styles.mobileCard}>
                  <div style={styles.mobileCardTop}>
                    <span style={styles.mobileTotal}>{w.amount} Ks</span>
                    <span style={styles.statusBadge(w.status)}>{w.status}</span>
                  </div>
                  <div style={styles.mobileCardBottom}>
                    <span style={styles.mobileDate}>{new Date(w.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // DESKTOP VIEW: Table
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr><th style={styles.th}>Amount</th><th style={styles.th}>Status</th><th style={styles.th}>Date</th></tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id}>
                      <td style={styles.td}><strong>{w.amount} Ks</strong></td>
                      <td style={styles.td}><span style={styles.statusBadge(w.status)}>{w.status}</span></td>
                      <td style={styles.td}>{new Date(w.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* WITHDRAWAL MODAL */}
      {showWithdrawModal && (
        <div style={styles.modalOverlay} onClick={() => setShowWithdrawModal(false)}>
          <div style={{...styles.modalContent, width: isMobile ? '90%' : '400px'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Request Withdrawal</h2>
            <p style={styles.modalText}>Available Balance: {data.balance.available.toFixed(2)} Ks</p>
            <form onSubmit={handleWithdrawSubmit}>
              <input 
                style={styles.modalInput} 
                type="number" 
                placeholder="Enter amount to withdraw" 
                value={withdrawAmount} 
                onChange={(e) => setWithdrawAmount(e.target.value)} 
                required 
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={styles.modalSubmitBtn}>Submit Request</button>
                <button type="button" style={styles.modalCancelBtn} onClick={() => setShowWithdrawModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  title: { color: '#8b5a2b', marginBottom: '30px' },
  grid3: { display: 'grid', gap: '20px', marginBottom: '30px' },
  grid4: { display: 'grid', gap: '20px', marginBottom: '40px' },
  grid2: { display: 'grid', gap: '20px' },
  financeCard: { backgroundColor: '#FDFBF7', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '10px' },
  financeTitle: { margin: 0, fontSize: '14px', color: '#666', fontWeight: '600' },
  financeValue: { margin: 0, color: '#1a1a1a', fontWeight: '700' },
  withdrawBtn: { marginTop: '10px', padding: '10px', backgroundColor: '#1a1a1a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  statCard: { backgroundColor: '#FDFBF7', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '5px' },
  statLabel: { fontSize: '14px', color: '#666', fontWeight: '600' },
  statValue: { color: '#8b5a2b', fontWeight: '700' },
  sectionCard: { 
    backgroundColor: '#FDFBF7', 
    borderRadius: '12px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
    border: '1px solid #eee',
    boxSizing: 'border-box',
    overflow: 'hidden'
  },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sectionTitle: { color: '#1a1a1a', margin: 0 },
  viewAllBtn: { padding: '8px 16px', backgroundColor: 'transparent', color: '#8b5a2b', border: '1px solid #8b5a2b', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' },
  emptyText: { color: '#666', textAlign: 'center' },
  tableWrapper: { width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #eee', color: '#666', fontSize: '12px', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  td: { padding: '15px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '15px', color: '#1a1a1a', whiteSpace: 'nowrap' },
  link: { color: '#8b5a2b', textDecoration: 'none', fontWeight: '600' },
  statusBadge: (status) => {
    let bgColor = '#eee', textColor = '#333';
    if (status === 'DELIVERED' || status === 'COMPLETED') { bgColor = '#d4edda'; textColor = '#155724'; }
    if (status === 'SHIPPED' || status === 'PENDING') { bgColor = '#fff3cd'; textColor = '#856404'; }
    return { backgroundColor: bgColor, color: textColor, padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' };
  },
  // NEW: Mobile Card List Styles
  mobileList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  mobileCard: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '8px', 
    padding: '15px', 
    backgroundColor: '#fff', 
    borderRadius: '8px', 
    border: '1px solid #eee',
    textDecoration: 'none',
    color: '#1a1a1a'
  },
  mobileCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  mobileCardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  mobileOrderId: { fontWeight: '700', color: '#8b5a2b', fontSize: '16px' },
  mobileCustomer: { fontSize: '14px', color: '#666' },
  mobileTotal: { fontWeight: '700', fontSize: '16px' },
  mobileDate: { fontSize: '13px', color: '#999' },
  // Modal Styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  modalTitle: { color: '#1a1a1a', marginTop: 0, marginBottom: '10px', fontSize: '24px' },
  modalText: { color: '#666', marginBottom: '20px' },
  modalInput: { width: '100%', height: '48px', padding: '0 16px', fontSize: '16px', border: '1px solid #E0E0E0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  modalSubmitBtn: { flex: 1, height: '48px', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: '600' },
  modalCancelBtn: { flex: 1, height: '48px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: '600' }
};

export default SellerDashboardHome;