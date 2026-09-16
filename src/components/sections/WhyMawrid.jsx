import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import './WhyMawrid.css';

const items = [
  { value: 3200, suffix: '+', decimals: 0, key: 'whymawrid.stat1', icon: '📦', color: '#ff6201' },
  { value: 840, suffix: '+', decimals: 0, key: 'whymawrid.stat2', icon: '🏪', color: '#494bd6' },
  { value: 47000, suffix: '+', decimals: 0, key: 'whymawrid.stat3', icon: '👥', color: '#10b981' },
  { value: 99.9, suffix: '%', decimals: 1, key: 'whymawrid.stat4', icon: '⚡', color: '#f59e0b' },
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

function CountUp({ value, decimals, suffix, isVisible }) {
  const [display, setDisplay] = useState('0');
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!isVisible) return;
    if (reduce) {
      setDisplay(value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
      return;
    }
    const duration = 1600;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = value * eased;
      setDisplay(current.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: decimals }));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value, decimals, isVisible, reduce]);

  return <>{display}{suffix}</>;
}

function StatCard({ item, isVisible, delay, label }) {
  return (
    <motion.div
      className="whymawrid__stat"
      variants={itemVariants}
      custom={delay}
      whileHover={{ y: -6, scale: 1.03 }}
    >
      <div className="whymawrid__stat-glow" style={{ background: `${item.color}15` }} />
      <motion.span
        className="whymawrid__stat-icon"
        style={{ color: item.color }}
        whileHover={{ scale: 1.18, rotate: [0, -6, 6, 0] }}
        transition={{ duration: 0.45 }}
      >
        {item.icon}
      </motion.span>
      <span className="whymawrid__stat-value">
        <CountUp value={item.value} decimals={item.decimals} suffix={item.suffix} isVisible={isVisible} />
      </span>
      <span className="whymawrid__stat-label">{label}</span>
    </motion.div>
  );
}

export default function WhyMawrid() {
  const { t, dir } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsVisible(true); observer.disconnect(); } },
      { threshold: 0.25 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

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
          ref={statsRef}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {items.map((item, i) => (
            <StatCard key={i} item={item} isVisible={statsVisible} delay={i} label={t(item.key)} />
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
          <motion.span
            className="whymawrid__steps-track"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: dir === 'rtl' ? 'right' : 'left' }}
          />
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="whymawrid__step"
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <motion.div
                className="whymawrid__step-num"
                style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)` }}
                whileHover={{ scale: 1.12, boxShadow: `0 8px 24px ${step.color}55` }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {step.icon}
              </motion.div>
              <h4 className="whymawrid__step-title">{t(step.key)}</h4>
              <p className="whymawrid__step-desc">{t(step.descKey)}</p>
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