import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer style={styles.footer}>
      <p style={styles.copyright}>© 2024 HandmadeHub. All rights reserved.</p>
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
    backgroundColor: '#212121',
    color: '#FDFBF7',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    padding: '40px 20px',
    marginTop: '60px'
  },
  copyright: { margin: 0, fontSize: '14px', color: '#bbb' },
  links: { display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' },
  link: { color: '#FDFBF7', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }
};

export default Footer;