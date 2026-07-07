import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const NAV_LINKS = [
  { label_ar: 'الرئيسية', label_en: 'Home', path: '/' },
  { label_ar: 'السوق', label_en: 'Marketplace', path: '/marketplace' },
  { label_ar: 'البرمجيات', label_en: 'Software', path: '/marketplace' },
  { label_ar: 'التصميم', label_en: 'Design', path: '/marketplace' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isRtl = document.documentElement.dir === 'rtl';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo">
          <img
            src="/logos/Black-logo.png"
            alt="Mawrid - مَورد"
            className="navbar__logo-img"
            width="140"
            height="48"
          />
        </Link>

        <div className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path + link.label_en}
              to={link.path}
              className={`navbar__link ${location.pathname === link.path ? 'navbar__link--active' : ''}`}
            >
              {isRtl ? link.label_ar : link.label_en}
            </Link>
          ))}
        </div>

        <div className="navbar__actions">
          <Link to="/storefront" className="btn btn--outline navbar__action-btn">
            {isRtl ? 'تسجيل الدخول' : 'Sign In'}
          </Link>
          <Link to="/storefront" className="btn btn--primary navbar__action-btn">
            {isRtl ? 'فتح متجر' : 'Open Shop'}
          </Link>
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
