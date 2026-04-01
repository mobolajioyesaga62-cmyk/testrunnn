import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useStore } from './store/useStore';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/admin/ProtectedRoute';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import AdminPage from './pages/AdminPage';
import ContactPage from './pages/ContactPage';
import PaymentCallbackPage from './pages/PaymentCallbackPage';

function App() {
  const { setUser } = useStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
      })();
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <Router basename={import.meta.env.BASE_URL || '/'}>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/add/admin" element={<AdminPage />} />
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/new" element={<ShopPage />} />
              <Route path="/bestsellers" element={<ShopPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/account/:tab" element={<AccountPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<ContactPage />} />
              <Route path="/payment-callback" element={<PaymentCallbackPage />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
