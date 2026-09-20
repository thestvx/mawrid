import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LoadingScreen from './components/ui/LoadingScreen';
import ClickSpark from './components/ui/ClickSpark';
import DotField from './components/ui/DotField';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Storefront from './components/storefront/Storefront';
import Details from './pages/Details';
import SellersPage from './pages/SellersPage';
import SellerStorefront from './pages/SellerStorefront';
import StorePage from './pages/StorePage';
import SubscriptionGroupPage from './pages/SubscriptionGroupPage';
import SubscriptionPage from './pages/SubscriptionPage';
import Auth from './pages/Auth';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import SellerDashboard from './pages/dashboard/SellerDashboard';
import BuyerDashboard from './pages/dashboard/BuyerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AdminGate from './pages/dashboard/AdminGate';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  const isProtected = location.pathname === '/admin' || location.pathname === '/owner';
  const [loading, setLoading] = useState(() => !isProtected);

  useEffect(() => {
    const isAsset = (t) => t && t instanceof Element && (t.tagName === 'IMG' || t.tagName === 'SVG' || t.tagName === 'CANVAS' || !!t.closest('img, svg, canvas'));
    const block = (e) => {
      if (isAsset(e.target)) e.preventDefault();
    };
    document.addEventListener('contextmenu', block);
    document.addEventListener('dragstart', block);
    return () => {
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('dragstart', block);
    };
  }, []);

  return (
    <>
      {loading && <LoadingScreen onFinish={() => setLoading(false)} />}
      <ClickSpark sparkColor="#F97316" sparkSize={16} sparkRadius={22} sparkCount={12} duration={400}>
        <ScrollToTop />
        <div className="site-dotfield" aria-hidden="true">
          <DotField
            dotRadius={3}
            dotSpacing={15}
            bulgeStrength={72}
            sparkle={false}
            waveAmplitude={0}
            cursorRadius={500}
            cursorForce={0.1}
            bulgeOnly
            gradientFrom="rgba(255, 98, 1, 0.30)"
            gradientTo="rgba(255, 189, 154, 0.18)"
          />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/storefront" element={<Storefront />} />
              <Route path="/sellers" element={<SellersPage />} />
              <Route path="/sellers/:specialty" element={<SellersPage />} />
              <Route path="/sellers/:specialty/:id" element={<SellerStorefront />} />
              <Route path="/store/:slug" element={<StorePage />} />
              <Route path="/product/:id" element={<Details />} />
              <Route path="/category/:groupKey" element={<SubscriptionGroupPage />} />
              <Route path="/subscription/:subKey" element={<SubscriptionPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<BuyerDashboard />} />
                <Route path="buyer" element={<BuyerDashboard />} />
                <Route path="seller" element={<SellerDashboard />} />
              </Route>
            </Route>
            <Route path="/admin" element={<AdminGate />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<AdminDashboard />} />
              </Route>
            </Route>
            <Route path="/owner" element={<AdminGate />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<AdminDashboard />} />
              </Route>
            </Route>
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </div>
      </ClickSpark>
    </>
  );
}