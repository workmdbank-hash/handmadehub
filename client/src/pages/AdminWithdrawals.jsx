import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminWithdrawals, updateAdminWithdrawalStatus } from '../services/api';
import { toast } from 'react-toastify';
import { useIsMobile } from '../hooks/useIsMobile';

function AdminWithdrawals() {
  const isMobile = useIsMobile();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const data = await getAdminWithdrawals();
        setWithdrawals(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchWithdrawals();
  }, []);

  const handleStatus = async (id, status) => {
    if (window.confirm(`Mark withdrawal as ${status}?`)) {
      try {
        await updateAdminWithdrawalStatus(id, status);
        setWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status } : w));
        toast.success(`Withdrawal ${status.toLowerCase()}!`);
      } catch (error) {
        toast.error('Failed to update.');
      }
    }
  };

  if (loading) return <div className="spinner"></div>;

  let filteredWithdrawals = withdrawals.filter(w => 
    (w.seller?.name && w.seller.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (sortOption === 'newest') filteredWithdrawals = [...filteredWithdrawals].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sortOption === 'oldest') filteredWithdrawals = [...filteredWithdrawals].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  else if (sortOption === 'amount_high') filteredWithdrawals = [...filteredWithdrawals].sort((a, b) => b.amount - a.amount);
  else if (sortOption === 'amount_low') filteredWithdrawals = [...filteredWithdrawals].sort((a, b) => a.amount - b.amount);

  const renderStatus = (status) => {
    let bgColor = '#eee', textColor = '#333';
    if (status === 'COMPLETED') { bgColor = '#d4edda'; textColor = '#155724'; }
    if (status === 'PENDING') { bgColor = '#fff3cd'; textColor = '#856404'; }
    if (status === 'REJECTED') { bgColor = '#f8d7da'; textColor = '#721c24'; }
    return <span style={{ backgroundColor: bgColor, color: textColor, padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>{status}</span>;
  };

  return (
    <div className="admin-sub-page" style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <h1 style={{ color: '#dc3545', margin: 0 }}>Manage Withdrawals</h1>
        <Link to="/admin" style={{ padding: '10px 20px', backgroundColor: '#1a1a1a', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' }}>← Back</Link>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search seller name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flexGrow: 1, minWidth: '200px', height: '40px', padding: '0 15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px' }} />
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} style={{ height: '40px', padding: '0 15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', cursor: 'pointer' }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="amount_high">Amount (High to Low)</option>
          <option value="amount_low">Amount (Low to High)</option>
        </select>
      </div>

      {filteredWithdrawals.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>No withdrawals found.</p>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredWithdrawals.map(w => (
            <div key={w.id} style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong>{w.seller?.name}</strong>
                {renderStatus(w.status)}
              </div>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>{w.amount} Ks</p>
              {w.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button style={{ padding: '6px 12px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }} onClick={() => handleStatus(w.id, 'COMPLETED')}>Approve</button>
                  <button style={{ padding: '6px 12px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }} onClick={() => handleStatus(w.id, 'REJECTED')}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead><tr style={{ borderBottom: '2px solid #dc3545' }}><th style={styles.th}>Seller</th><th style={styles.th}>Amount</th><th style={styles.th}>Status</th><th style={styles.th}>Date</th><th style={styles.th}>Actions</th></tr></thead>
            <tbody>
              {filteredWithdrawals.map(w => (
                <tr key={w.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={styles.td}>{w.seller?.name}</td><td style={styles.td}><strong>{w.amount} Ks</strong></td><td style={styles.td}>{renderStatus(w.status)}</td><td style={styles.td}>{new Date(w.createdAt).toLocaleDateString()}</td>
                  <td style={styles.td}>{w.status === 'PENDING' ? (<div style={{display:'flex',gap:'5px'}}><button style={{ padding: '6px 12px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }} onClick={() => handleStatus(w.id, 'COMPLETED')}>Approve</button><button style={{ padding: '6px 12px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }} onClick={() => handleStatus(w.id, 'REJECTED')}>Reject</button></div>) : <span style={{color:'#999'}}>Processed</span>}</td>
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

export default AdminWithdrawals;