import { Link } from 'react-router-dom';
import './Footer.css';

const FOOTER_LINKS = [
  { label_ar: 'سياسة الخصوصية', label_en: 'Privacy Policy', path: '#' },
  { label_ar: 'شروط الخدمة', label_en: 'Terms of Service', path: '#' },
  { label_ar: 'سياسة الاسترجاع', label_en: 'Refund Policy', path: '#' },
  { label_ar: 'اتصل بنا', label_en: 'Contact Us', path: '#' },
];

export default function Footer() {
  const isRtl = document.documentElement.dir === 'rtl';

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/">
            <img
              src="/logos/Black-logo.png"
              alt="Mawrid - مَورد"
              className="footer__logo"
              width="100"
              height="34"
            />
          </Link>
          <p className="footer__tagline">
            {isRtl
              ? 'منصة رقمية تجمع المبدعين والمشترين في سوق واحد متكامل'
              : 'A digital marketplace connecting creators and buyers in one integrated platform.'}
          </p>
        </div>

        <nav className="footer__links">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.label_en} to={link.path} className="footer__link">
              {isRtl ? link.label_ar : link.label_en}
            </Link>
          ))}
        </nav>

        <p className="footer__copy">
          &copy; {new Date().getFullYear()} Mawrid &mdash; {isRtl ? 'مَورد' : 'Mawrid'}.{' '}
          {isRtl ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
        </p>
      </div>
    </footer>
  );
}
