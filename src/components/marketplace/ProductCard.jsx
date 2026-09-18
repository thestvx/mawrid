import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useCart } from '../../contexts/CartContext';
import './ProductCard.css';

export default function ProductCard({ product, index = 0 }) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-40px' });
  const { dir } = useLanguage();
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
  const discountPct =
    hasSale && price > 0
      ? Math.round((1 - salePrice / price) * 100)
      : 0;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="product-card-wrap"
    >
      <Link
        to={`/product/${product.id}`}
        className={`product-card ${product.featured ? 'product-card--featured' : ''}`}
      >
        <div className="product-card__image-wrap">
          {product.featured && (
            <span className="product-card__badge product-card__badge--featured">
              {isRtl ? 'مميز' : 'Featured'}
            </span>
          )}
          {hasSale && discountPct > 0 && (
            <span className="product-card__badge product-card__badge--discount">-{discountPct}%</span>
          )}
          <div className="product-card__image-overlay" />
          {image ? (
            <img
              src={image}
              alt={title}
              className="product-card__img"
              loading="lazy"
            />
          ) : (
            <div className="product-card__img product-card__img--placeholder">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
          )}
          <div className="product-card__actions">
            <button className="product-card__action-btn product-card__action-btn--fav" onClick={(e) => { e.preventDefault(); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button
              className={`product-card__action-btn product-card__action-btn--cart ${added ? 'product-card__action-btn--cart-added' : ''}`}
              onClick={handleAdd}
              aria-label={isRtl ? 'أضف إلى السلة' : 'Add to cart'}
            >
              {added ? (
                <svg className="product-card__check" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 12.5l5 5L19.5 6.5" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              )}
            </button>
          </div>
          {added && (
            <span className="product-card__toast">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4.5 12.5l5 5L19.5 6.5" />
              </svg>
              {isRtl ? 'تمت الإضافة إلى سلتك' : 'Added to your cart'}
            </span>
          )}
        </div>
        <div className="product-card__body">
          {product.seller_name && (
            <div className="product-card__meta">
              <span className="product-card__seller">{isRtl ? product.seller_name : product.seller_name}</span>
              {Number(product.sales) > 0 && (
                <span className="product-card__sales">{Number(product.sales).toLocaleString('en-US')}</span>
              )}
            </div>
          )}
          <h3 className="product-card__title">{title}</h3>
          <div className="product-card__footer">
            <span className="product-card__price">{fmtValue(shownPrice)}</span>
            {hasSale && (
              <span className="product-card__old-price">{fmtValue(price)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}