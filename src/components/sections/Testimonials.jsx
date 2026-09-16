import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import './Testimonials.css';

const testimonials = [
  {
    quote: 'testimonials.q1',
    name: 'testimonials.n1',
    role: 'testimonials.r1',
    avatar: 'testimonials.a1',
    rating: 5,
    color: '#ff6201',
  },
  {
    quote: 'testimonials.q2',
    name: 'testimonials.n2',
    role: 'testimonials.r2',
    avatar: 'testimonials.a2',
    rating: 5,
    color: '#494bd6',
  },
  {
    quote: 'testimonials.q3',
    name: 'testimonials.n3',
    role: 'testimonials.r3',
    avatar: 'testimonials.a3',
    rating: 5,
    color: '#10b981',
  },
];

const EASE = [0.16, 1, 0.3, 1];

const headerVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: EASE },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.7, ease: EASE },
  },
};

export default function Testimonials() {
  const { t, dir } = useLanguage();
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [maxOffset, setMaxOffset] = useState(0);
  const reduce = useReducedMotion();
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  const initials = (nameKey) => {
    const name = t(nameKey);
    return name.split(' ').map(w => w[0]).join('').slice(0, 2);
  };

  useEffect(() => {
    const measure = () => {
      const card = trackRef.current?.querySelector('.testimonials__card');
      const gap = 24;
      const cardStep = card ? card.offsetWidth + gap : 0;
      const viewport = viewportRef.current?.clientWidth || 0;
      const total = cardStep * testimonials.length - gap;
      setStep(cardStep);
      setMaxOffset(Math.max(0, total - viewport));
    };
    measure();
    window.addEventListener('resize', measure);
    const id = setTimeout(measure, 250);
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(id);
    };
  }, []);

  const clamp = (v) => Math.max(0, Math.min(testimonials.length - 1, v));

  const goTo = (i) => {
    setIndex(clamp(i));
  };

  const move = (by) => {
    setIndex((prev) => clamp(prev + by));
  };

  const onDragEnd = (_, info) => {
    if (reduce) return;
    const velocity = info.offset.x;
    const threshold = step * 0.18;
    let next = index;
    if (velocity > threshold) next = index - 1;
    else if (velocity < -threshold) next = index + 1;
    goTo(next);
  };

  const renderCard = (t_, i) => (
    <article
      key={i}
      className="testimonials__card"
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      <svg className="testimonials__quote-icon" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ color: `${t_.color}20` }}>
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
      </svg>
      <div className="testimonials__stars">
        {Array.from({ length: t_.rating }, (_, s) => (
          <motion.svg
            key={s}
            className="testimonials__star-svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
            animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ delay: 0.35 + i * 0.12 + s * 0.06, duration: 0.4, ease: EASE }}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </motion.svg>
        ))}
      </div>
      <p className="testimonials__quote">{t(t_.quote)}</p>
      <div className="testimonials__author">
        <motion.div
          className="testimonials__avatar"
          style={{ background: `${t_.color}18`, color: t_.color }}
          whileHover={{ scale: 1.08, rotate: -4 }}
          transition={{ duration: 0.3 }}
        >
          {initials(t_.name)}
        </motion.div>
        <div className="testimonials__info">
          <div className="testimonials__name-row">
            <strong>{t(t_.name)}</strong>
            <svg className="testimonials__verified-badge" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: t_.color }} aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <span>{t(t_.role)}</span>
        </div>
      </div>
    </article>
  );

  return (
    <section className="testimonials" ref={sectionRef}>
      <div className="container">
        <motion.div
          className="testimonials__header"
          variants={headerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <h2 className="testimonials__title">{t('testimonials.title')}</h2>
          <p className="testimonials__sub">{t('testimonials.subtitle')}</p>
        </motion.div>

        <div className="testimonials__carousel">
          <div className="testimonials__viewport" ref={viewportRef}>
            <motion.div
              ref={trackRef}
              className="testimonials__track"
              drag={maxOffset > 0 ? 'x' : false}
              dragConstraints={{ left: -maxOffset, right: 0 }}
              dragElastic={0.12}
              onDragEnd={onDragEnd}
              animate={{ x: -index * step }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            >
              {testimonials.map(renderCard)}
            </motion.div>
          </div>

          <div className="testimonials__nav">
            <motion.button
              className="testimonials__nav-btn"
              onClick={() => move(-1)}
              disabled={index === 0}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              aria-label={dir === 'rtl' ? 'السابق' : 'Previous'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={dir === 'rtl' ? { transform: 'scaleX(-1)' } : undefined}>
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </motion.button>
            <div className="testimonials__dots">
              {testimonials.map((t_, i) => (
                <button
                  key={i}
                  className={`testimonials__dot ${i === index ? 'testimonials__dot--active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`${i + 1}`}
                />
              ))}
            </div>
            <motion.button
              className="testimonials__nav-btn"
              onClick={() => move(1)}
              disabled={index === testimonials.length - 1}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              aria-label={dir === 'rtl' ? 'التالي' : 'Next'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={dir === 'rtl' ? { transform: 'scaleX(-1)' } : undefined}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}