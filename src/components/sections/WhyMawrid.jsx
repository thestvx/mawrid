import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
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

export default function WhyMawrid() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="whymawrid" ref={ref}>
      <div className="container">
        <motion.div
          className="whymawrid__header"
          variants={headerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <span className="whymawrid__badge">{t('whymawrid.badge')}</span>
          <h2 className="whymawrid__title">{t('whymawrid.title')}</h2>
          <p className="whymawrid__sub">{t('whymawrid.subtitle')}</p>
        </motion.div>

        <motion.div
          className="whymawrid__stats"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {items.map((item, i) => (
            <motion.div
              key={i}
              className="whymawrid__stat"
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.03 }}
            >
              <div className="whymawrid__stat-glow" style={{ background: `${item.color}15` }} />
              <span className="whymawrid__stat-icon" style={{ color: item.color }}>{item.icon}</span>
              <span className="whymawrid__stat-value">{item.value}</span>
              <span className="whymawrid__stat-label">{t(item.key)}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.h3
          className="whymawrid__steps-title"
          variants={headerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          transition={{ delay: 0.3 }}
        >
          {t('whymawrid.howTitle')}
        </motion.h3>

        <motion.div
          className="whymawrid__steps-grid"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="whymawrid__step"
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="whymawrid__step-connector" />
              <div className="whymawrid__step-num" style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)` }}>
                {step.icon}
              </div>
              <h4 className="whymawrid__step-title">{t(step.key)}</h4>
              <p className="whymawrid__step-desc">{t(step.descKey)}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="whymawrid__cta"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
        >
          <Link to="/auth?mode=signup" className="btn btn--primary btn--lg">
            {t('whymawrid.cta')}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
