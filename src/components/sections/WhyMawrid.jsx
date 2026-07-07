import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import './WhyMawrid.css';

const items = [
  { value: '3,200+', key: 'whymawrid.stat1', icon: '📦' },
  { value: '840+', key: 'whymawrid.stat2', icon: '🏪' },
  { value: '47,000+', key: 'whymawrid.stat3', icon: '👥' },
  { value: '99.9%', key: 'whymawrid.stat4', icon: '⚡' },
];

const steps = [
  { key: 'whymawrid.step1', descKey: 'whymawrid.step1desc', icon: '1' },
  { key: 'whymawrid.step2', descKey: 'whymawrid.step2desc', icon: '2' },
  { key: 'whymawrid.step3', descKey: 'whymawrid.step3desc', icon: '3' },
];

export default function WhyMawrid() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="whymawrid" ref={sectionRef}>
      <div className="container">
        <div className={`whymawrid__header ${visible ? 'animate-section' : ''}`}>
          <h2 className="whymawrid__title">{t('whymawrid.title')}</h2>
          <p className="whymawrid__sub">{t('whymawrid.subtitle')}</p>
        </div>

        <div className="whymawrid__stats">
          {items.map((item, i) => (
            <div
              key={i}
              className={`whymawrid__stat ${visible ? 'animate-section' : ''}`}
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <span className="whymawrid__stat-icon">{item.icon}</span>
              <span className="whymawrid__stat-value">{item.value}</span>
              <span className="whymawrid__stat-label">{t(item.key)}</span>
            </div>
          ))}
        </div>

        <div className="whymawrid__steps">
          <h3 className="whymawrid__steps-title">{t('whymawrid.howTitle')}</h3>
          <div className="whymawrid__steps-grid">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`whymawrid__step ${visible ? 'animate-section' : ''}`}
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              >
                <div className="whymawrid__step-num">{step.icon}</div>
                <h4 className="whymawrid__step-title">{t(step.key)}</h4>
                <p className="whymawrid__step-desc">{t(step.descKey)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`whymawrid__cta ${visible ? 'animate-section' : ''}`} style={{ animationDelay: '0.5s' }}>
          <Link to="/auth?mode=signup" className="btn btn--primary btn--lg">
            {t('whymawrid.cta')}
          </Link>
        </div>
      </div>
    </section>
  );
}
