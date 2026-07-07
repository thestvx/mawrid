import { useState, useEffect } from 'react';
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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
  }, [location]);

  const getDashboardLink = () => {
    if (role === 'admin') return '/owner';
    if (role === 'seller') return '/dashboard/seller';
    return '/dashboard/buyer';
  };

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
            <>
              <span className="navbar__user-name">{user?.name || 'User'}</span>
              <button onClick={logout} className="btn btn--outline navbar__action-btn">
                {lang === 'ar' ? 'تسجيل خروج' : 'Log Out'}
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn btn--outline navbar__action-btn">
                {t('nav.signIn')}
              </Link>
            </>
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
