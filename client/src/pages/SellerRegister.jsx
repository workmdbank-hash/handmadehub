import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { toast } from 'react-toastify';

function SellerRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', country: '', city: '',
    nrc: '', shopAddress: '', // NEW
    shopName: '', shopDescription: '', shopCategory: '',
    about: '', shippingPolicy: '', returnPolicy: ''
  });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send all data including role: 'SELLER'
      await registerUser({ ...formData, role: 'SELLER' });
      toast.success('Application submitted! Please wait for Admin approval to login.');
      navigate('/login'); 
    } catch (error) {
      toast.error('Registration failed. Email might already be in use.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="auth-card">
        <h1 style={styles.title}>Start Selling on HandmadeHub</h1>
        <p style={styles.subtitle}>Tell us about yourself and your shop.</p>
        
        <div style={styles.noticeBox}>
          <strong>⚠️ Approval Required</strong>
          <p style={{ margin: '5px 0 0 0' }}>To ensure a safe marketplace, all seller applications are manually reviewed by our team before you can log in. Please provide accurate information.</p>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          
          {/* SECTION 1: PERSONAL INFO */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>1. Personal Information</h3>
            <input style={styles.input} type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
            <input style={styles.input} type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
            <input style={styles.input} type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            <input style={styles.input} type="tel" name="phone" placeholder="Phone Number (e.g., +95 9 123 456 789)" value={formData.phone} onChange={handleChange} required />
            
            {/* NEW: NRC Input */}
            <input style={styles.input} type="text" name="nrc" placeholder="NRC Number (e.g., 12/OuKaTa(N)123456)" value={formData.nrc} onChange={handleChange} required />
            
            <div style={styles.row} className="form-row">
              <input style={styles.input} type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} required />
              <input style={styles.input} type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
            </div>
            
            {/* NEW: Address Textarea */}
            <textarea style={{...styles.input, ...styles.textarea}} name="shopAddress" placeholder="Shop Address (If no shop, provide Home Address)" value={formData.shopAddress} onChange={handleChange} required />
          </div>

          {/* SECTION 2: SHOP INFO */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>2. Shop Information</h3>
            <input style={styles.input} type="text" name="shopName" placeholder="Shop Name (e.g., Wooden Treasures)" value={formData.shopName} onChange={handleChange} required />
            <input style={styles.input} type="text" name="shopCategory" placeholder="Main Category (e.g., Woodworking, Jewelry)" value={formData.shopCategory} onChange={handleChange} required />
            <textarea style={{...styles.input, ...styles.textarea}} name="shopDescription" placeholder="Short Shop Description (1-2 sentences)" value={formData.shopDescription} onChange={handleChange} required />
          </div>

          {/* SECTION 3: POLICIES & ABOUT */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>3. Shop Policies & About</h3>
            <textarea style={{...styles.input, ...styles.textarea}} name="about" placeholder="Tell buyers your story. Why do you make handmade items?" value={formData.about} onChange={handleChange} required />
            <textarea style={{...styles.input, ...styles.textarea}} name="shippingPolicy" placeholder="Shipping Policy (How long does it take to ship? What carriers do you use?)" value={formData.shippingPolicy} onChange={handleChange} required />
            <textarea style={{...styles.input, ...styles.textarea}} name="returnPolicy" placeholder="Return Policy (Do you accept returns? For how many days?)" value={formData.returnPolicy} onChange={handleChange} required />
          </div>

          <button style={styles.button} type="submit">Submit Application</button>
        </form>

        <p style={styles.switchText}>
          Just want to buy? <Link to="/register" style={styles.link}>Create a Customer Account</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '40px 20px' },
  card: { backgroundColor: '#FDFBF7', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', width: '100%', maxWidth: '600px', border: '1px solid #eee' },
  title: { color: '#1a1a1a', textAlign: 'center', marginTop: 0, marginBottom: '5px', fontSize: '28px' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: '20px', fontSize: '15px' },
  noticeBox: { backgroundColor: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '8px', marginBottom: '30px', fontSize: '13px', border: '1px solid #ffeeba' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  section: { display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '20px', borderBottom: '1px solid #eee' },
  sectionTitle: { color: '#8b5a2b', margin: '0 0 5px 0', fontSize: '18px' },
  row: { display: 'flex', gap: '15px' },
  input: { flexGrow: 1, height: '48px', padding: '0 16px', fontSize: '16px', border: '1px solid #E0E0E0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  textarea: { height: 'auto', minHeight: '100px', padding: '12px 16px', resize: 'vertical', lineHeight: '1.6' },
  button: { height: '48px', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: '600', marginTop: '10px', fontFamily: "'Poppins', sans-serif" },
  switchText: { textAlign: 'center', marginTop: '20px', color: '#555', fontSize: '14px' },
  link: { color: '#8b5a2b', fontWeight: '600' }
};

export default SellerRegister;