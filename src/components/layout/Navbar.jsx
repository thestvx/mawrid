import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { buildStoreSlugId } from '../../data/sellers';
import { CURRENCIES } from '../../lib/currency';
import Button from '../ui/Button';
import './Navbar.css';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

const NAV_ITEMS = [
  { key: 'nav.home', href: '/' },
  { key: 'nav.marketplace', href: '/marketplace' },
  { key: 'nav.sellers', href: '/sellers' },
];

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export default function Navbar() {
  const { t, lang, toggleLanguage } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { user, isAuthenticated, role, logout } = useAuth();
  const { count } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [curOpen, setCurOpen] = useState(false);
  const userRef = useRef(null);
  const curRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setUserOpen(false);
    setCurOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onDown = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
      if (curRef.current && !curRef.current.contains(e.target)) setCurOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/marketplace?q=${encodeURIComponent(q)}` : '/marketplace');
    setMobileOpen(false);
  };

  const getDashboardLink = () => {
    if (role === 'admin') return '/admin';
    if (role === 'seller') return '/dashboard/seller';
    return '/dashboard/buyer';
  };

  const browseMyStoreHref =
    role === 'seller' && user?.id
      ? `/sellers/${encodeURIComponent(user?.specialtyKey || user?.specialty || '')}/${encodeURIComponent(buildStoreSlugId(user))}`
      : null;

  const userName = user?.name || user?.email?.split('@')[0] || 'User';

  const handleLogout = async () => {
    setUserOpen(false);
    setMobileOpen(false);
    await logout();
  };

  return (
    <header className="mw-navbar">
      <div className="mw-container mw-navbar__inner">
        <Link to="/" className="mw-navbar__brand" aria-label={lang === 'ar' ? 'مَورد — الرئيسية' : 'Mawrid — Home'}>
          <img src="/logos/Black-logo.png" alt="مَورد" className="mw-navbar__logo" />
          <span className="mw-navbar__wordmark">مَورد</span>
        </Link>

        <nav className="mw-navbar__links" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) => `mw-navbar__link${isActive ? ' mw-navbar__link--active' : ''}`}
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <form className="mw-navbar__search" onSubmit={submitSearch} role="search">
          <span className="mw-search-wrap__icon"><SearchIcon /></span>
          <input
            type="search"
            className="mw-search"
            placeholder={t('nav.search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t('nav.search')}
          />
        </form>

        <div className="mw-navbar__actions">
          <div className="mw-navbar__cur" ref={curRef}>
            <button
              type="button"
              className="mw-navbar__icon-btn"
              onClick={() => setCurOpen((v) => !v)}
              aria-expanded={curOpen}
              aria-label={lang === 'ar' ? 'تغيير العملة' : 'Change currency'}
              title={currency}
            >
              <span className="mw-navbar__cur-code">{currency}</span>
            </button>
            {curOpen && (
              <div className="mw-navbar__menu">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    className={`mw-navbar__menu-item${c.code === currency ? ' mw-navbar__menu-item--active' : ''}`}
                    onClick={() => { setCurrency(c.code); setCurOpen(false); }}
                  >
                    <span>{c.symbol}</span>
                    <span>{c.code}</span>
                    <em>{lang === 'ar' ? c.name_ar : c.name_en}</em>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="mw-navbar__icon-btn"
            onClick={toggleLanguage}
            aria-label={t('nav.langSwitch')}
            title={t('nav.langSwitch')}
          >
            <GlobeIcon />
            <span>{lang === 'ar' ? 'EN' : 'AR'}</span>
          </button>

          <Link to="/cart" className="mw-navbar__icon-btn mw-navbar__cart" aria-label={lang === 'ar' ? 'سلة التسوق' : 'Shopping cart'}>
            <CartIcon />
            {count > 0 && <span className="mw-navbar__cart-badge">{count > 99 ? '99+' : count}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="mw-navbar__user" ref={userRef}>
              <button
                type="button"
                className="mw-navbar__avatar"
                onClick={() => setUserOpen((v) => !v)}
                aria-expanded={userOpen}
                aria-label={userName}
              >
                {user?.avatar_url
                  ? <img src={user.avatar_url} alt={userName} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  : getInitials(userName)}
              </button>
              {userOpen && (
                <div className="mw-navbar__menu mw-navbar__menu--user">
                  <div className="mw-navbar__menu-head">
                    <strong>{userName}</strong>
                    <span>{user?.email}</span>
                  </div>
                  <Link className="mw-navbar__menu-item" to={getDashboardLink()} onClick={() => setUserOpen(false)}>
                    {t('nav.dashboard')}
                  </Link>
                  {role === 'seller' && (
                    <Link className="mw-navbar__menu-item" to={browseMyStoreHref || '/storefront'} onClick={() => setUserOpen(false)}>
                      {t('nav.browseMyStore')}
                    </Link>
                  )}
                  <button type="button" className="mw-navbar__menu-item mw-navbar__menu-item--danger" onClick={handleLogout}>
                    {lang === 'ar' ? 'تسجيل خروج' : 'Log Out'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mw-navbar__auth">
              <Link to="/auth" className="mw-navbar__signin">{t('nav.signIn')}</Link>
              <Button to="/auth?mode=signup&role=seller" size="sm" variant="primary">
                {t('nav.openShop')}
              </Button>
            </div>
          )}

          <button
            type="button"
            className={`mw-navbar__burger${mobileOpen ? ' mw-navbar__burger--open' : ''}`}
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? (lang === 'ar' ? 'إغلاق القائمة' : 'Close menu') : (lang === 'ar' ? 'فتح القائمة' : 'Open menu')}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mw-navbar__mobile">
          <form className="mw-search-wrap" onSubmit={submitSearch} role="search">
            <span className="mw-search-wrap__icon"><SearchIcon /></span>
            <input
              type="search"
              className="mw-search"
              placeholder={t('nav.search')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t('nav.search')}
            />
          </form>
          <nav aria-label="Mobile">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) => `mw-navbar__mobile-link${isActive ? ' mw-navbar__mobile-link--active' : ''}`}
              >
                {t(item.key)}
              </NavLink>
            ))}
            <NavLink
              to={isAuthenticated ? getDashboardLink() : '/auth'}
              className="mw-navbar__mobile-link"
            >
              {isAuthenticated ? t('nav.dashboard') : t('nav.signIn')}
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}
