import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
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

export default function PillNav({ ease = 'power3.easeOut', initialLoadAnimation = false }) {
  const { t, lang, dir, toggleLanguage } = useLanguage();
  const { user, isAuthenticated, role, logout } = useAuth();
  const location = useLocation();

  const isRtl = dir === 'rtl';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);
  const logoRef = useRef(null);

  const items = NAV_ITEMS.map((item) => ({
    label: t(item.key),
    href: item.href,
    active: item.href === '/' ? location.pathname === '/' : location.pathname.startsWith(item.href),
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

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

        if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1 });
    }

    if (initialLoadAnimation) {
      const logo = logoRef.current;
      const navItems = navItemsRef.current;

      if (logo) {
        gsap.set(logo, { scale: 0 });
        gsap.to(logo, { scale: 1, duration: 0.6, ease });
      }

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: 'hidden' });
        gsap.to(navItems, { width: 'auto', duration: 0.6, ease });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = (i) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto',
    });
  };

  const handleLeave = (i) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto',
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: 'top center',
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
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
    <div className="pill-nav-container">
      <nav className="pill-nav" aria-label="Primary">
        <Link className="pill-logo" to="/" aria-label={isRtl ? 'الرئيسية' : 'Home'} ref={logoRef}>
          <img src="/logos/Black-logo.png" alt="Mawrid - مَورد" className="pill-logo__img" />
        </Link>

        <div className="pill-nav-items desktop-only" ref={navItemsRef}>
          <ul className="pill-list" role="menubar">
            {items.map((item, i) => (
              <li key={item.href} role="none">
                <Link
                  role="menuitem"
                  to={item.href}
                  className={`pill${item.active ? ' is-active' : ''}`}
                  aria-label={item.label}
                  onMouseEnter={() => handleEnter(i)}
                  onMouseLeave={() => handleLeave(i)}
                >
                  <span
                    className="hover-circle"
                    aria-hidden="true"
                    ref={(el) => {
                      circleRefs.current[i] = el;
                    }}
                  />
                  <span className="label-stack">
                    <span className="pill-label">{item.label}</span>
                    <span className="pill-label-hover" aria-hidden="true">
                      {item.label}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="pill-extras">
            <button
              className="pill-lang"
              onClick={toggleLanguage}
              aria-label={t('nav.langSwitch')}
            >
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
              <Link
                to={item.href}
                className={`mobile-menu-link${item.active ? ' is-active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
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
                <Link
                  to="/storefront"
                  className="mobile-menu-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
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