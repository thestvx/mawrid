import { Outlet, Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import './Dashboard.css';

const SELLER_SIDEBAR = [
  { key: 'dashboard.overview', path: '/dashboard/seller', icon: '📊' },
  { key: 'dashboard.products', path: '/dashboard/seller?tab=products', icon: '📦' },
  { key: 'dashboard.orders', path: '/dashboard/seller?tab=orders', icon: '📋' },
  { key: 'dashboard.analytics', path: '/dashboard/seller?tab=analytics', icon: '📈' },
  { key: 'dashboard.payouts', path: '/dashboard/seller?tab=payouts', icon: '💰' },
  { key: 'dashboard.settings', path: '/dashboard/seller?tab=settings', icon: '⚙️' },
];

const BUYER_SIDEBAR = [
  { key: 'dashboard.overview', path: '/dashboard/buyer', icon: '📊' },
  { key: 'dashboard.orders', path: '/dashboard/buyer?tab=orders', icon: '📋' },
  { key: 'dashboard.downloads', path: '/dashboard/buyer?tab=downloads', icon: '⬇️' },
  { key: 'dashboard.favorites', path: '/dashboard/buyer?tab=favorites', icon: '❤️' },
  { key: 'dashboard.settings', path: '/dashboard/buyer?tab=settings', icon: '⚙️' },
];

const ADMIN_SIDEBAR = [
  { key: 'dashboard.overview', path: '/dashboard/admin', icon: '📊' },
  { key: 'dashboard.userManagement', path: '/dashboard/admin?tab=users', icon: '👥' },
  { key: 'dashboard.sellerManagement', path: '/dashboard/admin?tab=sellers', icon: '🏪' },
  { key: 'dashboard.productModeration', path: '/dashboard/admin?tab=products', icon: '📦' },
  { key: 'dashboard.reports', path: '/dashboard/admin?tab=reports', icon: '📄' },
  { key: 'dashboard.platformSettings', path: '/dashboard/admin?tab=settings', icon: '⚙️' },
];

export default function DashboardLayout() {
  const { t, dir } = useLanguage();
  const location = useLocation();
  const path = location.pathname;

  let sidebar = BUYER_SIDEBAR;
  if (path.includes('/seller')) sidebar = SELLER_SIDEBAR;
  else if (path.includes('/admin')) sidebar = ADMIN_SIDEBAR;

  let roleLabel = t('dashboard.role.buyer');
  if (path.includes('/seller')) roleLabel = t('dashboard.role.seller');
  else if (path.includes('/admin')) roleLabel = t('dashboard.role.admin');

  return (
    <div className="dashboard" style={{ paddingTop: '80px' }}>
      <div className="dashboard__layout">
        <aside className="dashboard__sidebar">
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
                className={`dashboard__nav-link ${location.pathname + location.search === item.path || (location.pathname === item.path && !location.search) ? 'dashboard__nav-link--active' : ''}`}
              >
                <span className="dashboard__nav-icon">{item.icon}</span>
                <span>{t(item.key)}</span>
              </Link>
            ))}
          </nav>

          <div className="dashboard__sidebar-footer">
            <Link to="/" className="dashboard__back-btn">
              {dir === 'rtl' ? '← ' : '→ '}{t('nav.home')}
            </Link>
            <button className="dashboard__logout-btn">
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
    </div>
  );
}
