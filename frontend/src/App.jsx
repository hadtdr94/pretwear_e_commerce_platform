import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import StorefrontLayout from './layouts/StorefrontLayout';
import HomePage from './pages/Home/HomePage';
import ShopPage from './pages/Shop/ShopPage';
import ProductPage from './pages/Product/ProductPage';
import CustomizationPage from './pages/Customization/CustomizationPage';
import B2BPage from './pages/B2B/B2BPage';
import AboutPage from './pages/About/AboutPage';
import ContactPage from './pages/Contact/ContactPage';
import CartPage from './pages/Cart/CartPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import CollectionsPage from './pages/Collections/CollectionsPage';
import AccountPage from './pages/Account/AccountPage';
import AdminPage from './pages/Admin/AdminPage';

function NotFound() {
  return (
    <div className="container-shell py-20 text-center">
      <h1 className="font-heading text-4xl font-bold uppercase text-primary">Page Not Found</h1>
      <p className="mt-3 text-on-surface-variant">The page you requested does not exist.</p>
      <a href="/" className="btn-primary mt-6">Return Home</a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/customization" element={<CustomizationPage />} />
          <Route path="/b2b" element={<B2BPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/admin/*" element={<AdminPage />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
