import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import SplitText from '../ui/SplitText';
import './Features.css';

const features = [
  {
    key: 'features.secure.title', descKey: 'features.secure.desc', color: '#ff6201',
    icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M12 8v4" /><path d="M12 16h.01" /></>,
  },
  {
    key: 'features.instant.title', descKey: 'features.instant.desc', color: '#fbbf24',
    icon: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  },
  {
    key: 'features.global.title', descKey: 'features.global.desc', color: '#494bd6',
    icon: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
  },
  {
    key: 'features.premium.title', descKey: 'features.premium.desc', color: '#10b981',
    icon: <><path d="M6 3h12l4 6-10 13L2 9z" /><path d="M2 9h20" /><path d="M12 17l-4-4" /><path d="M16 13l-4 4" /></>,
  },
  {
    key: 'features.community.title', descKey: 'features.community.desc', color: '#ef4444',
    icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  },
  {
    key: 'features.growth.title', descKey: 'features.growth.desc', color: '#a53c00',
    icon: <><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></>,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 36, filter: 'blur(4px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: 28 },
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
          <SplitText
            text={t('features.title')}
            tag="h2"
            className="features__title"
            textAlign="center"
            delay={26}
            duration={1}
            threshold={0.15}
            from={{ opacity: 0, y: 30 }}
          />
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
              <span className="features__card-accent" style={{ background: `linear-gradient(90deg, ${f.color}, transparent)` }} />
              <motion.div className="features__icon-wrap" style={{ background: `${f.color}12`, color: f.color }} whileHover={{ rotate: [0, -8, 6, 0], scale: 1.12 }} transition={{ duration: 0.5 }}>
                <svg className="features__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {f.icon}
                </svg>
              </motion.div>
              <h3 className="features__card-title">{t(f.key)}</h3>
              <p className="features__card-desc">{t(f.descKey)}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
