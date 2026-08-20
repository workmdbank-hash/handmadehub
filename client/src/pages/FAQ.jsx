// FAQ.jsx
import React from 'react';

function FAQ() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Frequently Asked Questions</h1>
      
      <div style={styles.qaBox}>
        <h3 style={styles.question}>How long does shipping take?</h3>
        <p style={styles.answer}>Since items are handmade, shipping usually takes 3-7 business days depending on the seller's production time.</p>
      </div>

      <div style={styles.qaBox}>
        <h3 style={styles.question}>Can I return a handmade item?</h3>
        <p style={styles.answer}>Because items are unique, returns depend on the individual seller's policies. Please check the product description or contact the seller directly.</p>
      </div>

      <div style={styles.qaBox}>
        <h3 style={styles.question}>How do I become a seller?</h3>
        <p style={styles.answer}>Simply click "Register", create an account, and you can immediately start adding products from our Seller Dashboard!</p>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '40px auto', padding: '20px' },
  title: { color: '#8b5a2b', textAlign: 'center', marginBottom: '30px' },
  qaBox: { backgroundColor: '#FDFBF7', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  question: { color: '#333', margin: '0 0 10px 0' },
  answer: { color: '#666', margin: 0, lineHeight: '1.6' }
};

export default FAQ;