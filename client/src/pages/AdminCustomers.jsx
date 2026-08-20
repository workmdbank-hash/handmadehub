import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminUsers, deleteUserAdmin, updateUserRole } from '../services/api';
import { toast } from 'react-toastify';
import { useIsMobile } from '../hooks/useIsMobile';

function AdminCustomers() {
  const isMobile = useIsMobile();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getAdminUsers();
        // Include both CUSTOMER and ADMIN roles here so you can manage them
        setUsers(data.filter(u => u.role === 'CUSTOMER' || u.role === 'ADMIN'));
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete user ${name}?`)) {
      try {
        await deleteUserAdmin(id);
        toast.success('User deleted!');
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        toast.error('Failed to delete.');
      }
    }
  };

  // NEW: Handle Role Change (Make Admin / Remove Admin)
  const handleRoleChange = async (id, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    if (window.confirm(`Change role to ${newRole}?`)) {
      try {
        await updateUserRole(id, newRole);
        toast.success(`User is now an ${newRole}!`);
        setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
      } catch (error) {
        toast.error('Failed to update role.');
      }
    }
  };

  if (loading) return <div className="spinner"></div>;

  let filteredCustomers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sortOption === 'newest') filteredCustomers = [...filteredCustomers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sortOption === 'oldest') filteredCustomers = [...filteredCustomers].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  else if (sortOption === 'az') filteredCustomers = [...filteredCustomers].sort((a, b) => a.name.localeCompare(b.name));
  else if (sortOption === 'za') filteredCustomers = [...filteredCustomers].sort((a, b) => b.name.localeCompare(a.name));

  return (
    <div className="admin-sub-page" style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <h1 style={{ color: '#007bff', margin: 0 }}>Manage Users</h1>
        <Link to="/admin" style={{ padding: '10px 20px', backgroundColor: '#1a1a1a', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' }}>← Back</Link>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flexGrow: 1, minWidth: '200px', height: '40px', padding: '0 15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px' }} />
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} style={{ height: '40px', padding: '0 15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', cursor: 'pointer' }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="az">Name (A-Z)</option>
          <option value="za">Name (Z-A)</option>
        </select>
      </div>

      {filteredCustomers.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>No users found.</p>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredCustomers.map(c => (
            <div key={c.id} style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong>{c.name} ({c.role})</strong>
                <button style={{ padding: '5px 10px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }} onClick={() => handleDelete(c.id, c.name)}>Delete</button>
              </div>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>{c.email}</p>
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#999' }}>Joined: {new Date(c.createdAt).toLocaleDateString()}</p>
              <button 
                style={{ width: '100%', padding: '8px', backgroundColor: c.role === 'ADMIN' ? '#ccc' : 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }} 
                onClick={() => handleRoleChange(c.id, c.role)}
              >
                {c.role === 'ADMIN' ? 'Demote to Customer' : 'Promote to Admin'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead><tr style={{ borderBottom: '2px solid #007bff' }}><th style={styles.th}>Name</th><th style={styles.th}>Email</th><th style={styles.th}>Role</th><th style={styles.th}>Joined</th><th style={styles.th}>Actions</th></tr></thead>
            <tbody>
              {filteredCustomers.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={styles.td}>{c.name}</td><td style={styles.td}>{c.email}</td><td style={styles.td}>{c.role}</td><td style={styles.td}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button style={{ padding: '6px 12px', backgroundColor: c.role === 'ADMIN' ? '#ccc' : 'green', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }} onClick={() => handleRoleChange(c.id, c.role)}>
                        {c.role === 'ADMIN' ? 'Demote' : 'Make Admin'}
                      </button>
                      <button style={{ padding: '6px 12px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }} onClick={() => handleDelete(c.id, c.name)}>Delete</button>
                    </div>
                  </td>
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

export default AdminCustomers;