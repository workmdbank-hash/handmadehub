// Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer style={styles.footer}>
      <p>© 2024 HandmadeHub. All rights reserved.</p>
      <div style={styles.links}>
        <Link to="/about" style={styles.link}>About Us</Link>
        <Link to="/contact" style={styles.link}>Contact</Link>
        <Link to="/faq" style={styles.link}>FAQ</Link>
        <Link to="/about" style={styles.link}>Terms of Service</Link>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#333',
    color: 'white',
    textAlign: 'center',
    padding: '20px',
    marginTop: '40px'
  },
  links: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '10px'
  },
  link: {
    color: '#bbb',
    textDecoration: 'none',
    fontSize: '14px'
  }
};

export default Footer;