import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useReducedMotion,
} from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import './Hero.css';

const stats = [
  { end: 3200, suffix: '+', key: 'hero.stat.products' },
  { end: 840, suffix: '+', key: 'hero.stat.sellers' },
  { end: 47000, suffix: '+', key: 'hero.stat.buyers' },
];

const EASE = [0.16, 1, 0.3, 1];

function AnimatedCounter({ end, suffix, isVisible }) {
  const [display, setDisplay] = useState('0');
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!isVisible) return;
    if (reduce) {
      setDisplay(end.toLocaleString('en-US'));
      return;
    }
    const duration = 2000;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * end);
      setDisplay(current.toLocaleString('en-US'));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [isVisible, end, reduce]);

  return <>{display}{suffix}</>;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.35 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 36, filter: 'blur(6px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.8, ease: EASE },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 16 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

const titleContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.55 } },
};

const titleLineVariants = {
  hidden: { y: '112%' },
  visible: { y: '0%', transition: { duration: 0.9, ease: EASE } },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.9, x: 60 },
  visible: {
    opacity: 1, scale: 1, x: 0,
    transition: { duration: 1, ease: EASE, delay: 0.4 },
  },
};

const statVariants = {
  hidden: { opacity: 0, y: 26 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: EASE, delay: 0.8 + i * 0.15 },
  }),
};

function useParallax(strength = 20) {
  const reduce = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 30, mass: 1 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 30, mass: 1 });
  const x = useTransform(springX, [-1, 1], [reduce ? 0 : -strength, reduce ? 0 : strength]);
  const y = useTransform(springY, [-1, 1], [reduce ? 0 : -strength, reduce ? 0 : strength]);

  const handleMouseMove = useCallback((e) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    mouseX.set((e.clientX / w - 0.5) * 2);
    mouseY.set((e.clientY / h - 0.5) * 2);
  }, [mouseX, mouseY]);

  return { x, y, handleMouseMove };
}

function GlowCursor() {
  const reduce = useReducedMotion();
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

  if (reduce) return null;

  return (
    <motion.div
      className="hero__glow-cursor"
      style={{ x: springX, y: springY }}
    />
  );
}

function FloatingCard({ children, className, delay = 0, duration = 6, strength = 15, parallaxX, parallaxY }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      style={{ x: parallaxX, y: parallaxY }}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -strength, 0] }}
        transition={reduce ? undefined : { duration, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="hero__float-card-inner glass-card">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

const titleLines = (t) => [
  <span key="mawrid" className="text-gradient-hero">{t('hero.title.mawrid')}</span>,
  <span key="l1">{t('hero.title.line1')}</span>,
  <span key="l2">{t('hero.title.line2')}</span>,
];

export default function Hero() {
  const sectionRef = useRef(null);
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const { t, dir } = useLanguage();

  const { x: px1, y: py1, handleMouseMove } = useParallax(25);
  const { x: px2, y: py2 } = useParallax(15);
  const { x: px3, y: py3 } = useParallax(8);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.14]);

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
        <motion.div className="hero__bg-scroll" style={{ y: bgY, scale: bgScale }}>
          <motion.img
            src={bgImage}
            alt=""
            className="hero__bg-img"
            loading="eager"
            style={{ x: px3, y: py3 }}
          />
        </motion.div>
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

          <motion.h1
            className="hero__title"
            variants={titleContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {titleLines(t).map((line, i) => (
              <span className="hero__title-line" key={i}>
                <motion.span className="hero__title-line-inner" variants={titleLineVariants}>
                  {line}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          <motion.p className="hero__subtitle" variants={itemVariants}>
            {t('hero.subtitle')}
          </motion.p>

          <motion.div className="hero__cta" variants={itemVariants}>
            <Link to="/marketplace" className="hero__btn hero__btn--primary">
              <span>{t('hero.cta.shop')}</span>
              <span className="hero__btn-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={dir === 'rtl' ? { transform: 'scaleX(-1)' } : undefined}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
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
          <div className="hero__visual-ring" />

          <FloatingCard
            className="hero__float-card hero__float-card--1"
            delay={0.5}
            duration={6}
            strength={12}
            parallaxX={px1}
            parallaxY={py1}
          >
            <div className="hero__float-icon">🛍️</div>
            <div className="hero__float-text">
              <span className="hero__float-title">{dir === 'rtl' ? 'منتجات رقمية' : 'Digital Products'}</span>
              <span className="hero__float-sub">{dir === 'rtl' ? '1,200+ منتج' : '1,200+ items'}</span>
            </div>
          </FloatingCard>

          <FloatingCard
            className="hero__float-card hero__float-card--2"
            delay={0.75}
            duration={7}
            strength={10}
            parallaxX={px2}
            parallaxY={py2}
          >
            <div className="hero__float-icon">⚡</div>
            <div className="hero__float-text">
              <span className="hero__float-title">{dir === 'rtl' ? 'تسليم فوري' : 'Instant Delivery'}</span>
              <span className="hero__float-sub">{dir === 'rtl' ? '99.9%' : '99.9%'}</span>
            </div>
          </FloatingCard>

          <FloatingCard
            className="hero__float-card hero__float-card--3"
            delay={1}
            duration={8}
            strength={8}
            parallaxX={px1}
            parallaxY={py1}
          >
            <div className="hero__float-icon">🛡️</div>
            <div className="hero__float-text">
              <span className="hero__float-title">{dir === 'rtl' ? 'آمن 100%' : '100% Secure'}</span>
              <span className="hero__float-sub">{dir === 'rtl' ? 'حماية كاملة' : 'Full Protection'}</span>
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
                <AnimatedCounter end={stat.end} suffix={stat.suffix} isVisible={statsVisible} />
              </span>
              <span className="hero__stat-desc">{t(stat.key)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}