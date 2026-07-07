import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './Features.css';

const features = [
  { icon: '🛡️', key: 'features.secure.title', descKey: 'features.secure.desc', color: '#ff6201' },
  { icon: '⚡', key: 'features.instant.title', descKey: 'features.instant.desc', color: '#fbbf24' },
  { icon: '🌍', key: 'features.global.title', descKey: 'features.global.desc', color: '#494bd6' },
  { icon: '💎', key: 'features.premium.title', descKey: 'features.premium.desc', color: '#10b981' },
  { icon: '🤝', key: 'features.community.title', descKey: 'features.community.desc', color: '#ef4444' },
  { icon: '🚀', key: 'features.growth.title', descKey: 'features.growth.desc', color: '#a53c00' },
];

export default function Features() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="features" ref={sectionRef} id="features">
      <div className="container">
        <div className={`features__header ${visible ? 'animate-section' : ''}`}>
          <h2 className="features__title">{t('features.title')}</h2>
          <p className="features__sub">{t('features.subtitle')}</p>
        </div>
        <div className="features__grid">
          {features.map((f, i) => (
            <div
              key={i}
              className={`features__card ${visible ? 'animate-section' : ''}`}
              style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            >
              <div className="features__icon-wrap" style={{ background: `${f.color}12`, color: f.color }}>
                <span className="features__icon">{f.icon}</span>
              </div>
              <h3 className="features__card-title">{t(f.key)}</h3>
              <p className="features__card-desc">{t(f.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
