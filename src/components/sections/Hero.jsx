import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const stats = [
  { value: '50K+', label_ar: 'منتج رقمي', label_en: 'Digital Products' },
  { value: '12K+', label_ar: 'بائع نشط', label_en: 'Active Sellers' },
  { value: '200K+', label_ar: 'مشتري سعيد', label_en: 'Happy Buyers' },
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
  const isRtl = document.documentElement.dir === 'rtl';

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
            {isRtl ? '🛒 سوق رقمي متكامل' : '🛒 Premium Digital Marketplace'}
          </span>

          <h1 className={`hero__title ${isVisible ? 'animate-slide-up stagger-2' : ''}`}>
            {isRtl ? (
              <>
                <span className="text-gradient-hero">مَورد</span>
                <br />
                سوق المبدعين
                <br />
                والمنتجات الرقمية
              </>
            ) : (
              <>
                <span className="text-gradient-hero">Mawrid</span>
                <br />
                The Marketplace
                <br />
                for Creators &amp; Digital Products
              </>
            )}
          </h1>

          <p className={`hero__subtitle ${isVisible ? 'animate-slide-up stagger-3' : ''}`}>
            {isRtl
              ? 'اكتشف آلاف المنتجات الرقمية المميزة واشتراكات المنصات الشهيرة بأسعار استثنائية. انضم إلى مجتمع المبدعين والمشترين.'
              : 'Discover thousands of premium digital products and platform subscriptions at exceptional prices. Join a community of creators and buyers.'}
          </p>

          <div className={`hero__cta ${isVisible ? 'animate-slide-up stagger-4' : ''}`}>
            <Link to="/marketplace" className="hero__btn hero__btn--primary glow">
              {isRtl ? 'ابدأ التسوق' : 'Start Shopping'}
              <span className="hero__btn-arrow">{isRtl ? '←' : '→'}</span>
            </Link>
            <Link to="/storefront" className="hero__btn hero__btn--secondary">
              {isRtl ? 'افتح متجرك' : 'Open Your Store'}
            </Link>
          </div>

          <div className={`hero__trust ${isVisible ? 'animate-slide-up stagger-5' : ''}`}>
            <div className="hero__trust-avatars">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="hero__trust-avatar" style={{ zIndex: 4 - i, marginRight: i > 1 ? -12 : 0 }}>
                  <img
                    src={`https://i.pravatar.cc/40?img=${i + 10}`}
                    alt=""
                    width="40"
                    height="40"
                    loading="lazy"
                  />
                </div>
              ))}
              <div className="hero__trust-count">+2K</div>
            </div>
            <p className="hero__trust-text">
              {isRtl
                ? 'انضم إلى أكثر من 200,000 مستخدم حول العالم'
                : 'Join 200,000+ users worldwide'}
            </p>
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
                    <div className="hero__card-label">{isRtl ? 'حزمة واجهات UI' : 'UI Kit Pro'}</div>
                    <div className="hero__card-meta">{isRtl ? '300+ مكون' : '300+ Components'}</div>
                  </div>
                  <span className="hero__card-price">$89</span>
                </div>
                <div className="hero__card-divider" />
                <div className="hero__card-row">
                  <div className="hero__card-icon">📊</div>
                  <div>
                    <div className="hero__card-label">{isRtl ? 'قالب لوحة تحكم' : 'Dashboard Template'}</div>
                    <div className="hero__card-meta">{isRtl ? 'متجاوب بالكامل' : 'Fully Responsive'}</div>
                  </div>
                  <span className="hero__card-price">$49</span>
                </div>
                <div className="hero__card-divider" />
                <div className="hero__card-row">
                  <div className="hero__card-icon">🤖</div>
                  <div>
                    <div className="hero__card-label">{isRtl ? 'اشتراك ChatGPT Pro' : 'ChatGPT Pro'}</div>
                    <div className="hero__card-meta">{isRtl ? 'شهري' : 'Monthly'}</div>
                  </div>
                  <span className="hero__card-price hero__card-price--promo">$19.99</span>
                </div>
              </div>
              <div className="hero__card-footer">
                <div className="hero__card-rating">
                  {'★'.repeat(5)}
                </div>
                <span className="hero__card-reviews">(12.4K {isRtl ? 'تقييم' : 'reviews'})</span>
              </div>
            </div>
          </div>

          <div className="hero__glass-card hero__glass-card--small" style={{
            transform: `perspective(1000px) rotateY(${mousePos.x * 3}deg) rotateX(${-mousePos.y * 3}deg)`,
          }}>
            <div className="hero__stat">
              <span className="hero__stat-value text-gradient">4.9</span>
              <span className="hero__stat-label">{isRtl ? 'متوسط التقييم' : 'Avg. Rating'}</span>
            </div>
          </div>

          <div className="hero__glass-card hero__glass-card--tiny" style={{
            transform: `perspective(1000px) rotateY(${mousePos.x * 4}deg) rotateX(${-mousePos.y * 4}deg)`,
          }}>
            <span className="hero__live-dot" />
            <span>{isRtl ? 'مباشر الآن' : 'Live Now'}</span>
          </div>
        </div>
      </div>

      <div className="hero__stats">
        <div className="container hero__stats-inner">
          {stats.map((stat, i) => (
            <div key={i} className={`hero__stat-item ${isVisible ? `animate-slide-up stagger-${i + 5}` : ''}`}>
              <span className="hero__stat-number">{stat.value}</span>
              <span className="hero__stat-desc">{isRtl ? stat.label_ar : stat.label_en}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
