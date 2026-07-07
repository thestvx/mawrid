import { useEffect, useRef, useState } from 'react';
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

export default function Testimonials() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const initials = (nameKey) => {
    const name = t(nameKey);
    return name.split(' ').map(w => w[0]).join('').slice(0, 2);
  };

  return (
    <section className="testimonials" ref={sectionRef}>
      <div className="container">
        <div className={`testimonials__header ${visible ? 'animate-section' : ''}`}>
          <h2 className="testimonials__title">{t('testimonials.title')}</h2>
          <p className="testimonials__sub">{t('testimonials.subtitle')}</p>
        </div>
        <div className="testimonials__grid">
          {testimonials.map((t_, i) => (
            <div
              key={i}
              className={`testimonials__card ${visible ? 'animate-section' : ''}`}
              style={{ animationDelay: `${0.15 + i * 0.12}s` }}
            >
              <div className="testimonials__stars">
                {Array.from({ length: t_.rating }, (_, s) => (
                  <span key={s} className="testimonials__star">★</span>
                ))}
              </div>
              <p className="testimonials__quote">{t(t_.quote)}</p>
              <div className="testimonials__author">
                <div className="testimonials__avatar" style={{ background: `${t_.color}18`, color: t_.color }}>
                  {initials(t_.name)}
                </div>
                <div className="testimonials__info">
                  <strong>{t(t_.name)}</strong>
                  <span>{t(t_.role)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
