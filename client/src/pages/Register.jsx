import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { toast } from 'react-toastify';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser({ name, email, password, role: 'CUSTOMER' });
      toast.success('Registration successful! Please login.');
      navigate('/login'); 
    } catch (error) {
      toast.error('Registration failed. Email might already be in use.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join our handmade community today</p>
        
        <form style={styles.form} onSubmit={handleSubmit}>
          <input style={styles.input} type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input style={styles.input} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button style={styles.button} type="submit">Register</button>
        </form>

        <p style={styles.switchText}>
          Want to sell? <Link to="/register/seller" style={styles.link}>Create a Seller Account</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' },
  card: { backgroundColor: '#FDFBF7', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', border: '1px solid #eee' },
  title: { color: '#1a1a1a', textAlign: 'center', marginTop: 0, marginBottom: '5px', fontSize: '28px' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: '30px', fontSize: '15px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { height: '48px', padding: '0 16px', fontSize: '16px', border: '1px solid #E0E0E0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  button: { height: '48px', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: '600', marginTop: '10px', fontFamily: "'Poppins', sans-serif" },
  switchText: { textAlign: 'center', marginTop: '20px', color: '#555', fontSize: '14px' },
  link: { color: '#8b5a2b', fontWeight: '600' }
};

export default Register;