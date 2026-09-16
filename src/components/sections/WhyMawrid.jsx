import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import './WhyMawrid.css';

const steps = [
  { key: 'whymawrid.step1', descKey: 'whymawrid.step1desc', num: '1', color: '#ff6201', icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></> },
  { key: 'whymawrid.step2', descKey: 'whymawrid.step2desc', num: '2', color: '#494bd6', icon: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></> },
  { key: 'whymawrid.step3', descKey: 'whymawrid.step3desc', num: '3', color: '#10b981', icon: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></> },
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

export default function WhyMawrid() {
  const { t, dir } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="whymawrid" ref={ref}>
      <div className="container">
        <motion.h3
          className="whymawrid__steps-title"
          variants={headerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {t('whymawrid.howTitle')}
        </motion.h3>

        <motion.div
          className="whymawrid__steps-grid"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.span
            className="whymawrid__steps-track"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: dir === 'rtl' ? 'right' : 'left' }}
          />
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="whymawrid__step"
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="whymawrid__step-num-ring" style={{ borderColor: `${step.color}30` }}>
                <motion.div
                  className="whymawrid__step-num"
                  style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)` }}
                  whileHover={{ scale: 1.12, boxShadow: `0 8px 24px ${step.color}55` }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  {step.num}
                </motion.div>
              </div>
              <div className="whymawrid__step-icon-wrap" style={{ color: step.color }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {step.icon}
                </svg>
              </div>
              <h4 className="whymawrid__step-title">{t(step.key)}</h4>
              <p className="whymawrid__step-desc">{t(step.descKey)}</p>
              {i < steps.length - 1 && (
                <div className="whymawrid__step-arrow" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="whymawrid__cta"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
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