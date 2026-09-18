import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useCart } from '../../contexts/CartContext';
import { durationLabel, matchPlanProduct, planCartItem } from '../../lib/plans';
import './PlanCard.css';

export default function PlanCard({ sub, src, index = 0, products = [] }) {
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const { add } = useCart();
  const { productPrices, fmtValue } = useCurrency();

  const label = durationLabel(src, isRtl);
  const product = matchPlanProduct(src, products);
  const { salePrice } = productPrices(product);
  const price = salePrice > 0 ? salePrice : 0;
  const hasPrice = price > 0;
  const title = isRtl ? sub.title_ar : sub.title_en;

  const [added, setAdded] = useState(false);
  const addedTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(addedTimer.current), []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!hasPrice || added) return;
    add(planCartItem(sub, src, product));
    setAdded(true);
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 1900);
  };

  return (
    <motion.div
      className="plan-card"
      style={{ animationDelay: `${index * 60}ms` }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
      whileHover={{ y: -6 }}
    >
      <div className="plan-card__media">
        <img src={src} alt={`${title}${label ? ` ${label}` : ''}`} loading="lazy" />
        {label && <span className="plan-card__badge">{label}</span>}
      </div>

      <div className="plan-card__body">
        <div className="plan-card__price">
          <span className="plan-card__price-caption">{isRtl ? 'السعر' : 'Price'}</span>
          {hasPrice ? (
            <span className="plan-card__price-value">{fmtValue(price)}</span>
          ) : (
            <span className="plan-card__price-value plan-card__price-value--na">{isRtl ? 'قريباً' : 'Soon'}</span>
          )}
        </div>
        <button
          type="button"
          className={`plan-card__cta ${added ? 'plan-card__cta--added' : ''} ${!hasPrice ? 'plan-card__cta--disabled' : ''}`}
          onClick={handleAdd}
          disabled={!hasPrice || added}
          aria-label={isRtl ? 'أضف إلى السلة' : 'Add to cart'}
        >
          {added ? (
            <>
              <svg className="plan-card__check" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4.5 12.5l5 5L19.5 6.5" />
              </svg>
              <span className="plan-card__added-label">{isRtl ? 'تمت الإضافة إلى سلتك' : 'Added to your cart'}</span>
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="plan-card__cta-label">{isRtl ? 'أضف إلى السلة' : 'Add to cart'}</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}