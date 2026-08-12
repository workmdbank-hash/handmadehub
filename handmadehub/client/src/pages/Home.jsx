// Home.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getProducts, getCategories } from '../services/api';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [sortOption, setSortOption] = useState('newest'); // NEW: Sorting state

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Pass the sortOption to the API!
        const data = await getProducts(searchTerm, activeCategory, sortOption);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, activeCategory, sortOption]); // Re-run if search, category, OR sort changes

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(['All', ...cats]);
      } catch (error) {
        console.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      {!searchTerm && (
        <section style={styles.hero}>
          <div style={styles.heroOverlay}>
            <h1 className="hero-title" style={styles.heroTitle}>Unique Handmade Treasures</h1>
            <p className="hero-text" style={styles.heroText}>Discover one-of-a-kind items crafted with love by artisans.</p>
            <a href="#products" style={styles.heroBtn}>Shop Now</a>
          </div>
        </section>
      )}

      {/* CONSTRAINED CONTENT */}
      <main style={styles.main}>
        <h1 id="products" style={styles.title}>
          {searchTerm ? `Search results for: "${searchTerm}"` : 'Featured Handmade Products'}
        </h1>

        {/* CATEGORY & SORTING BAR */}
        {!searchTerm && (
          <div style={styles.filterBar}>
            <div style={styles.categoryBar}>
              {categories.map((cat) => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  style={activeCategory === cat ? styles.activeCatBtn : styles.catBtn}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            {/* Sort Dropdown */}
            <select 
              style={styles.sortDropdown} 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        )}

        {loading ? (
          <div className="spinner"></div>
        ) : products.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No products found.</p>
        ) : (
          <div className="product-grid" style={styles.productGrid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

const styles = {
  main: { maxWidth: '1200px', margin: '0 auto', padding: '40px 30px' },
  hero: {
    width: '100%',
    backgroundImage: 'url(https://images.unsplash.com/photo-1452860606245-08befc0ff44b?q=80&w=1920&auto=format&fit=crop)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: 'clamp(250px, 50vh, 500px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '20px'
  },
  heroTitle: { color: 'white', fontSize: 'clamp(28px, 6vw, 48px)', margin: 0, marginBottom: '10px' },
  heroText: { color: 'white', fontSize: 'clamp(16px, 3vw, 20px)', marginBottom: '20px' },
  heroBtn: { backgroundColor: '#8b5a2b', color: 'white', padding: '12px 30px', borderRadius: '5px', fontSize: '18px', fontWeight: 'bold', textDecoration: 'none' },
  title: { textAlign: 'center', color: '#333', marginBottom: '20px' },
  // Filter Bar Layout
  filterBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' },
  categoryBar: { 
    display: 'flex', 
    gap: '10px', 
    overflowX: 'auto', // Makes it scrollable!
    whiteSpace: 'nowrap', // Stops them from wrapping to the next line
    paddingBottom: '10px', // Adds space for the scrollbar
    scrollbarWidth: 'thin' // Makes the scrollbar thin and neat (Firefox)
  },
  catBtn: { padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid #ccc', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', color: '#555' },
  activeCatBtn: { padding: '8px 16px', backgroundColor: '#8b5a2b', border: '1px solid #8b5a2b', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', color: 'white', fontWeight: 'bold' },
  // Sort Dropdown Style
  sortDropdown: { padding: '8px 16px', fontSize: '14px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer', outline: 'none' },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' }
};

export default Home;