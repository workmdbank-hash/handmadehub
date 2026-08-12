// App.jsx
import Wishlist from './pages/Wishlist';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import SellerDashboard from './pages/SellerDashboard';
import MyOrders from './pages/MyOrders';
import Login from './pages/Login';
import Register from './pages/Register';
import MyProducts from './pages/MyProducts';
import EditProduct from './pages/EditProduct';
import ProductDetail from './pages/ProductDetail';
import OrderSuccess from './pages/OrderSuccess';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import SellerProfile from './pages/SellerProfile';
import FAQ from './pages/FAQ';
import Profile from './pages/Profile';
import SellerOrders from './pages/SellerOrders';
import SellerRegister from './pages/SellerRegister';
import OrderDetails from './pages/OrderDetails';
import './App.css';

function App() {
  return (
    <Router>
      <div>
        <Header />
        
        <Routes>
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/" element={<Home />} />
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/success" element={<OrderSuccess />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/about" element={<About />} /> {/* NEW */}
          <Route path="/contact" element={<Contact />} /> {/* NEW */}
          <Route path="/faq" element={<FAQ />} /> {/* NEW */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/seller/:id" element={<SellerProfile />} />
          <Route path="/seller-orders" element={<SellerOrders />} />
          <Route path="/register/seller" element={<SellerRegister />} />
          <Route path="/seller/my-products" element={<MyProducts />} />
          <Route path="/seller/edit/:id" element={<EditProduct />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/seller/:id" element={<SellerProfile />} />
        </Routes>

        <CartDrawer />
        <Footer />
      </div>
    </Router>
  );
}

export default App;