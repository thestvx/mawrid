import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import './Hero.css';

const stats = [
  { value: '3,200+', key: 'hero.stat.products' },
  { value: '840+', key: 'hero.stat.sellers' },
  { value: '47,000+', key: 'hero.stat.buyers' },
];

const particles = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  size: 2 + (i % 4),
  x: (i * 13.7) % 100,
  y: (i * 7.3 + 10) % 100,
  delay: (i * 0.7) % 4,
  duration: 4 + (i % 3),
}));

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef(null);
  const statsVisible = useRef(false);
  const [animateStats, setAnimateStats] = useState(false);
  const { t, dir } = useLanguage();

  useEffect(() => {
    setIsVisible(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsVisible.current) {
          statsVisible.current = true;
          setAnimateStats(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const bgImage = dir === 'rtl' ? '/images/backgrounds/hero-background-ar.png' : '/images/backgrounds/hero-background-en.png';

  return (
    <section className="hero">
      <div className="hero__bg">
        <div className="hero__bg-img-wrap">
          <img src={bgImage} alt="" className="hero__bg-img" loading="eager" />
        </div>
        <div className="hero__gradient-overlay" />
        <div className="hero__particles" aria-hidden="true">
          {particles.map((p) => (
            <span
              key={p.id}
              className="hero__particle"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                top: `${p.y}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="container hero__content">
        <div className={`hero__text ${isVisible ? 'animate-hero-in' : ''}`}>
          <span className={`hero__badge ${isVisible ? 'animate-hero-in stagger-1' : ''}`}>
            {t('hero.badge')}
          </span>

          <h1 className={`hero__title ${isVisible ? 'animate-hero-in stagger-2' : ''}`}>
            <span className="text-gradient-hero">{t('hero.title.mawrid')}</span>
            <br />
            {t('hero.title.line1')}
            <br />
            {t('hero.title.line2')}
          </h1>

          <p className={`hero__subtitle ${isVisible ? 'animate-hero-in stagger-3' : ''}`}>
            {t('hero.subtitle')}
          </p>

          <div className={`hero__cta ${isVisible ? 'animate-hero-in stagger-4' : ''}`}>
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

      <div className="hero__stats" ref={statsRef}>
        <div className="container hero__stats-inner">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`hero__stat-item ${animateStats ? 'animate-hero-in' : ''}`}
              style={{ animationDelay: `${0.1 + i * 0.15}s` }}
            >
              <span className="hero__stat-number">{stat.value}</span>
              <span className="hero__stat-desc">{t(stat.key)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
