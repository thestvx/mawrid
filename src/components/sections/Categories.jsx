import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import './Categories.css';

const CATEGORIES = [
  { label_ar: 'الكل', label_en: 'All' },
  { label_ar: 'عروض', label_en: 'Offers' },
  { label_ar: 'برمجيات', label_en: 'Software' },
  { label_ar: 'تصميم', label_en: 'Design' },
  { label_ar: 'صحة ورياضة', label_en: 'Health & Sports' },
  { label_ar: 'فنون', label_en: 'Arts' },
  { label_ar: 'منزل', label_en: 'Home' },
  { label_ar: 'موسيقى', label_en: 'Music' },
];

export default function Categories() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const { dir } = useLanguage();
  const reduce = useReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const spring = reduce
    ? { duration: 0 }
    : { type: 'spring', stiffness: 420, damping: 34 };

  return (
    <section ref={ref} className="categories">
      <div className="categories__scroll" role="group" aria-label="Categories">
        {CATEGORIES.map((cat, i) => {
          const isActive = active === i;
          return (
            <button
              key={i}
              aria-pressed={isActive}
              className={`categories__pill ${isActive ? 'categories__pill--active' : ''} ${visible ? `animate-slide-up stagger-${i + 1}` : ''}`}
              onClick={() => setActive(i)}
            >
              {!reduce && isActive && (
                <motion.span
                  layoutId="categories-active-pill"
                  className="categories__pill-bg"
                  transition={spring}
                />
              )}
              <span className="categories__pill-label">
                {dir === 'rtl' ? cat.label_ar : cat.label_en}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}