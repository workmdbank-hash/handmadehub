// Contact.jsx
import React from 'react';

function Contact() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Contact Us</h1>
      <p style={styles.text}>Have a question? We'd love to hear from you!</p>
      
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Customer Support</h3>
        <p style={styles.cardText}>Email: support@handmadehub.com</p>
        <p style={styles.cardText}>Phone: +95 9 943721691</p>
        <p style={styles.cardText}>Hours: Mon - Fri, 9am - 5pm</p>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '40px auto', padding: '20px' },
  title: { color: '#8b5a2b', textAlign: 'center' },
  text: { fontSize: '18px', color: '#555', textAlign: 'center', marginBottom: '30px' },
  card: { backgroundColor: '#FDFBF7', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center' },
  cardTitle: { color: '#8b5a2b', marginTop: 0 },
  cardText: { fontSize: '16px', color: '#666', margin: '10px 0' }
};

export default Contact;