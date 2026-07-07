import { useEffect, useRef, useState } from 'react';
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
  const isRtl = document.documentElement.dir === 'rtl';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="categories">
      <div className="categories__scroll">
        {CATEGORIES.map((cat, i) => (
          <button
            key={i}
            className={`categories__pill ${active === i ? 'categories__pill--active' : ''} ${visible ? `animate-slide-up stagger-${i + 1}` : ''}`}
            onClick={() => setActive(i)}
          >
            {isRtl ? cat.label_ar : cat.label_en}
          </button>
        ))}
      </div>
    </section>
  );
}
