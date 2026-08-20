import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { toast } from 'react-toastify';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('name', data.name);
      localStorage.setItem('email', data.email);
      localStorage.setItem('userId', data.id);
      localStorage.setItem('profileImage', data.profileImage);
      localStorage.setItem('shopSlug', data.shopSlug || ''); // NEW
      toast.success('Login successful!');
      navigate('/'); 
    } catch (error) {
      toast.error('Login failed. Check your email and password.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Login to your HandmadeHub account</p>
        
        <form style={styles.form} onSubmit={handleSubmit}>
          <input style={styles.input} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button style={styles.button} type="submit">Login</button>
        </form>

        <p style={styles.switchText}>
          Don't have an account? <Link to="/register" style={styles.link}>Sign up here</Link>
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
  button: { height: '48px', backgroundColor: '#1a1a1a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: '600', marginTop: '10px', fontFamily: "'Poppins', sans-serif" },
  switchText: { textAlign: 'center', marginTop: '20px', color: '#555', fontSize: '14px' },
  link: { color: '#8b5a2b', fontWeight: '600' }
};

export default Login;