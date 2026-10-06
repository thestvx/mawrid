import { useLanguage } from '../../contexts/LanguageContext';
import Button from '../ui/Button';
import './CtaBanner.css';

export default function CtaBanner() {
  const { t } = useLanguage();

  return (
    <section className="mw-section">
      <div className="mw-container">
        <div className="mw-cta-banner">
          <div className="mw-cta-banner__glow mw-cta-banner__glow--a" aria-hidden="true" />
          <div className="mw-cta-banner__glow mw-cta-banner__glow--b" aria-hidden="true" />
          <div className="mw-cta-banner__content">
            <h2 className="mw-cta-banner__title">{t('cta.title')}</h2>
            <p className="mw-cta-banner__subtitle">{t('cta.subtitle')}</p>
            <div className="mw-cta-banner__actions">
              <Button to="/auth?mode=signup&role=seller" variant="primary" size="md" className="mw-cta-banner__btn">
                {t('cta.primary')}
              </Button>
              <Button to="/marketplace" variant="secondary" size="md" className="mw-cta-banner__btn">
                {t('cta.secondary')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
