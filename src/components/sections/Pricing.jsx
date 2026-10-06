import { useLanguage } from '../../contexts/LanguageContext';
import SectionHeading from '../ui/SectionHeading';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import './Pricing.css';

const PLANS = [
  { key: 'basic', featured: false },
  { key: 'pro', featured: true },
  { key: 'business', featured: false },
];

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 12.5l5 5L19.5 6.5" />
    </svg>
  );
}

export default function Pricing() {
  const { t } = useLanguage();

  return (
    <section className="mw-section mw-pricing">
      <div className="mw-container">
        <SectionHeading
          eyebrow={t('pricing.eyebrow')}
          title={t('pricing.title')}
          subtitle={t('pricing.subtitle')}
        />
        <div className="mw-pricing__grid">
          {PLANS.map((plan) => {
            const k = `pricing.${plan.key}`;
            const features = t(`${k}.features`, []);
            const list = Array.isArray(features) ? features : [];
            return (
              <article
                key={plan.key}
                className={`mw-pricing-card${plan.featured ? ' mw-pricing-card--featured' : ''}`}
              >
                {plan.featured && (
                  <div className="mw-pricing-card__flag">
                    <Badge tone="hot">{t('pricing.popular')}</Badge>
                  </div>
                )}
                <h3 className="mw-pricing-card__name">{t(`${k}.name`)}</h3>
                <p className="mw-pricing-card__desc">{t(`${k}.desc`)}</p>
                <div className="mw-pricing-card__price">
                  <span className="mw-pricing-card__amount">{t(`${k}.price`)}</span>
                  <span className="mw-pricing-card__period">{t(`${k}.period`)}</span>
                </div>
                <ul className="mw-pricing-card__features">
                  {list.map((f, i) => (
                    <li key={i}>
                      <span className="mw-pricing-card__check"><CheckIcon /></span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  to="/auth?mode=signup&role=seller"
                  variant={plan.featured ? 'primary' : 'secondary'}
                  size="md"
                  block
                >
                  {t(`${k}.cta`)}
                </Button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
