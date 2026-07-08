import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import './ProductCard.css';

export default function ProductCard({ product, index = 0 }) {
  const cardRef = useRef(null);
  const { dir } = useLanguage();
  const badge = dir === 'rtl' ? product.badge_ar : product.badge_en;

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const timer = setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0) scale(1)';
    }, 100 + index * 80);

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Link
      to="/details"
      ref={cardRef}
      className={`product-card ${product.featured ? 'product-card--featured' : ''}`}
      style={{ opacity: 0, transform: 'translateY(30px) scale(0.97)', transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)' }}
    >
      <div className="product-card__image-wrap">
        {badge && (
          <span className={`product-card__badge ${product.featured ? 'product-card__badge--featured' : ''}`}>
            {badge}
          </span>
        )}
        <div className="product-card__image-overlay" />
        <img
          src={product.image}
          alt={dir === 'rtl' ? product.title_ar : product.title_en}
          className="product-card__img"
          loading="lazy"
        />
        <div className="product-card__actions">
          <button className="product-card__action-btn product-card__action-btn--fav" onClick={(e) => { e.preventDefault(); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <button className="product-card__action-btn product-card__action-btn--cart" onClick={(e) => { e.preventDefault(); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </button>
        </div>
      </div>
      <div className="product-card__body">
        <div className="product-card__rating">
          <div className="product-card__stars">{'★'.repeat(5)}</div>
          <span className="product-card__reviews">(24)</span>
        </div>
        <h3 className="product-card__title">
          {dir === 'rtl' ? product.title_ar : product.title_en}
        </h3>
        <div className="product-card__meta">
          <span className="product-card__seller">{dir === 'rtl' ? 'بواسطة متجر رسمي' : 'by Official Store'}</span>
          <span className="product-card__sales">{dir === 'rtl' ? '١٫٢ ألف بيع' : '1.2K sold'}</span>
        </div>
        <div className="product-card__footer">
          <span className="product-card__price">${product.price}</span>
          <span className="product-card__old-price">${(parseFloat(product.price) * 1.4).toFixed(2)}</span>
          <span className="product-card__discount">-30%</span>
        </div>
      </div>
    </Link>
  );
}
