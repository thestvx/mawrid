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

const headerVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Testimonials() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  const initials = (nameKey) => {
    const name = t(nameKey);
    return name.split(' ').map(w => w[0]).join('').slice(0, 2);
  };

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
          className="testimonials__grid"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {testimonials.map((t_, i) => (
            <motion.div
              key={i}
              className="testimonials__card"
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="testimonials__stars">
                {Array.from({ length: t_.rating }, (_, s) => (
                  <motion.span
                    key={s}
                    className="testimonials__star"
                    initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
                    animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                    transition={{ delay: 0.45 + i * 0.12 + s * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    ★
                  </motion.span>
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
                  <strong>{t(t_.name)}</strong>
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