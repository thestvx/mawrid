import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useCart } from '../../contexts/CartContext';
import Badge from '../ui/Badge';
import './ProductCard.css';

function StarIcon({ filled }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function ProductCard({ product, index = 0 }) {
  const cardRef = useRef(null);
  const { t, dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const { add } = useCart();
  const { productPrices, fmtValue } = useCurrency();

  const [added, setAdded] = useState(false);
  const addedTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(addedTimer.current), []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (added) return;
    add(product);
    setAdded(true);
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 1900);
  };

  const title = isRtl ? product.name : product.name_en || product.name;
  const image = product.thumbnail || (Array.isArray(product.images) && product.images[0]) || '';
  const { price, salePrice } = productPrices(product);
  const hasSale = salePrice > 0 && salePrice < price;
  const shownPrice = hasSale ? salePrice : price;
  const discountPct = hasSale && price > 0 ? Math.round((1 - salePrice / price) * 100) : 0;
  const rating = Number(product.rating) || 0;

  return (
    <div ref={cardRef} className="mw-product-card" style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}>
      <Link to={`/product/${product.id}`} className="mw-product-card__link" aria-label={title}>
        <div className="mw-product-card__media">
          {image ? (
            <img src={image} alt={title} className="mw-product-card__img" loading="lazy" />
          ) : (
            <div className="mw-product-card__img mw-product-card__img--placeholder" aria-hidden="true" />
          )}
          <div className="mw-product-card__badges">
            {product.featured && <Badge tone="hot">{isRtl ? 'مميز' : 'Featured'}</Badge>}
            {hasSale && discountPct > 0 && <Badge tone="new">-{discountPct}%</Badge>}
          </div>
          <button
            type="button"
            className={`mw-product-card__add${added ? ' mw-product-card__add--added' : ''}`}
            onClick={handleAdd}
            aria-label={t('details.addToCart')}
            title={t('details.addToCart')}
          >
            {added ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4.5 12.5l5 5L19.5 6.5" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            )}
          </button>
        </div>
        <div className="mw-product-card__body">
          {product.seller_name && (
            <span className="mw-product-card__seller">{product.seller_name}</span>
          )}
          <h3 className="mw-product-card__title">{title}</h3>
          <div className="mw-product-card__meta">
            <span className="mw-product-card__price">{fmtValue(shownPrice)}</span>
            {hasSale && <span className="mw-product-card__old">{fmtValue(price)}</span>}
            {rating > 0 && (
              <span className="mw-product-card__rating">
                <StarIcon filled />
                {rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
