import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import './Hero.css';

const stats = [
  { value: '3,200+', key: 'hero.stat.products' },
  { value: '840+', key: 'hero.stat.sellers' },
  { value: '47,000+', key: 'hero.stat.buyers' },
];

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const { t, dir } = useLanguage();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const bgImage = dir === 'rtl' ? '/images/backgrounds/hero-background-ar.png' : '/images/backgrounds/hero-background-en.png';

  return (
    <section className="hero">
      <div className="hero__bg">
        <div className="hero__bg-img-wrap">
          <img src={bgImage} alt="" className="hero__bg-img" />
        </div>
        <div className="hero__gradient-overlay" />
      </div>

      <div className="container hero__content">
        <div className={`hero__text ${isVisible ? 'animate-fade-in' : ''}`}>
          <span className={`hero__badge ${isVisible ? 'animate-slide-up stagger-1' : ''}`}>
            {t('hero.badge')}
          </span>

          <h1 className={`hero__title ${isVisible ? 'animate-slide-up stagger-2' : ''}`}>
            <span className="text-gradient-hero">{t('hero.title.mawrid')}</span>
            <br />
            {t('hero.title.line1')}
            <br />
            {t('hero.title.line2')}
          </h1>

          <p className={`hero__subtitle ${isVisible ? 'animate-slide-up stagger-3' : ''}`}>
            {t('hero.subtitle')}
          </p>

          <div className={`hero__cta ${isVisible ? 'animate-slide-up stagger-4' : ''}`}>
            <Link to="/marketplace" className="hero__btn hero__btn--primary glow">
              {t('hero.cta.shop')}
              <span className="hero__btn-arrow">{dir === 'rtl' ? '←' : '→'}</span>
            </Link>
            <Link to="/auth?mode=signup&role=seller" className="hero__btn hero__btn--secondary">
              {t('hero.cta.store')}
            </Link>
          </div>
        </div>
      </div>

      <div className="hero__stats">
        <div className="container hero__stats-inner">
          {stats.map((stat, i) => (
            <div key={i} className={`hero__stat-item ${isVisible ? `animate-slide-up stagger-${i + 5}` : ''}`}>
              <span className="hero__stat-number">{stat.value}</span>
              <span className="hero__stat-desc">{t(stat.key)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
