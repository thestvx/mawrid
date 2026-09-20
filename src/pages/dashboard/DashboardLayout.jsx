import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import DashIcon from '../../components/dashboard/DashIcon';
import './Dashboard.css';

const SELLER_SIDEBAR = [
  { key: 'dashboard.overview', path: '/dashboard/seller', icon: 'overview' },
  { key: 'dashboard.store', path: '/dashboard/seller?tab=store', icon: 'stores' },
  { key: 'dashboard.products', path: '/dashboard/seller?tab=products', icon: 'products' },
  { key: 'dashboard.orders', path: '/dashboard/seller?tab=orders', icon: 'orders' },
  { key: 'dashboard.analytics', path: '/dashboard/seller?tab=analytics', icon: 'analytics' },
  { key: 'dashboard.payouts', path: '/dashboard/seller?tab=payouts', icon: 'payouts' },
  { key: 'dashboard.settings', path: '/dashboard/seller?tab=settings', icon: 'settings' },
];

const BUYER_SIDEBAR = [
  { key: 'dashboard.overview', path: '/dashboard/buyer', icon: 'overview' },
  { key: 'dashboard.orders', path: '/dashboard/buyer?tab=orders', icon: 'orders' },
  { key: 'dashboard.downloads', path: '/dashboard/buyer?tab=downloads', icon: 'downloads' },
  { key: 'dashboard.favorites', path: '/dashboard/buyer?tab=favorites', icon: 'favorites' },
  { key: 'dashboard.settings', path: '/dashboard/buyer?tab=settings', icon: 'settings' },
];

const ADMIN_SIDEBAR = [
  { key: 'dashboard.overview', path: '/admin', icon: 'overview' },
  { key: 'dashboard.subscriptions', path: '/admin?tab=subscriptions', icon: 'subscription' },
  { key: 'dashboard.userManagement', path: '/admin?tab=users', icon: 'users' },
  { key: 'dashboard.sellerManagement', path: '/admin?tab=sellers', icon: 'stores' },
  { key: 'dashboard.productModeration', path: '/admin?tab=products', icon: 'products' },
  { key: 'dashboard.orders', path: '/admin?tab=orders', icon: 'orders' },
  { key: 'dashboard.payouts', path: '/admin?tab=payouts', icon: 'payouts' },
  { key: 'dashboard.categories', path: '/admin?tab=categories', icon: 'layers' },
  { key: 'dashboard.reviews', path: '/admin?tab=reviews', icon: 'message' },
  { key: 'dashboard.reports', path: '/admin?tab=reports', icon: 'reports' },
  { key: 'dashboard.platformSettings', path: '/admin?tab=settings', icon: 'settings' },
];

export default function DashboardLayout() {
  const { t, dir } = useLanguage();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const isAdminArea = path.includes('/admin') || path.includes('/owner');
  const [mobileOpen, setMobileOpen] = useState(false);

  let sidebar = BUYER_SIDEBAR;
  if (path.includes('/seller')) sidebar = SELLER_SIDEBAR;
  else if (isAdminArea) sidebar = ADMIN_SIDEBAR;

  let roleLabel = t('dashboard.role.buyer');
  if (path.includes('/seller')) roleLabel = t('dashboard.role.seller');
  else if (isAdminArea) roleLabel = t('dashboard.role.admin');

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const handleLogout = async () => {
    await logout();
    navigate(isAdminArea ? '/auth?mode=signin' : '/');
  };

  return (
    <div className={`dashboard ${isAdminArea ? 'dashboard--admin' : ''}`} style={{ paddingTop: isAdminArea ? 0 : '80px' }}>
      {mobileOpen && (
        <div className="dashboard__mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}
      <div className="dashboard__layout">
        <aside className={`dashboard__sidebar ${mobileOpen ? 'dashboard__sidebar--mobile-open' : ''}`}>
          <div className="dashboard__sidebar-header">
            <Link to="/">
              <img src="/logos/Black-logo.png" alt="Mawrid" className="dashboard__logo" width="140" height="47" />
            </Link>
            <span className="dashboard__role-badge">{roleLabel}</span>
          </div>

          <nav className="dashboard__nav">
            {sidebar.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className={`dashboard__nav-link ${location.pathname + location.search === item.path ? 'dashboard__nav-link--active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="dashboard__nav-icon"><DashIcon name={item.icon} size={18} /></span>
                <span>{t(item.key)}</span>
              </Link>
            ))}
          </nav>

          <div className="dashboard__sidebar-footer">
            <Link to="/" className="dashboard__back-btn">
              {dir === 'rtl' ? '← ' : '→ '}{t('nav.home')}
            </Link>
            <button className="dashboard__logout-btn" onClick={handleLogout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {t('dashboard.logout')}
            </button>
          </div>
        </aside>

        <main className="dashboard__main">
          <Outlet />
        </main>
      </div>

      <button
        className="dashboard__mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>
    </div>
  );
}
