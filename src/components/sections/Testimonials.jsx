import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
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
    featured: false,
  },
  {
    quote: 'testimonials.q2',
    name: 'testimonials.n2',
    role: 'testimonials.r2',
    avatar: 'testimonials.a2',
    rating: 5,
    color: '#494bd6',
    featured: true,
  },
  {
    quote: 'testimonials.q3',
    name: 'testimonials.n3',
    role: 'testimonials.r3',
    avatar: 'testimonials.a3',
    rating: 5,
    color: '#10b981',
    featured: false,
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

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.7, ease: EASE },
  },
};

const ratingBarVariants = {
  hidden: { scaleX: 0 },
  visible: (i) => ({
    scaleX: 1,
    transition: { duration: 0.8, ease: EASE, delay: 0.4 + i * 0.08 },
  }),
};

export default function Testimonials() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  const initials = (nameKey) => {
    const name = t(nameKey);
    return name.split(' ').map(w => w[0]).join('').slice(0, 2);
  };

  const bars = [
    { stars: 5, pct: 78 },
    { stars: 4, pct: 15 },
    { stars: 3, pct: 5 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 1 },
  ];

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

        <motion.div
          className="testimonials__layout"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Aggregate Rating Panel */}
          <motion.div className="testimonials__rating-panel" variants={cardVariants}>
            <div className="testimonials__rating-big">
              <span className="testimonials__rating-number">4.9</span>
              <span className="testimonials__rating-max">/5</span>
            </div>
            <div className="testimonials__rating-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} className="testimonials__star-svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <div className="testimonials__rating-bars">
              {bars.map((bar, i) => (
                <div key={bar.stars} className="testimonials__bar-row">
                  <span className="testimonials__bar-label">{bar.stars}</span>
                  <svg className="testimonials__bar-star" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <div className="testimonials__bar-track">
                    <motion.div
                      className="testimonials__bar-fill"
                      style={{ width: `${bar.pct}%` }}
                      custom={i}
                      variants={ratingBarVariants}
                      initial="hidden"
                      animate={isInView ? 'visible' : 'hidden'}
                    />
                  </div>
                  <span className="testimonials__bar-pct">{bar.pct}%</span>
                </div>
              ))}
            </div>
            <p className="testimonials__rating-agg">{t('testimonials.aggregate')}</p>
          </motion.div>

          {/* Testimonial Cards */}
          {testimonials.map((t_, i) => (
            <motion.div
              key={i}
              className={`testimonials__card ${t_.featured ? 'testimonials__card--featured' : ''}`}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
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
                    transition={{ delay: 0.45 + i * 0.12 + s * 0.06, duration: 0.4, ease: EASE }}
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
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
