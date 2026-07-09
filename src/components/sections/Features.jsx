import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
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

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, filter: 'blur(6px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Features() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="features" id="features" ref={ref}>
      <div className="container">
        <motion.div
          className="features__header"
          variants={headerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <h2 className="features__title">{t('features.title')}</h2>
          <p className="features__sub">{t('features.subtitle')}</p>
        </motion.div>

        <motion.div
          className="features__grid"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {features.map((f, i) => (
            <motion.div key={i} className="features__card" variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }}>
              <div className="features__icon-wrap" style={{ background: `${f.color}12`, color: f.color }}>
                <span className="features__icon">{f.icon}</span>
              </div>
              <h3 className="features__card-title">{t(f.key)}</h3>
              <p className="features__card-desc">{t(f.descKey)}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
