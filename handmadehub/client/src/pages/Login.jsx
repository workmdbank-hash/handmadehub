// Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      localStorage.setItem('email', data.email); // NEW
      localStorage.setItem('profileImage', data.profileImage); // NEW
      localStorage.setItem('userId', data.id);
      toast.success('Login successful!');
      navigate('/'); 
    } catch (error) {
      toast.error('Login failed. Check your email and password.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Login</h1>
      <form style={styles.form} onSubmit={handleSubmit}>
        <input 
          style={styles.input} 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          style={styles.input} 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button style={styles.button} type="submit">Login</button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: '400px', margin: '40px auto', padding: '20px' },
  title: { color: '#8b5a2b', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  input: { padding: '12px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' },
  button: { padding: '12px', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '5px', fontSize: '18px', cursor: 'pointer' }
};

export default Login;