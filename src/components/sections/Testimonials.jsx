import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Carousel from '../ui/Carousel';
import SplitText from '../ui/SplitText';
import './Testimonials.css';

const TESTIMONIAL_POOL = [
  { quote: 'testimonials.q1', name: 'testimonials.n1', role: 'testimonials.r1', avatar: 'testimonials.a1', rating: 5, color: '#ff6201' },
  { quote: 'testimonials.q2', name: 'testimonials.n2', role: 'testimonials.r2', avatar: 'testimonials.a2', rating: 5, color: '#494bd6' },
  { quote: 'testimonials.q3', name: 'testimonials.n3', role: 'testimonials.r3', avatar: 'testimonials.a3', rating: 5, color: '#10b981' },
  { quote: 'testimonials.q4', name: 'testimonials.n4', role: 'testimonials.r4', avatar: 'testimonials.a4', rating: 5, color: '#8b5cf6' },
  { quote: 'testimonials.q5', name: 'testimonials.n5', role: 'testimonials.r5', avatar: 'testimonials.a5', rating: 5, color: '#f59e0b' },
  { quote: 'testimonials.q6', name: 'testimonials.n6', role: 'testimonials.r6', avatar: 'testimonials.a6', rating: 5, color: '#ec4899' },
  { quote: 'testimonials.q7', name: 'testimonials.n7', role: 'testimonials.r7', avatar: 'testimonials.a7', rating: 5, color: '#06b6d4' },
  { quote: 'testimonials.q8', name: 'testimonials.n8', role: 'testimonials.r8', avatar: 'testimonials.a8', rating: 5, color: '#22c55e' },
];

const REVIEW_COUNT = 6;

const shuffleAndPick = () => {
  const copy = [...TESTIMONIAL_POOL];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, REVIEW_COUNT);
};

export default function Testimonials() {
  const { t } = useLanguage();
  const [testimonials] = useState(() => shuffleAndPick());
  const items = testimonials.map((t_, i) => ({ ...t_, id: i + 1 }));

  const initials = (nameKey) => {
    const name = t(nameKey);
    return name.split(' ').map(w => w[0]).join('').slice(0, 2);
  };

  const renderReview = (item) => (
    <div className="t-review">
      <div className="t-review__stars">
        {Array.from({ length: item.rating }, (_, s) => (
          <svg key={s} className="t-review__star" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <p className="t-review__quote">{t(item.quote)}</p>
      <div className="t-review__author">
        <span className="t-review__avatar" style={{ background: `${item.color}18`, color: item.color }}>
          {initials(item.name)}
        </span>
        <div className="t-review__meta">
          <strong>{t(item.name)}</strong>
          <span>{t(item.role)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <section className="testimonials">
      <div className="container">
        <div className="testimonials__header">
          <SplitText
            text={t('testimonials.title')}
            tag="h2"
            className="testimonials__title"
            textAlign="center"
            delay={28}
            duration={1}
            threshold={0.15}
            from={{ opacity: 0, y: 30 }}
          />
          <p className="testimonials__sub">{t('testimonials.subtitle')}</p>
        </div>

        <Carousel
          items={items}
          baseWidth={348}
          autoplay
          autoplayDelay={4200}
          pauseOnHover
          loop
          renderContent={renderReview}
        />
      </div>
    </section>
  );
}