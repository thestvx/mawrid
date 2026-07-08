import { useLanguage } from '../../contexts/LanguageContext';
import AnimatedContent from '../ui/AnimatedContent';
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

  return (
    <section className="features" id="features">
      <div className="container">
        <AnimatedContent distance={60} delay={0}>
          <div className="features__header">
            <h2 className="features__title">{t('features.title')}</h2>
            <p className="features__sub">{t('features.subtitle')}</p>
          </div>
        </AnimatedContent>
        <div className="features__grid">
          {features.map((f, i) => (
            <AnimatedContent key={i} distance={50} delay={0.08 + i * 0.08}>
              <div className="features__card">
                <div className="features__icon-wrap" style={{ background: `${f.color}12`, color: f.color }}>
                  <span className="features__icon">{f.icon}</span>
                </div>
                <h3 className="features__card-title">{t(f.key)}</h3>
                <p className="features__card-desc">{t(f.descKey)}</p>
              </div>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
}
