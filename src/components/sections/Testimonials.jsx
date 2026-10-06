import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import SectionHeading from '../ui/SectionHeading';
import './Testimonials.css';

const TESTIMONIAL_POOL = [
  { quote: 'testimonials.q1', name: 'testimonials.n1', role: 'testimonials.r1', rating: 5, color: '#ff6201' },
  { quote: 'testimonials.q2', name: 'testimonials.n2', role: 'testimonials.r2', rating: 5, color: '#494bd6' },
  { quote: 'testimonials.q3', name: 'testimonials.n3', role: 'testimonials.r3', rating: 5, color: '#1e7e34' },
  { quote: 'testimonials.q4', name: 'testimonials.n4', role: 'testimonials.r4', rating: 5, color: '#8b5cf6' },
  { quote: 'testimonials.q5', name: 'testimonials.n5', role: 'testimonials.r5', rating: 5, color: '#f59e0b' },
  { quote: 'testimonials.q6', name: 'testimonials.n6', role: 'testimonials.r6', rating: 5, color: '#ec4899' },
];

const shuffleAndPick = (n = 3) => {
  const copy = [...TESTIMONIAL_POOL];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
};

const initialsOf = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2);

export default function Testimonials() {
  const { t } = useLanguage();
  const [testimonials] = useState(() => shuffleAndPick(3));

  return (
    <section className="mw-section mw-testimonials">
      <div className="mw-container">
        <SectionHeading
          eyebrow={t('testimonials.eyebrow')}
          title={t('testimonials.title')}
          subtitle={t('testimonials.subtitle')}
        />
        <div className="mw-testimonials__grid">
          {testimonials.map((item, i) => (
            <figure key={i} className="mw-testimonial-card">
              <div className="mw-testimonial-card__stars" aria-label={`${item.rating} / 5`}>
                {Array.from({ length: item.rating }, (_, s) => (
                  <svg key={s} width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <blockquote className="mw-testimonial-card__quote">{t(item.quote)}</blockquote>
              <figcaption className="mw-testimonial-card__author">
                <span className="mw-testimonial-card__avatar" style={{ background: `${item.color}1a`, color: item.color }}>
                  {initialsOf(t(item.name))}
                </span>
                <span className="mw-testimonial-card__meta">
                  <strong>{t(item.name)}</strong>
                  <span>{t(item.role)}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
