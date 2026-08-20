import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminUsers, deleteUserAdmin, updateSellerApproval } from '../services/api';
import { toast } from 'react-toastify';
import { useIsMobile } from '../hooks/useIsMobile';

function AdminSellers() {
  const isMobile = useIsMobile();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingSeller, setViewingSeller] = useState(null);
  
  // NEW: Search & Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const data = await getAdminUsers();
        setUsers(data.filter(u => u.role === 'SELLER'));
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  const handleApprove = async (id) => {
    try {
      await updateSellerApproval(id, true);
      toast.success('Seller Approved!');
      setUsers(users.map(u => u.id === id ? { ...u, isApproved: true } : u));
      setViewingSeller(null);
    } catch (error) {
      toast.error('Failed to approve.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete seller ${name}?`)) {
      try {
        await deleteUserAdmin(id);
        toast.success('User deleted!');
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        toast.error('Failed to delete.');
      }
    }
  };

  if (loading) return <div className="spinner"></div>;

  // 1. Filter by Search
  let filteredSellers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.shop?.name && u.shop.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 2. Sort by Option
  if (sortOption === 'newest') {
    filteredSellers = [...filteredSellers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortOption === 'oldest') {
    filteredSellers = [...filteredSellers].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortOption === 'az') {
    filteredSellers = [...filteredSellers].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOption === 'za') {
    filteredSellers = [...filteredSellers].sort((a, b) => b.name.localeCompare(a.name));
  }

  return (
    <div className="admin-sub-page" style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <h1 style={{ color: '#8b5a2b', margin: 0 }}>Manage Sellers</h1>
        <Link to="/admin" style={{ padding: '10px 20px', backgroundColor: '#1a1a1a', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' }}>
          ← Back to Dashboard
        </Link>
      </div>

      {/* Search & Sort Bar */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search name, email, or shop..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={{ flexGrow: 1, minWidth: '200px', height: '40px', padding: '0 15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px' }}
        />
        <select 
          value={sortOption} 
          onChange={(e) => setSortOption(e.target.value)} 
          style={{ height: '40px', padding: '0 15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', cursor: 'pointer' }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="az">Name (A-Z)</option>
          <option value="za">Name (Z-A)</option>
        </select>
      </div>

      {/* List of Sellers */}
      {filteredSellers.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>No sellers found.</p>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredSellers.map(seller => (
            <div key={seller.id} style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong>{seller.name}</strong>
                <span style={{ color: seller.isApproved ? 'green' : 'red', fontSize: '12px', fontWeight: 'bold' }}>
                  {seller.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Shop: {seller.shop?.name || 'N/A'}</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button style={styles.viewBtn} onClick={() => setViewingSeller(seller)}>Details</button>
                {!seller.isApproved && <button style={styles.approveBtn} onClick={() => handleApprove(seller.id)}>Approve</button>}
                <button style={styles.deleteBtn} onClick={() => handleDelete(seller.id, seller.name)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #8b5a2b' }}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Shop Name</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Joined</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSellers.map(seller => (
                <tr key={seller.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={styles.td}>{seller.name}</td>
                  <td style={styles.td}>{seller.shop?.name || 'N/A'}</td>
                  <td style={styles.td}>
                    <span style={{ color: seller.isApproved ? 'green' : 'red', fontWeight: 'bold' }}>
                      {seller.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(seller.createdAt).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button style={styles.viewBtn} onClick={() => setViewingSeller(seller)}>Details</button>
                      {!seller.isApproved && <button style={styles.approveBtn} onClick={() => handleApprove(seller.id)}>Approve</button>}
                      <button style={styles.deleteBtn} onClick={() => handleDelete(seller.id, seller.name)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Seller Details Modal */}
      {viewingSeller && (
        <div style={styles.modalOverlay} onClick={() => setViewingSeller(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Seller Application</h2>
            <button style={styles.modalCloseBtn} onClick={() => setViewingSeller(null)}>✖</button>
            
            <h3 style={{ color: '#8b5a2b', marginTop: '20px' }}>Personal Info</h3>
            <p><strong>Name:</strong> {viewingSeller.name}</p>
            <p><strong>Email:</strong> {viewingSeller.email}</p>
            <p><strong>Phone:</strong> {viewingSeller.phone || 'N/A'}</p>
            <p><strong>NRC:</strong> {viewingSeller.nrc || 'N/A'}</p>
            
            <h3 style={{ color: '#8b5a2b', marginTop: '20px' }}>Shop Info</h3>
            <p><strong>Shop Name:</strong> {viewingSeller.shop?.name || 'N/A'}</p>
            <p><strong>Address:</strong> {viewingSeller.shopAddress || 'N/A'}</p>
            
            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {!viewingSeller.isApproved && (
                <button style={styles.approveBtn} onClick={() => handleApprove(viewingSeller.id)}>Approve Seller</button>
              )}
              <button style={styles.modalCancelBtn} onClick={() => setViewingSeller(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  th: { textAlign: 'left', padding: '12px', color: '#666', fontSize: '12px', textTransform: 'uppercase' },
  td: { padding: '15px 12px', color: '#333', fontSize: '15px' },
  viewBtn: { padding: '6px 12px', backgroundColor: '#1a1a1a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  approveBtn: { padding: '6px 12px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  deleteBtn: { padding: '6px 12px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' },
  modalCloseBtn: { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' },
  modalCancelBtn: { padding: '10px 20px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: '600' }
};

export default AdminSellers;