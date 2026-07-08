import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const NAV_LINKS = [
  { key: 'nav.home', path: '/' },
  { key: 'nav.marketplace', path: '/marketplace' },
  { key: 'nav.software', path: '/marketplace' },
  { key: 'nav.design', path: '/marketplace' },
];

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarColor(name) {
  const colors = ['#ff6201', '#494bd6', '#10b981', '#a53c00', '#ef4444', '#f59e0b'];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const { t, lang, toggleLanguage } = useLanguage();
  const { user, isAuthenticated, role, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDashboardLink = () => {
    if (role === 'admin') return '/owner';
    if (role === 'seller') return '/dashboard/seller';
    return '/dashboard/buyer';
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const initials = getInitials(userName);
  const avatarColor = getAvatarColor(userName);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo">
          <img
            src="/logos/Black-logo.png"
            alt="Mawrid - مَورد"
            className="navbar__logo-img"
            width="240"
            height="80"
          />
        </Link>

        <div className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              to={link.path}
              className={`navbar__link ${location.pathname === link.path ? 'navbar__link--active' : ''}`}
            >
              {t(link.key)}
            </Link>
          ))}
          {isAuthenticated && (
            <Link to={getDashboardLink()} className="navbar__link navbar__link--dashboard">
              {t('nav.dashboard')}
            </Link>
          )}
        </div>

        <div className="navbar__actions">
          <button onClick={toggleLanguage} className="navbar__lang-btn" aria-label={t('nav.langSwitch')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>{lang === 'ar' ? 'EN' : 'AR'}</span>
          </button>

          {isAuthenticated ? (
            <div className="navbar__user-menu" ref={userMenuRef}>
              <button className="navbar__user-trigger" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className="navbar__avatar" style={{ background: avatarColor }}>
                  {initials}
                </div>
                <span className="navbar__user-name">{userName}</span>
                <svg className={`navbar__chevron ${userMenuOpen ? 'navbar__chevron--open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="navbar__dropdown">
                  <div className="navbar__dropdown-header">
                    <div className="navbar__avatar navbar__avatar--lg" style={{ background: avatarColor }}>
                      {initials}
                    </div>
                    <div>
                      <div className="navbar__dropdown-name">{userName}</div>
                      <div className="navbar__dropdown-email">{user?.email}</div>
                    </div>
                  </div>
                  <div className="navbar__dropdown-divider" />
                  <Link to={getDashboardLink()} className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                    {t('nav.dashboard')}
                  </Link>
                  {role === 'seller' && (
                    <Link to="/storefront" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                      {t('nav.openShop')}
                    </Link>
                  )}
                  <Link to="/auth?mode=signup" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                    {lang === 'ar' ? 'الإعدادات' : 'Settings'}
                  </Link>
                  <div className="navbar__dropdown-divider" />
                  <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    {lang === 'ar' ? 'تسجيل خروج' : 'Log Out'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="btn btn--outline navbar__action-btn navbar__action-btn--login">
              {t('nav.signIn')}
            </Link>
          )}

          {isAuthenticated && role === 'seller' && (
            <Link to="/storefront" className="btn btn--primary navbar__action-btn">
              {t('nav.openShop')}
            </Link>
          )}

          {!isAuthenticated && (
            <Link to="/auth?mode=signup&role=seller" className="btn btn--primary navbar__action-btn">
              {t('nav.openShop')}
            </Link>
          )}

          <button
            className="navbar__hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <span className={`navbar__hamburger-line ${mobileOpen ? 'open' : ''}`} />
            <span className={`navbar__hamburger-line ${mobileOpen ? 'open' : ''}`} />
            <span className={`navbar__hamburger-line ${mobileOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="navbar__mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}
    </nav>
  );
}
