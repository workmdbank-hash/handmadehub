// AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  getAdminUsers, getAdminProducts, deleteProductAdmin, deleteUserAdmin, updateUserRole, updateSellerApproval,
  getAdminCoupons, createAdminCoupon, updateAdminCoupon, deleteAdminCoupon
} from '../services/api';
import { toast } from 'react-toastify';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  const [newCouponLimit, setNewCouponLimit] = useState('');

  const fetchData = async () => {
    try {
      const [userData, productData, couponData] = await Promise.all([
        getAdminUsers(), getAdminProducts(), getAdminCoupons()
      ]);
      setUsers(userData);
      setProducts(productData);
      setCoupons(couponData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load admin data.');
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Delete this product?')) {
      try { await deleteProductAdmin(id); toast.success('Product deleted!'); setProducts(products.filter(p => p.id !== id)); } 
      catch (error) { toast.error('Failed to delete product.'); }
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Delete user ${name}?`)) {
      try { await deleteUserAdmin(id); toast.success('User deleted!'); setUsers(users.filter(u => u.id !== id)); } 
      catch (error) { toast.error('Failed to delete user.'); }
    }
  };

  // NEW: Role change logic (Customer -> Seller, Seller -> Customer, Admin -> Customer)
  const handleRoleChange = async (id, currentRole) => {
    let newRole = '';
    if (currentRole === 'CUSTOMER') newRole = 'SELLER';
    else if (currentRole === 'SELLER') newRole = 'CUSTOMER';
    else if (currentRole === 'ADMIN') newRole = 'CUSTOMER';

    if (window.confirm(`Change role to ${newRole}?`)) {
      try { 
        await updateUserRole(id, newRole); 
        toast.success(`User is now a ${newRole}!`); 
        setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u)); 
      } 
      catch (error) { toast.error('Failed to update role.'); }
    }
  };

  // NEW: Promote to Admin logic
  const handlePromoteToAdmin = async (id) => {
    if (window.confirm('Promote this user to ADMIN?')) {
      try { 
        await updateUserRole(id, 'ADMIN'); 
        toast.success('User is now an ADMIN!'); 
        setUsers(users.map(u => u.id === id ? { ...u, role: 'ADMIN' } : u)); 
      } 
      catch (error) { toast.error('Failed to update role.'); }
    }
  };

  // NEW: Approve Seller logic
  const handleApproveSeller = async (id) => {
    try {
      await updateSellerApproval(id, true);
      toast.success('Seller Approved! They can now log in.');
      setUsers(users.map(u => u.id === id ? { ...u, isApproved: true } : u));
    } catch (error) {
      toast.error('Failed to approve seller.');
    }
  };

  // Coupon Handlers
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const newCoupon = await createAdminCoupon({ code: newCouponCode, discountPercent: newCouponDiscount, usageLimit: newCouponLimit });
      setCoupons([newCoupon, ...coupons]);
      setNewCouponCode(''); setNewCouponDiscount(''); setNewCouponLimit('');
      toast.success('Coupon created!');
    } catch (error) { toast.error('Failed to create coupon.'); }
  };

  const handleToggleCoupon = async (id, currentStatus) => {
    try {
      const updated = await updateAdminCoupon(id, { isActive: !currentStatus });
      setCoupons(coupons.map(c => c.id === id ? updated : c));
      toast.success(`Coupon ${!currentStatus ? 'Enabled' : 'Disabled'}!`);
    } catch (error) { toast.error('Failed to update coupon.'); }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm('Delete this coupon code?')) {
      try { await deleteAdminCoupon(id); setCoupons(coupons.filter(c => c.id !== id)); toast.success('Coupon deleted!'); } 
      catch (error) { toast.error('Failed to delete coupon.'); }
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (error) return <p style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Dashboard</h1>
      
      {/* COUPONS SECTION */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Discount Coupons</h2>
        <form onSubmit={handleCreateCoupon} style={styles.couponForm}>
          <input style={styles.input} type="text" placeholder="Code (e.g., SUMMER20)" value={newCouponCode} onChange={(e) => setNewCouponCode(e.target.value)} required />
          <input style={styles.input} type="number" step="0.1" placeholder="Discount %" value={newCouponDiscount} onChange={(e) => setNewCouponDiscount(e.target.value)} required />
          <input style={styles.input} type="number" placeholder="Usage Limit (blank=unlimited)" value={newCouponLimit} onChange={(e) => setNewCouponLimit(e.target.value)} />
          <button type="submit" style={styles.addCouponBtn}>Add Coupon</button>
        </form>
        <table style={styles.table}>
          <thead>
            <tr><th style={styles.th}>Code</th><th style={styles.th}>Discount</th><th style={styles.th}>Usage</th><th style={styles.th}>Status</th><th style={styles.th}>Actions</th></tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id}>
                <td style={styles.td}><strong>{c.code}</strong></td>
                <td style={styles.td}>{c.discountPercent}%</td>
                <td style={styles.td}>{c.timesUsed} / {c.usageLimit || '∞'}</td>
                <td style={styles.td}>{c.isActive ? <span style={{color: 'green'}}>Active</span> : <span style={{color: 'red'}}>Disabled</span>}</td>
                <td style={styles.td}>
                  <button style={c.isActive ? styles.disableBtn : styles.enableBtn} onClick={() => handleToggleCoupon(c.id, c.isActive)}>{c.isActive ? 'Disable' : 'Enable'}</button>
                  <button style={styles.deleteBtn} onClick={() => handleDeleteCoupon(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* USERS SECTION */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>All Users ({users.length})</h2>
        <table style={styles.table}>
          <thead>
            <tr><th style={styles.th}>ID</th><th style={styles.th}>Name</th><th style={styles.th}>Email</th><th style={styles.th}>Role</th><th style={styles.th}>Status</th><th style={styles.th}>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={styles.td}>{user.id}</td>
                <td style={styles.td}>{user.name}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.role}</td>
                <td style={styles.td}>
                  {user.role === 'SELLER' ? (
                    user.isApproved ? <span style={{color: 'green'}}>Approved</span> : <span style={{color: 'red'}}>Pending</span>
                  ) : (
                    <span>-</span>
                  )}
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {/* NEW: Approve Seller Button */}
                    {user.role === 'SELLER' && !user.isApproved && (
                      <button style={styles.approveBtn} onClick={() => handleApproveSeller(user.id)}>Approve Seller</button>
                    )}
                    
                    {/* Role Change Buttons */}
                    {user.role !== 'ADMIN' && (
                      <button style={styles.promoteBtn} onClick={() => handlePromoteToAdmin(user.id)}>Make Admin</button>
                    )}
                    {user.role === 'SELLER' && (
                      <button style={styles.demoteBtn} onClick={() => handleRoleChange(user.id, user.role)}>Make Customer</button>
                    )}
                    {user.role === 'CUSTOMER' && (
                      <button style={styles.sellerBtn} onClick={() => handleRoleChange(user.id, user.role)}>Make Seller</button>
                    )}
                    {user.role === 'ADMIN' && (
                      <button style={styles.demoteBtn} onClick={() => handleRoleChange(user.id, user.role)}>Demote</button>
                    )}

                    <button style={styles.deleteBtn} onClick={() => handleDeleteUser(user.id, user.name)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PRODUCTS SECTION */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>All Products ({products.length})</h2>
        <table style={styles.table}>
          <thead>
            <tr><th style={styles.th}>ID</th><th style={styles.th}>Name</th><th style={styles.th}>Price</th><th style={styles.th}>Seller</th><th style={styles.th}>Action</th></tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td style={styles.td}>{product.id}</td><td style={styles.td}>{product.name}</td><td style={styles.td}>{product.price} Ks</td><td style={styles.td}>{product.user?.name || 'Unknown'}</td>
                <td style={styles.td}><button style={styles.deleteBtn} onClick={() => handleDeleteProduct(product.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1000px', margin: '40px auto', padding: '20px' },
  title: { color: '#8b5a2b', textAlign: 'center', marginBottom: '30px' },
  section: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '30px' },
  sectionTitle: { color: '#333', borderBottom: '2px solid #8b5a2b', paddingBottom: '10px', marginBottom: '15px' },
  couponForm: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  input: { padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', flexGrow: 1, minWidth: '150px' },
  addCouponBtn: { padding: '10px 20px', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px', borderBottom: '1px solid #ddd', backgroundColor: '#f9f9f9' },
  td: { padding: '10px', borderBottom: '1px solid #eee', color: '#555' },
  deleteBtn: { padding: '5px 10px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', marginLeft: '5px' },
  // NEW: Button colors
  approveBtn: { padding: '5px 10px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  promoteBtn: { padding: '5px 10px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  sellerBtn: { padding: '5px 10px', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  demoteBtn: { padding: '5px 10px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  enableBtn: { padding: '5px 10px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  disableBtn: { padding: '5px 10px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }
};

export default AdminDashboard;