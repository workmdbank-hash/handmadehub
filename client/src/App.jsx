import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import MobileHeader from './components/MobileHeader';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import SellerDashboard from './pages/SellerDashboard';
import SellerDashboardHome from './pages/SellerDashboardHome';
import SellerOrders from './pages/SellerOrders';
import MyProducts from './pages/MyProducts';
import EditProduct from './pages/EditProduct';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import SellerRegister from './pages/SellerRegister';
import ProductDetail from './pages/ProductDetail';
import OrderSuccess from './pages/OrderSuccess';
import AdminDashboard from './pages/AdminDashboard';
import Wishlist from './pages/Wishlist';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Profile from './pages/Profile';
import SellerProfile from './pages/SellerProfile';
import ShopPage from './pages/ShopPage';
import SellerShopSettings from './pages/SellerShopSettings';
import Messages from './pages/Messages';
import { useIsMobile } from './hooks/useIsMobile';
import AdminSellers from './pages/AdminSellers';
import AdminCustomers from './pages/AdminCustomers';
import AdminProducts from './pages/AdminProducts';
import AdminWithdrawals from './pages/AdminWithdrawals';
import './App.css';

function App() {
  // NEW: Hook must be inside the function!
  const isMobile = useIsMobile();

  return (
    <Router>
      <div>
        {/* Switch between Desktop and Mobile Header */}
        {isMobile ? <MobileHeader /> : <Header />}
        
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/seller/:id" element={<SellerProfile />} />
          <Route path="/shop/:slug" element={<ShopPage />} />
          <Route path="/success" element={<OrderSuccess />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/seller" element={<SellerRegister />} />
          
          {/* Customer Routes */}
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          
          {/* Seller Routes */}
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/seller-dashboard" element={<SellerDashboardHome />} />
          <Route path="/seller-orders" element={<SellerOrders />} />
          <Route path="/seller/my-products" element={<MyProducts />} />
          <Route path="/seller/edit/:id" element={<EditProduct />} />
          <Route path="/seller/shop-settings" element={<SellerShopSettings />} />
          
          {/* Admin Routes */}
<Route path="/admin" element={<AdminDashboard />} />
<Route path="/admin/sellers" element={<AdminSellers />} />
<Route path="/admin/customers" element={<AdminCustomers />} />
<Route path="/admin/products" element={<AdminProducts />} />
<Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
          {/* Info Routes */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>

        <CartDrawer />
        <Footer />
      </div>
    </Router>
  );
}

export default App;