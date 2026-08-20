import React, { useState, useEffect } from 'react';
import { createOrUpdateShop, getMyShop } from '../services/api';
import { toast } from 'react-toastify';

function SellerShopSettings() {
  const [formData, setFormData] = useState({
    name: '', description: '', about: '', shippingPolicy: '', returnPolicy: '', processingTime: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [currentLogo, setCurrentLogo] = useState('');
  const [currentBanner, setCurrentBanner] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const shop = await getMyShop();
        if (shop) {
          setFormData({
            name: shop.name || '',
            description: shop.description || '',
            about: shop.about || '',
            shippingPolicy: shop.shippingPolicy || '',
            returnPolicy: shop.returnPolicy || '',
            processingTime: shop.processingTime || ''
          });
          setCurrentLogo(shop.logo || '');
          setCurrentBanner(shop.banner || '');
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchShop();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogoChange = (e) => setLogoFile(e.target.files[0]);
  const handleBannerChange = (e) => setBannerFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('about', formData.about);
      data.append('shippingPolicy', formData.shippingPolicy);
      data.append('returnPolicy', formData.returnPolicy);
      data.append('processingTime', formData.processingTime);
      
      if (logoFile) data.append('logo', logoFile);
      if (bannerFile) data.append('banner', bannerFile);

      const updatedShop = await createOrUpdateShop(data);
      localStorage.setItem('shopSlug', updatedShop.slug); // NEW: Save the new slug
      toast.success('Shop saved successfully!');
      
      // Refresh images if new ones were uploaded
      if (logoFile) setCurrentLogo(URL.createObjectURL(logoFile));
      if (bannerFile) setCurrentBanner(URL.createObjectURL(bannerFile));
      setLogoFile(null);
      setBannerFile(null);
      document.getElementById('logoInput').value = '';
      document.getElementById('bannerInput').value = '';
    } catch (error) {
      toast.error('Failed to save shop.');
    }
  };

  if (loading) return <div className="spinner"></div>;

  // Helper to show image source
   // Helper to show image source (Checks for newly selected files first!)
  const getLogoSrc = () => {
    if (logoFile) return URL.createObjectURL(logoFile);
    if (currentLogo && currentLogo.startsWith('/images')) return `https://handmadehub-mm.onrender.com${currentLogo}`;
    return currentLogo;
  };
  
  const getBannerSrc = () => {
    if (bannerFile) return URL.createObjectURL(bannerFile);
    if (currentBanner && currentBanner.startsWith('/images')) return `https://handmadehub-mm.onrender.com${currentBanner}`;
    return currentBanner;
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Shop Settings</h1>
      <p style={styles.subtitle}>Configure your storefront, policies, and branding.</p>
      
      <form style={styles.form} onSubmit={handleSubmit}>
        {/* NEW: Banner Upload */}
        <div style={styles.uploadBox}>
          <label style={styles.label}>Shop Banner (Cover Photo)</label>
                  <div style={styles.bannerPreview}>
            {(bannerFile || currentBanner) ? <img src={getBannerSrc()} alt="Banner Preview" style={styles.bannerImg} /> : <div style={styles.placeholderText}>No Banner Uploaded</div>}
          </div>
          <input id="bannerInput" type="file" accept="image/*" onChange={handleBannerChange} style={{ display: 'none' }} />
          <label htmlFor="bannerInput" style={styles.uploadBtn}>📷 Upload Banner</label>
        </div>

        {/* NEW: Logo Upload */}
        <div style={styles.uploadBox}>
          <label style={styles.label}>Shop Logo (Profile Picture)</label>
          <div style={styles.logoPreview}>
            {(logoFile || currentLogo) ? <img src={getLogoSrc()} alt="Logo Preview" style={styles.logoImg} /> : <div style={styles.placeholderText}>No Logo</div>}
          </div>
          <input id="logoInput" type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
          <label htmlFor="logoInput" style={styles.uploadBtn}>📷 Upload Logo</label>
        </div>

        <label style={styles.label}>Shop Name</label>
        <input style={styles.input} type="text" name="name" placeholder="e.g., Handmade Treasures" value={formData.name} onChange={handleChange} required />
        
        <label style={styles.label}>Short Description</label>
        <input style={styles.input} type="text" name="description" placeholder="A brief tagline for your shop" value={formData.description} onChange={handleChange} />
        
        <label style={styles.label}>About Your Shop</label>
        <textarea style={{...styles.input, ...styles.textarea}} name="about" placeholder="Tell customers your story..." value={formData.about} onChange={handleChange} />
        
        <label style={styles.label}>Processing Time</label>
        <input style={styles.input} type="text" name="processingTime" placeholder="e.g., 3-5 business days" value={formData.processingTime} onChange={handleChange} />
        
        <label style={styles.label}>Shipping Policy</label>
        <textarea style={{...styles.input, ...styles.textarea}} name="shippingPolicy" placeholder="Explain your shipping methods..." value={formData.shippingPolicy} onChange={handleChange} />
        
        <label style={styles.label}>Return Policy</label>
        <textarea style={{...styles.input, ...styles.textarea}} name="returnPolicy" placeholder="Explain your return policy..." value={formData.returnPolicy} onChange={handleChange} />

        <button style={styles.button} type="submit">Save Shop Settings</button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '40px auto', padding: '20px' },
  title: { color: '#8b5a2b', textAlign: 'center', marginBottom: '5px' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: '30px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#FDFBF7', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee' },
  label: { fontSize: '14px', fontWeight: '600', color: '#333' },
  input: { height: '48px', padding: '0 16px', fontSize: '16px', border: '1px solid #E0E0E0', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  textarea: { height: 'auto', minHeight: '100px', padding: '12px 16px', resize: 'vertical', lineHeight: '1.6' },
  button: { height: '48px', backgroundColor: '#8b5a2b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: '600', marginTop: '10px' },
  // NEW: Upload Styles
  uploadBox: { display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #E0E0E0' },
  bannerPreview: { width: '100%', height: '150px', backgroundColor: '#e0e0e0', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  bannerImg: { width: '100%', height: '100%', objectFit: 'cover' },
  logoPreview: { width: '100px', height: '100px', backgroundColor: '#e0e0e0', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' },
  logoImg: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholderText: { color: '#888', fontSize: '14px', fontWeight: '600' },
  uploadBtn: { padding: '10px 20px', backgroundColor: '#333', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', textAlign: 'center' }
};

export default SellerShopSettings;