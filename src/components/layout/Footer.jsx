import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import './Footer.css';

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
                width="200"
                height="67"
              />
            </Link>
            <p className="footer__tagline">{t('footer.tagline')}</p>
            <div className="footer__social">
              <a href="#" className="footer__social-link" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 5.323 12 7c-3.148.085-5.997-1.494-8-4-.708 1.213-.664 2.586.172 3.678-.365.102-.714.238-1 .5-1 1.354-.176 2.925.812 3.822-.425.101-.837.261-1.199.5-.671.611-.612 1.895.063 2.822 1.592.345 3.167.262 4.66.19.416 2.008 1.646 3.144 3.538 4.086-2.797 1.864-6.654 2.138-9.7.79 7.509 4.301 17.598.667 17.598-8.198 0-.124-.008-.247-.016-.37 1.205-.873 2-2.198 2-3.59z" /></svg>
              </a>
              <a href="#" className="footer__social-link" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
              <a href="#" className="footer__social-link" aria-label="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" /></svg>
              </a>
              <a href="#" className="footer__social-link" aria-label="Telegram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
              </a>
            </div>
          </div>

          <div className="footer__section">
            <h4 className="footer__heading">{t('footer.about')}</h4>
            <div className="footer__links">
              <Link to="/marketplace" className="footer__link">{t('nav.marketplace')}</Link>
              <Link to="/storefront" className="footer__link">{t('nav.openShop')}</Link>
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

          <div className="footer__section footer__section--newsletter">
            <h4 className="footer__heading">{t('footer.newsletter')}</h4>
            <form className="footer__newsletter" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder={t('footer.newsletterPlaceholder')} className="footer__newsletter-input" />
              <button type="submit" className="footer__newsletter-btn">{t('footer.newsletterBtn')}</button>
            </form>
            <div className="footer__payment">
              <span className="footer__payment-label">{t('footer.payment')}</span>
              <div className="footer__payment-icons">
                <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><rect width="32" height="20" rx="3" fill="#1A1F71" /><text x="16" y="14" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">MC</text></svg>
                <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><rect width="32" height="20" rx="3" fill="#1434CB" /><text x="16" y="14" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">V</text></svg>
                <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><rect width="32" height="20" rx="3" fill="#0079D3" /><text x="16" y="14" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">PP</text></svg>
                <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><rect width="32" height="20" rx="3" fill="#016FD0" /><text x="16" y="14" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">ST</text></svg>
              </div>
            </div>
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
