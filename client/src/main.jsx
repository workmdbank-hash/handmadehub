// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import 'react-toastify/dist/ReactToastify.css'; // Import Toast CSS
import { ToastContainer } from 'react-toastify'; // Import Toast Component

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider>
      <App />
      {/* This is the popup container that will appear on the screen */}
      <ToastContainer position="bottom-right" autoClose={2000} />
    </CartProvider>
  </React.StrictMode>,
)