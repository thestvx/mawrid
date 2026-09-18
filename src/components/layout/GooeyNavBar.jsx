import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import GooeyNav from './GooeyNav';
import './GooeyNav.css';
import './PillNav.css';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarColor(name) {
  const colors = ['#ff6201', '#494bd6', '#10b981', '#a53c00', '#ef4444', '#f59e0b'];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const NAV_ITEMS = [
  { key: 'nav.home', href: '/' },
  { key: 'nav.marketplace', href: '/marketplace' },
];

export default function GooeyNavBar() {
  const { t, lang, toggleLanguage } = useLanguage();
  const { user, isAuthenticated, role, logout } = useAuth();
  const { count } = useCart();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const items = NAV_ITEMS.map((item) => ({
    label: t(item.key),
    href: item.href,
  }));

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease: 'power3.easeOut' });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease: 'power3.easeOut' });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease: 'power3.easeOut' });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease: 'power3.easeOut' });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power3.easeOut', transformOrigin: 'top center' }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          duration: 0.2,
          ease: 'power3.easeOut',
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' });
          },
        });
      }
    }
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
  };

  const getDashboardLink = () => {
    if (role === 'admin') return '/admin';
    if (role === 'seller') return '/dashboard/seller';
    return '/dashboard/buyer';
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const initials = getInitials(userName);
  const avatarColor = getAvatarColor(userName);
  const signUpForSellers = '/auth?mode=signup&role=seller';

  const cartPill = (
    <Link to="/cart" className="pill-cart" aria-label={lang === 'ar' ? 'سلة التسوق' : 'Shopping cart'}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 && (
        <span key={count} className="pill-cart__badge pill-cart__badge--pop">{count > 99 ? '99+' : count}</span>
      )}
    </Link>
  );

  const renderDesktopAuth = () => {
    if (isAuthenticated) {
      return (
        <div className="pill-auth" ref={userMenuRef}>
          <button
            className="pill-avatar"
            onClick={() => setUserMenuOpen((v) => !v)}
            aria-label={userName}
            aria-expanded={userMenuOpen}
          >
            <span className="pill-avatar__face" style={{ background: avatarColor }}>
              {initials}
            </span>
          </button>
          {userMenuOpen && (
            <div className="pill-auth__dropdown">
              <div className="pill-auth__header">
                <span className="pill-avatar__face pill-avatar__face--lg" style={{ background: avatarColor }}>
                  {initials}
                </span>
                <div>
                  <div className="pill-auth__name">{userName}</div>
                  <div className="pill-auth__email">{user?.email}</div>
                </div>
              </div>
              <div className="pill-auth__divider" />
              <Link className="pill-auth__item" to={getDashboardLink()} onClick={() => setUserMenuOpen(false)}>
                {t('nav.dashboard')}
              </Link>
              {role === 'seller' && (
                <Link className="pill-auth__item" to="/storefront" onClick={() => setUserMenuOpen(false)}>
                  {t('nav.openShop')}
                </Link>
              )}
              <div className="pill-auth__divider" />
              <button className="pill-auth__item pill-auth__item--danger" onClick={handleLogout}>
                {lang === 'ar' ? 'تسجيل خروج' : 'Log Out'}
              </button>
            </div>
          )}
        </div>
      );
    }
    return (
      <Link className="pill-cta" to="/auth">
        {t('nav.signIn')}
      </Link>
    );
  };

  return (
    <div className="gooey-navbar">
      <nav className="gooey-navbar__nav" aria-label="Primary">
        <Link className="pill-logo" to="/" aria-label={lang === 'ar' ? 'الرئيسية' : 'Home'}>
          <img src="/logos/Black-logo.png" alt="Mawrid - مَورد" className="pill-logo__img" />
        </Link>

        <div className="gooey-navbar__track">
          <GooeyNav items={items} />
          <div className="pill-extras">
            {cartPill}
            <button className="pill-lang" onClick={toggleLanguage} aria-label={t('nav.langSwitch')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>{lang === 'ar' ? 'EN' : 'AR'}</span>
            </button>
            {renderDesktopAuth()}
            {!isAuthenticated && (
              <Link className="pill-cta pill-cta--solid" to={signUpForSellers}>
                {t('nav.openShop')}
              </Link>
            )}
          </div>
        </div>

        <div className="pill-mobile-actions mobile-only">
          {cartPill}
          <button className="pill-lang" onClick={toggleLanguage} aria-label={t('nav.langSwitch')}>
            {lang === 'ar' ? 'EN' : 'AR'}
          </button>
          <button
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            ref={hamburgerRef}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </nav>

      <div className="mobile-menu-popover mobile-only" ref={mobileMenuRef}>
        <ul className="mobile-menu-list">
          {items.map((item) => (
            <li key={item.href}>
              <Link to={item.href} className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              to={isAuthenticated ? getDashboardLink() : '/auth'}
              className="mobile-menu-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {isAuthenticated ? t('nav.dashboard') : t('nav.signIn')}
            </Link>
          </li>
          {!isAuthenticated && (
            <li>
              <Link
                to={signUpForSellers}
                className="mobile-menu-link mobile-menu-link--solid"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.openShop')}
              </Link>
            </li>
          )}
          {isAuthenticated && (
            <>
              <li>
                <Link to="/storefront" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                  {t('nav.openShop')}
                </Link>
              </li>
              <li>
                <button className="mobile-menu-link mobile-menu-link--danger" onClick={handleLogout}>
                  {lang === 'ar' ? 'تسجيل خروج' : 'Log Out'}
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}