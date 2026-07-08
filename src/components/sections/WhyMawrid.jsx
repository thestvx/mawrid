import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import AnimatedContent from '../ui/AnimatedContent';
import './WhyMawrid.css';

const items = [
  { value: '3,200+', key: 'whymawrid.stat1', icon: '📦', color: '#ff6201' },
  { value: '840+', key: 'whymawrid.stat2', icon: '🏪', color: '#494bd6' },
  { value: '47,000+', key: 'whymawrid.stat3', icon: '👥', color: '#10b981' },
  { value: '99.9%', key: 'whymawrid.stat4', icon: '⚡', color: '#f59e0b' },
];

const steps = [
  { key: 'whymawrid.step1', descKey: 'whymawrid.step1desc', icon: '1', color: '#ff6201' },
  { key: 'whymawrid.step2', descKey: 'whymawrid.step2desc', icon: '2', color: '#494bd6' },
  { key: 'whymawrid.step3', descKey: 'whymawrid.step3desc', icon: '3', color: '#10b981' },
];

export default function WhyMawrid() {
  const { t } = useLanguage();

  return (
    <section className="whymawrid">
      <div className="container">
        <AnimatedContent distance={60} delay={0}>
          <div className="whymawrid__header">
            <span className="whymawrid__badge">{t('whymawrid.badge')}</span>
            <h2 className="whymawrid__title">{t('whymawrid.title')}</h2>
            <p className="whymawrid__sub">{t('whymawrid.subtitle')}</p>
          </div>
        </AnimatedContent>

        <div className="whymawrid__stats">
          {items.map((item, i) => (
            <AnimatedContent key={i} distance={50} delay={0.1 + i * 0.1}>
              <div className="whymawrid__stat">
                <div className="whymawrid__stat-glow" style={{ background: `${item.color}15` }} />
                <span className="whymawrid__stat-icon" style={{ color: item.color }}>{item.icon}</span>
                <span className="whymawrid__stat-value">{item.value}</span>
                <span className="whymawrid__stat-label">{t(item.key)}</span>
              </div>
            </AnimatedContent>
          ))}
        </div>

        <AnimatedContent distance={40} delay={0.3}>
          <h3 className="whymawrid__steps-title">{t('whymawrid.howTitle')}</h3>
        </AnimatedContent>

        <div className="whymawrid__steps-grid">
          {steps.map((step, i) => (
            <AnimatedContent key={i} distance={60} delay={0.15 + i * 0.12}>
              <div className="whymawrid__step">
                <div className="whymawrid__step-connector" />
                <div className="whymawrid__step-num" style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)` }}>
                  {step.icon}
                </div>
                <h4 className="whymawrid__step-title">{t(step.key)}</h4>
                <p className="whymawrid__step-desc">{t(step.descKey)}</p>
              </div>
            </AnimatedContent>
          ))}
        </div>

        <AnimatedContent distance={40} delay={0.4}>
          <div className="whymawrid__cta">
            <Link to="/auth?mode=signup" className="btn btn--primary btn--lg">
              {t('whymawrid.cta')}
            </Link>
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
}
