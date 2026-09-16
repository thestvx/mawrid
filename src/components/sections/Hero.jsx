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
import Countdown from '../ui/Countdown';
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

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 16 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

const titleContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.35 } },
};

const titleLineVariants = {
  hidden: { y: '112%' },
  visible: { y: '0%', transition: { duration: 0.9, ease: EASE } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 36, filter: 'blur(6px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.8, ease: EASE },
  },
};

const boardVariants = {
  hidden: { opacity: 0, y: 44, scale: 0.92, rotate: 2 },
  visible: {
    opacity: 1, y: 0, scale: 1, rotate: 0,
    transition: { duration: 0.9, ease: EASE, delay: 0.5 },
  },
};

const chipVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: (i) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.7, ease: EASE, delay: 0.9 + i * 0.15 },
  }),
};

const statVariants = {
  hidden: { opacity: 0, y: 26 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: EASE, delay: 1.1 + i * 0.15 },
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

function BillboardChip({ children, className, delay, parallaxX, parallaxY }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={`hero__chip ${className}`}
      style={{ x: parallaxX, y: parallaxY }}
      custom={delay}
      variants={chipVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={reduce ? undefined : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="hero__chip-inner">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function AnnouncementTicker() {
  const { t } = useLanguage();
  const items = [1, 2, 3, 4, 5].map((i) => t(`hero.ticker.${i}`));

  return (
    <div className="hero__ticker" aria-hidden="true">
      <div className="hero__ticker-track">
        {[...items, ...items].map((item, i) => (
          <span className="hero__ticker-item" key={i}>
            <span className="hero__ticker-dot" />
            {item}
          </span>
        ))}
      </div>
      <div className="hero__ticker-fade hero__ticker-fade--start" />
      <div className="hero__ticker-fade hero__ticker-fade--end" />
    </div>
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

  const { x: px1, y: py1, handleMouseMove } = useParallax(22);
  const { x: px2, y: py2 } = useParallax(12);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.16]);

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

      <div className="hero__pattern" />

      <div className="hero__bg">
        <motion.div className="hero__bg-scroll" style={{ y: bgY, scale: bgScale }}>
          <motion.img
            src="/images/backgrounds/herobackground01.png"
            alt=""
            className="hero__bg-img"
            loading="eager"
            style={{ x: px2, y: py2 }}
          />
        </motion.div>
        <div className="hero__overlay" />
      </div>

      <div className="container hero__content">
        <motion.div className="hero__text">
          <motion.span className="hero__badge" variants={badgeVariants} initial="hidden" animate="visible">
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

          <motion.p className="hero__subtitle" variants={itemVariants} initial="hidden" animate="visible">
            {t('hero.subtitle')}
          </motion.p>

          <motion.div className="hero__cta" variants={itemVariants} initial="hidden" animate="visible">
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
          className="hero__board-wrap"
          variants={boardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="hero__board-glow" />

          <div className="hero__board">
            <span className="hero__board-ribbon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.9 6.26L21.5 9.27l-4.75 4.63 1.12 6.53L12 17.77l-5.88 3.66 1.12-6.53L2.5 9.27l6.6-1.01z" />
              </svg>
              {t('hero.board.hot')}
            </span>

            <div className="hero__board-body">
              <span className="hero__board-sticker">{t('hero.board.sticker')}</span>
              <h3 className="hero__board-title">{t('hero.board.title')}</h3>
              <p className="hero__board-desc">{t('hero.board.desc')}</p>

              <div className="hero__board-price">
                <span className="hero__board-price-old">
                  {t('hero.board.priceOld')} {t('hero.board.currency')}
                </span>
                <span className="hero__board-price-cur">
                  {t('hero.board.price')} <small>{t('hero.board.currency')}</small>
                </span>
                <span className="hero__board-price-per">{t('hero.board.per')}</span>
              </div>

              <div className="hero__board-countdown">
                <span className="hero__board-countdown-label">{t('hero.board.endsIn')}</span>
                <Countdown
                  size="md"
                  dark
                  labels={{
                    days: t('hero.board.days'),
                    hours: t('hero.board.hours'),
                    minutes: t('hero.board.mins'),
                    seconds: t('hero.board.secs'),
                  }}
                />
              </div>

              <div className="hero__board-stock">
                <div className="hero__board-stock-top">
                  <span>{t('hero.board.stock')} 17/50</span>
                  <span className="hero__board-rating">★★★★★ 4.9</span>
                </div>
                <div className="hero__board-progress">
                  <span className="hero__board-progress-fill" />
                </div>
              </div>

              <Link to="/marketplace" className="hero__board-cta">
                <span>{t('hero.board.cta')}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={dir === 'rtl' ? { transform: 'scaleX(-1)' } : undefined}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          <BillboardChip
            className="hero__chip--rating"
            delay={0}
            parallaxX={px1}
            parallaxY={py1}
          >
            <span className="hero__chip-icon">⭐</span>
            <span className="hero__chip-text">
              <strong>{t('hero.board.rating')}</strong>
              <small>{`12,400 ${t('hero.board.sold')}`}</small>
            </span>
          </BillboardChip>

          <BillboardChip
            className="hero__chip--secure"
            delay={1}
            parallaxX={px2}
            parallaxY={py2}
          >
            <span className="hero__chip-icon">🔐</span>
            <span className="hero__chip-text">
              <strong>{dir === 'rtl' ? 'ضمان استرجاع 30 يوم' : '30-day refund'}</strong>
              <small>{t('hero.ticker.3')}</small>
            </span>
          </BillboardChip>
        </motion.div>
      </div>

      <AnnouncementTicker />

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