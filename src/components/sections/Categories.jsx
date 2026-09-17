import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { fetchCategories } from '../../lib/supabase';
import './Categories.css';

export default function Categories() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { dir } = useLanguage();
  const reduce = useReducedMotion();

  useEffect(() => {
    let activeFlag = true;
    fetchCategories().then(({ data }) => {
      if (!activeFlag) return;
      const list = data || [];
      if (!list.length) return setItems([]);
      setItems([
        { id: null, slug: '', name_ar: 'الكل', name_en: 'All', enabled: true },
        ...list.map((c) => ({ id: c.id, slug: c.slug, name_ar: c.name, name_en: c.name_en || c.name, enabled: true })),
      ]);
    });
    return () => { activeFlag = false; };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (!items.length) return null;

  const spring = reduce
    ? { duration: 0 }
    : { type: 'spring', stiffness: 420, damping: 34 };

  const handleSelect = (i, cat) => {
    setActive(i);
    navigate(cat.slug ? `/marketplace?cat=${encodeURIComponent(cat.slug)}` : '/marketplace');
  };

  return (
    <section ref={ref} className="categories">
      <div className="categories__scroll" role="group" aria-label="Categories">
        {items.map((cat, i) => {
          const isActive = active === i;
          return (
            <button
              key={cat.slug || 'all'}
              aria-pressed={isActive}
              className={`categories__pill ${isActive ? 'categories__pill--active' : ''} ${visible ? `animate-slide-up stagger-${i + 1}` : ''}`}
              onClick={() => handleSelect(i, cat)}
            >
              {!reduce && isActive && (
                <motion.span
                  layoutId="categories-active-pill"
                  className="categories__pill-bg"
                  transition={spring}
                />
              )}
              <span className="categories__pill-label">
                {dir === 'rtl' ? cat.name_ar : cat.name_en}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}