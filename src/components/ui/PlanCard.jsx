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

  const handleAdd = (e) => {
    e.preventDefault();
    if (!hasPrice) return;
    add(planCartItem(sub, src, product));
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
        <div className="plan-card__overlay">
          <button
            type="button"
            className={`plan-card__cta ${!hasPrice ? 'plan-card__cta--disabled' : ''}`}
            onClick={handleAdd}
            disabled={!hasPrice}
            aria-label={isRtl ? 'أضف إلى السلة' : 'Add to cart'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="plan-card__cta-label">{isRtl ? 'أضف إلى السلة' : 'Add to cart'}</span>
            {hasPrice && <span className="plan-card__cta-price">{fmtValue(price)}</span>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}