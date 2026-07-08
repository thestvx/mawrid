import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LoadingScreen from './components/ui/LoadingScreen';
import ClickSpark from './components/ui/ClickSpark';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Storefront from './components/storefront/Storefront';
import AdminDashboardStitch from './components/storefront/AdminDashboardStitch';
import Details from './pages/Details';
import Auth from './pages/Auth';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import SellerDashboard from './pages/dashboard/SellerDashboard';
import BuyerDashboard from './pages/dashboard/BuyerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <LoadingScreen onFinish={() => setLoading(false)} />}
      <ClickSpark sparkColor="#F97316" sparkSize={16} sparkRadius={22} sparkCount={12} duration={400}>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/storefront" element={<Storefront />} />
            <Route path="/details" element={<Details />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<BuyerDashboard />} />
              <Route path="buyer" element={<BuyerDashboard />} />
              <Route path="seller" element={<SellerDashboard />} />
            </Route>
            <Route path="/owner" element={<AdminDashboardStitch />} />
          </Route>
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </ClickSpark>
    </>
  );
}
