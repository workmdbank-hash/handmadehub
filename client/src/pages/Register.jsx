// Register.jsx
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
      // We hardcode the role to CUSTOMER here
      await registerUser({ name, email, password, role: 'CUSTOMER' });
      toast.success('Registration successful! Please login.');
      navigate('/login'); 
    } catch (error) {
      toast.error('Registration failed. Email might already be in use.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Create a Customer Account</h1>
      <p style={styles.subtitle}>Shop unique handmade items from around the world.</p>
      
      <form style={styles.form} onSubmit={handleSubmit}>
        <input style={styles.input} type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input style={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button style={styles.button} type="submit">Register</button>
      </form>

      <p style={styles.switchText}>
        Want to sell your handmade goods? <Link to="/register/seller" style={styles.link}>Create a Seller Account</Link>
      </p>
    </div>
  );
}

const styles = {
  container: { maxWidth: '400px', margin: '40px auto', padding: '20px' },
  title: { color: '#8b5a2b', textAlign: 'center' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: '30px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  input: { padding: '12px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' },
  button: { padding: '12px', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '5px', fontSize: '18px', cursor: 'pointer' },
  switchText: { textAlign: 'center', marginTop: '20px', color: '#555', fontSize: '14px' },
  link: { color: '#8b5a2b', fontWeight: 'bold' }
};

export default Register;