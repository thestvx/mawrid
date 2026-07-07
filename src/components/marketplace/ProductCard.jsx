import { Link } from 'react-router-dom';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const isRtl = document.documentElement.dir === 'rtl';
  const badge = isRtl ? product.badge_ar : product.badge_en;

  return (
    <Link to="/details" className={`product-card ${product.featured ? 'product-card--featured' : ''}`}>
      <div className="product-card__image-wrap">
        {badge && (
          <span className={`product-card__badge ${product.featured ? 'product-card__badge--featured' : ''}`}>
            {badge}
          </span>
        )}
        <button className="product-card__fav" onClick={(e) => { e.preventDefault(); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <img
          src={product.image}
          alt={isRtl ? product.title_ar : product.title_en}
          className="product-card__img"
          loading="lazy"
        />
      </div>
      <div className="product-card__body">
        <h3 className="product-card__title">
          {isRtl ? product.title_ar : product.title_en}
        </h3>
        <div className="product-card__footer">
          <span className="product-card__price">${product.price}</span>
          <button className="product-card__cart" onClick={(e) => { e.preventDefault(); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}
