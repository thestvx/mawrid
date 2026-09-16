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

const ctaVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: EASE, delay: 0.3 },
  },
};

const statVariants = {
  hidden: { opacity: 0, y: 26 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: EASE, delay: 0.5 + i * 0.15 },
  }),
};

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

export default function Hero() {
  const sectionRef = useRef(null);
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const { t, dir } = useLanguage();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 30, mass: 1 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 30, mass: 1 });
  const reduce = useReducedMotion();
  const bgX = useTransform(springX, [-1, 1], [reduce ? 0 : -8, reduce ? 0 : 8]);
  const bgY = useTransform(springY, [-1, 1], [reduce ? 0 : -8, reduce ? 0 : 8]);

  const handleMouseMove = useCallback((e) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    mouseX.set((e.clientX / w - 0.5) * 2);
    mouseY.set((e.clientY / h - 0.5) * 2);
  }, [mouseX, mouseY]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const scrollBgY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.14]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="hero"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
    >
      <GlowCursor />

      <div className="hero__dot-grid" />

      <div className="hero__bg">
        <motion.div className="hero__bg-scroll" style={{ y: scrollBgY, scale: bgScale }}>
          <motion.img
            src="/images/backgrounds/herobackground01.png"
            alt=""
            className="hero__bg-img"
            loading="eager"
            style={{ x: bgX, y: bgY }}
          />
        </motion.div>
        <div className="hero__overlay" />
      </div>

      <div className="container hero__content">
        <motion.div className="hero__cta" variants={ctaVariants} initial="hidden" animate="visible">
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
