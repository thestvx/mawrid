import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import './Hero.css';

const stats = [
  { value: '3,200+', key: 'hero.stat.products' },
  { value: '840+', key: 'hero.stat.sellers' },
  { value: '47,000+', key: 'hero.stat.buyers' },
];

const particles = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  size: 2 + (i % 5),
  x: (i * 11.7) % 100,
  y: (i * 8.3 + 5) % 100,
  delay: (i * 0.5) % 5,
  duration: 5 + (i % 4),
  opacity: 0.15 + (i % 3) * 0.1,
}));

const floatingElements = [
  { id: 1, icon: '📦', x: 8, y: 15, delay: 0, duration: 6 },
  { id: 2, icon: '💎', x: 92, y: 20, delay: 0.5, duration: 7 },
  { id: 3, icon: '🚀', x: 15, y: 75, delay: 1, duration: 5.5 },
  { id: 4, icon: '⭐', x: 85, y: 80, delay: 1.5, duration: 6.5 },
  { id: 5, icon: '🎨', x: 5, y: 45, delay: 2, duration: 7.5 },
  { id: 6, icon: '⚡', x: 95, y: 60, delay: 2.5, duration: 6 },
];

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
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

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const bgImage = dir === 'rtl' ? '/images/backgrounds/hero-background-ar.png' : '/images/backgrounds/hero-background-en.png';

  return (
    <section className="hero" style={{ '--scroll-y': scrollY }}>
      <div className="hero__bg">
        <div className="hero__bg-img-wrap">
          <img src={bgImage} alt="" className="hero__bg-img" loading="eager" style={{ transform: `translateY(${scrollY * 0.15}px)` }} />
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
                opacity: p.opacity,
              }}
            />
          ))}
        </div>

        <div className="hero__floating-elements" aria-hidden="true">
          {floatingElements.map((el) => (
            <span
              key={el.id}
              className="hero__floating-icon"
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                animationDelay: `${el.delay}s`,
                animationDuration: `${el.duration}s`,
              }}
            >
              {el.icon}
            </span>
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