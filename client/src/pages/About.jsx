// About.jsx
import React from 'react';

function About() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>About HandmadeHub</h1>
      <p style={styles.text}>
        Welcome to HandmadeHub! We are a marketplace dedicated to connecting artisans and crafters with people who appreciate unique, high-quality handmade goods. 
      </p>
      <p style={styles.text}>
        Our mission is to support small businesses and independent creators by giving them a platform to sell their beautiful, handcrafted items to the world. Every product tells a story, and every purchase supports a real person.
      </p>
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '40px auto', padding: '20px' },
  title: { color: '#8b5a2b', textAlign: 'center' },
  text: { fontSize: '18px', lineHeight: '1.8', color: '#555', marginBottom: '20px' }
};

export default About;