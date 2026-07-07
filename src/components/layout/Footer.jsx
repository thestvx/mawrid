import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import './Footer.css';

const PAYMENT_LOGOS = [
  { src: '/minilogos/logo-visa.png', alt: 'Visa' },
  { src: '/minilogos/logo-mastercard.png', alt: 'Mastercard' },
  { src: '/minilogos/logo-binance.png', alt: 'Binance' },
  { src: '/minilogos/logo-usdt.png', alt: 'USDT' },
  { src: '/minilogos/logo-eccp.png', alt: 'ECCP' },
  { src: '/minilogos/logo-bridimop.png', alt: 'Bridimop' },
];

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__grid">
          <div className="footer__section footer__section--brand">
            <Link to="/" className="footer__logo-link">
              <img
                src="/logos/Black-logo.png"
                alt="Mawrid - مَورد"
                className="footer__logo"
                width="240"
                height="80"
              />
            </Link>
            <p className="footer__tagline">{t('footer.tagline')}</p>
            <div className="footer__social">
              <a href="#" className="footer__social-link" aria-label="Twitter/X">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="#" className="footer__social-link" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
              <a href="#" className="footer__social-link" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
              <a href="#" className="footer__social-link" aria-label="Telegram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
              </a>
            </div>
          </div>

          <div className="footer__section">
            <h4 className="footer__heading">{t('footer.about')}</h4>
            <div className="footer__links">
              <Link to="/marketplace" className="footer__link">{t('nav.marketplace')}</Link>
              <Link to="/auth?mode=signup&role=seller" className="footer__link">{t('nav.openShop')}</Link>
              <a href="#" className="footer__link">{t('footer.sellerGuide')}</a>
              <a href="#" className="footer__link">{t('footer.faq')}</a>
            </div>
          </div>

          <div className="footer__section">
            <h4 className="footer__heading">{t('footer.helpCenter')}</h4>
            <div className="footer__links">
              <a href="#" className="footer__link">{t('footer.contact')}</a>
              <a href="#" className="footer__link">{t('footer.privacy')}</a>
              <a href="#" className="footer__link">{t('footer.terms')}</a>
              <a href="#" className="footer__link">{t('footer.refund')}</a>
            </div>
          </div>

          <div className="footer__section">
            <h4 className="footer__heading">{t('footer.payment')}</h4>
            <div className="footer__payment-grid">
              {PAYMENT_LOGOS.map((p) => (
                <div key={p.alt} className="footer__payment-item">
                  <img src={p.src} alt={p.alt} width="48" height="32" loading="lazy" />
                </div>
              ))}
            </div>
            <form className="footer__newsletter" onSubmit={(e) => e.preventDefault()} style={{ marginTop: 20 }}>
              <input type="email" placeholder={t('footer.newsletterPlaceholder')} className="footer__newsletter-input" />
              <button type="submit" className="footer__newsletter-btn">{t('footer.newsletterBtn')}</button>
            </form>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {new Date().getFullYear()} <strong>Mawrid</strong> &mdash; {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
