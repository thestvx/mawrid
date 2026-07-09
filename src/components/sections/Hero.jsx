import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { useLanguage } from '../../contexts/LanguageContext';
import './Hero.css';

const stats = [
  { end: 3200, suffix: '+', key: 'hero.stat.products' },
  { end: 840, suffix: '+', key: 'hero.stat.sellers' },
  { end: 47000, suffix: '+', key: 'hero.stat.buyers' },
];

function formatNumber(n) {
  return n.toLocaleString('en-US');
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.85, x: 60 },
  visible: {
    opacity: 1, scale: 1, x: 0,
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 },
  },
};

const statVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.8 + i * 0.15 },
  }),
};

function useParallax(strength = 20) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 30, mass: 1 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 30, mass: 1 });
  const x = useTransform(springX, [-1, 1], [-strength, strength]);
  const y = useTransform(springY, [-1, 1], [-strength, strength]);

  const handleMouseMove = useCallback((e) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    mouseX.set((e.clientX / w - 0.5) * 2);
    mouseY.set((e.clientY / h - 0.5) * 2);
  }, [mouseX, mouseY]);

  return { x, y, handleMouseMove };
}

function GlowCursor() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 25 });

  useEffect(() => {
    const handler = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="hero__glow-cursor"
      style={{ x: springX, y: springY }}
    />
  );
}

function FloatingCard({ children, className, delay = 0, duration = 6, strength = 15, parallaxX, parallaxY }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -strength, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
      style={{ x: parallaxX, y: parallaxY }}
    >
      {children}
    </motion.div>
  );
}

export default function Hero() {
  const sectionRef = useRef(null);
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const { t, dir } = useLanguage();

  const { x: px1, y: py1, handleMouseMove } = useParallax(25);
  const { x: px2, y: py2 } = useParallax(15);
  const { x: px3, y: py3 } = useParallax(8);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const bgImage = dir === 'rtl'
    ? '/images/backgrounds/hero-background-ar.png'
    : '/images/backgrounds/hero-background-en.png';

  return (
    <section
      className="hero"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
    >
      <GlowCursor />

      <div className="hero__dot-grid" />

      <div className="hero__bg">
        <motion.img
          src={bgImage}
          alt=""
          className="hero__bg-img"
          loading="eager"
          style={{ x: px3, y: py3, scale: 1.05 }}
        />
        <div className="hero__overlay" />
      </div>

      <div className="container hero__content">
        <motion.div
          className="hero__text"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span className="hero__badge" variants={badgeVariants}>
            {t('hero.badge')}
          </motion.span>

          <motion.h1 className="hero__title" variants={itemVariants}>
            <span className="text-gradient-hero">{t('hero.title.mawrid')}</span>
            <br />
            {t('hero.title.line1')}
            <br />
            {t('hero.title.line2')}
          </motion.h1>

          <motion.p className="hero__subtitle" variants={itemVariants}>
            {t('hero.subtitle')}
          </motion.p>

          <motion.div className="hero__cta" variants={itemVariants}>
            <Link to="/marketplace" className="hero__btn hero__btn--primary">
              <span>{t('hero.cta.shop')}</span>
              <span className="hero__btn-arrow">{dir === 'rtl' ? '←' : '→'}</span>
              <span className="hero__btn-shine" />
            </Link>
            <Link to="/auth?mode=signup&role=seller" className="hero__btn hero__btn--secondary">
              {t('hero.cta.store')}
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero__visual"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="hero__visual-glow" />

          <FloatingCard
            className="hero__float-card hero__float-card--1"
            delay={0}
            duration={6}
            strength={12}
            parallaxX={px1}
            parallaxY={py1}
          >
            <div className="hero__float-card-inner glass-card">
              <div className="hero__float-icon">🛍️</div>
              <div className="hero__float-text">
                <span className="hero__float-title">{dir === 'rtl' ? 'منتجات رقمية' : 'Digital Products'}</span>
                <span className="hero__float-sub">{dir === 'rtl' ? '1,200+ منتج' : '1,200+ items'}</span>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard
            className="hero__float-card hero__float-card--2"
            delay={1}
            duration={7}
            strength={10}
            parallaxX={px2}
            parallaxY={py2}
          >
            <div className="hero__float-card-inner glass-card">
              <div className="hero__float-icon">⚡</div>
              <div className="hero__float-text">
                <span className="hero__float-title">{dir === 'rtl' ? 'تسليم فوري' : 'Instant Delivery'}</span>
                <span className="hero__float-sub">{dir === 'rtl' ? '99.9%' : '99.9%'}</span>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard
            className="hero__float-card hero__float-card--3"
            delay={2}
            duration={8}
            strength={8}
            parallaxX={px1}
            parallaxY={py1}
          >
            <div className="hero__float-card-inner glass-card">
              <div className="hero__float-icon">🛡️</div>
              <div className="hero__float-text">
                <span className="hero__float-title">{dir === 'rtl' ? 'آمن 100%' : '100% Secure'}</span>
                <span className="hero__float-sub">{dir === 'rtl' ? 'حماية كاملة' : 'Full Protection'}</span>
              </div>
            </div>
          </FloatingCard>

          <div className="hero__visual-orb hero__visual-orb--1" />
          <div className="hero__visual-orb hero__visual-orb--2" />
        </motion.div>
      </div>

      <div className="hero__stats" ref={statsRef}>
        <div className="container hero__stats-inner">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="hero__stat-item"
              custom={i}
              variants={statVariants}
              initial="hidden"
              animate={statsVisible ? 'visible' : 'hidden'}
            >
              <span className="hero__stat-number">
                {statsVisible ? (
                  <CountUp end={stat.end} duration={2.5} separator="," formattingFn={formatNumber} />
                ) : '0'}
                {stat.suffix}
              </span>
              <span className="hero__stat-desc">{t(stat.key)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
