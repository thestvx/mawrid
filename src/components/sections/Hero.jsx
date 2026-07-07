import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import DotGrid from '../ui/DotGrid';
import './Hero.css';

const stats = [
  { value: '50K+', key: 'hero.stat.products' },
  { value: '12K+', key: 'hero.stat.sellers' },
  { value: '200K+', key: 'hero.stat.buyers' },
];

const floatingElements = [
  { icon: '🌟', size: 48, x: 15, y: 20, delay: 0 },
  { icon: '💎', size: 36, x: 75, y: 15, delay: 1 },
  { icon: '⚡', size: 42, x: 85, y: 60, delay: 0.5 },
  { icon: '🎯', size: 32, x: 10, y: 70, delay: 1.5 },
  { icon: '🚀', size: 40, x: 90, y: 80, delay: 2 },
];

export default function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef(null);
  const { t, dir } = useLanguage();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section ref={heroRef} className="hero">
      <div className="hero__bg">
        <div className="hero__gradient animate-gradient" />
        <div className="hero__dotgrid">
          <DotGrid dotSize={4} gap={20} baseColor="#e1e3e4" activeColor="#ff6201" proximity={100} opacity={0.4} />
        </div>
        <div className="hero__gradient-overlay" />
        <div className="hero__grid-pattern" />
      </div>

      <div className="hero__floating-elements">
        {floatingElements.map((el, i) => (
          <div
            key={i}
            className="hero__floating-el"
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              width: el.size,
              height: el.size,
              fontSize: el.size / 2.5,
              animationDelay: `${el.delay}s`,
              transform: `translate(${mousePos.x * (10 + i * 5)}px, ${mousePos.y * (10 + i * 5)}px)`,
            }}
          >
            {el.icon}
          </div>
        ))}
      </div>

      <div className="container hero__content">
        <div className={`hero__text ${isVisible ? 'animate-fade-in' : ''}`}>
          <span className={`hero__badge ${isVisible ? 'animate-slide-up stagger-1' : ''}`}>
            {t('hero.badge')}
          </span>

          <h1 className={`hero__title ${isVisible ? 'animate-slide-up stagger-2' : ''}`}>
            {dir === 'rtl' ? (
              <>
                <span className="text-gradient-hero">{t('hero.title.mawrid')}</span>
                <br />
                {t('hero.title.line1')}
                <br />
                {t('hero.title.line2')}
              </>
            ) : (
              <>
                <span className="text-gradient-hero">{t('hero.title.mawrid')}</span>
                <br />
                {t('hero.title.line1')}
                <br />
                {t('hero.title.line2')}
              </>
            )}
          </h1>

          <p className={`hero__subtitle ${isVisible ? 'animate-slide-up stagger-3' : ''}`}>
            {t('hero.subtitle')}
          </p>

          <div className={`hero__cta ${isVisible ? 'animate-slide-up stagger-4' : ''}`}>
            <Link to="/marketplace" className="hero__btn hero__btn--primary glow">
              {t('hero.cta.shop')}
              <span className="hero__btn-arrow">{dir === 'rtl' ? '←' : '→'}</span>
            </Link>
            <Link to="/storefront" className="hero__btn hero__btn--secondary">
              {t('hero.cta.store')}
            </Link>
          </div>

          <div className={`hero__trust ${isVisible ? 'animate-slide-up stagger-5' : ''}`}>
            <div className="hero__trust-avatars">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="hero__trust-avatar" style={{ zIndex: 4 - i, [dir === 'rtl' ? 'marginLeft' : 'marginRight']: i > 1 ? -12 : 0 }}>
                  <img src={`https://i.pravatar.cc/40?img=${i + 10}`} alt="" width="40" height="40" loading="lazy" />
                </div>
              ))}
              <div className="hero__trust-count" style={dir === 'rtl' ? { marginLeft: -12 } : { marginRight: -12 }}>
                +2K
              </div>
            </div>
            <p className="hero__trust-text">{t('hero.trust')}</p>
          </div>
        </div>

        <div className={`hero__visual ${isVisible ? 'animate-fade-in' : ''}`}>
          <div className="hero__glass-card" style={{
            transform: `perspective(1000px) rotateY(${mousePos.x * 5}deg) rotateX(${-mousePos.y * 5}deg)`,
          }}>
            <div className="hero__glass-card-inner">
              <div className="hero__card-header">
                <div className="hero__card-dots">
                  <span /><span /><span />
                </div>
                <span className="hero__card-badge">Premium</span>
              </div>
              <div className="hero__card-body">
                <div className="hero__card-row">
                  <div className="hero__card-icon">🎨</div>
                  <div>
                    <div className="hero__card-label">{t('hero.card.uiKit')}</div>
                    <div className="hero__card-meta">{t('hero.card.uiKitComp')}</div>
                  </div>
                  <span className="hero__card-price">$89</span>
                </div>
                <div className="hero__card-divider" />
                <div className="hero__card-row">
                  <div className="hero__card-icon">📊</div>
                  <div>
                    <div className="hero__card-label">{t('hero.card.dashboard')}</div>
                    <div className="hero__card-meta">{t('hero.card.dashboardDesc')}</div>
                  </div>
                  <span className="hero__card-price">$49</span>
                </div>
                <div className="hero__card-divider" />
                <div className="hero__card-row">
                  <div className="hero__card-icon">🤖</div>
                  <div>
                    <div className="hero__card-label">{t('hero.card.chatgpt')}</div>
                    <div className="hero__card-meta">{t('hero.card.monthly')}</div>
                  </div>
                  <span className="hero__card-price hero__card-price--promo">$19.99</span>
                </div>
              </div>
              <div className="hero__card-footer">
                <div className="hero__card-rating">{'★'.repeat(5)}</div>
                <span className="hero__card-reviews">(12.4K {t('hero.reviews')})</span>
              </div>
            </div>
          </div>

          <div className="hero__glass-card hero__glass-card--small" style={{
            transform: `perspective(1000px) rotateY(${mousePos.x * 3}deg) rotateX(${-mousePos.y * 3}deg)`,
          }}>
            <div className="hero__stat">
              <span className="hero__stat-value text-gradient">4.9</span>
              <span className="hero__stat-label">{t('hero.avgRating')}</span>
            </div>
          </div>

          <div className="hero__glass-card hero__glass-card--tiny" style={{
            transform: `perspective(1000px) rotateY(${mousePos.x * 4}deg) rotateX(${-mousePos.y * 4}deg)`,
          }}>
            <span className="hero__live-dot" />
            <span>{t('hero.liveNow')}</span>
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
