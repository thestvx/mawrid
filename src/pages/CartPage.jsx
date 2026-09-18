import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import './CartPage.css';

const staggerContainer = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const staggerItem = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };

function optionValues(options) {
  if (!options || typeof options !== 'object') return [];
  const seen = new Set();
  const values = [];
  Object.keys(options).forEach((k) => {
    const v = options[k];
    if (v == null || v === '') return;
    const s = String(v);
    if (!seen.has(s)) {
      seen.add(s);
      values.push(s);
    }
  });
  return values;
}

export default function CartPage() {
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const { fmt } = useCurrency();
  const { items, updateQty, remove, clear, count, subtotal, tax, total, originalTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [removing, setRemoving] = useState(null);
  const [clearing, setClearing] = useState(false);

  const savings = Math.max(0, (originalTotal || subtotal) - subtotal);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/auth?mode=signin&next=/checkout');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="cart-page">
      <div className="cart-page__glow cart-page__glow--1" aria-hidden="true" />
      <div className="cart-page__glow cart-page__glow--2" aria-hidden="true" />

      <div className="cart-page__layout">
        <motion.header
          className="cart-page__head"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="cart-page__title">
            <span className="cart-page__title-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </span>
            <span>{isRtl ? 'سلة التسوق' : 'Shopping Cart'}</span>
            <span className="cart-page__count">{count}</span>
          </div>
          {count > 0 && (
            <button
              className="cart-page__clear"
              onClick={() => { setClearing(true); setTimeout(() => { clear(); setClearing(false); }, 240); }}
              disabled={clearing}
            >
              {isRtl ? 'إفراغ السلة' : 'Clear cart'}
            </button>
          )}
        </motion.header>

        {count === 0 ? (
          <motion.div
            className="cart-page__empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="cart-page__empty-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <h2>{isRtl ? 'سلتك فارغة' : 'Your cart is empty'}</h2>
            <p>{isRtl ? 'لم تضف أي اشتراك بعد. تصفح الأقسام وابدأ اختيارك.' : 'You have not added anything yet. Browse the sections and start choosing.'}</p>
            <button className="cart-page__cta cart-page__cta--ghost" onClick={() => navigate('/')}>
              {isRtl ? 'تصفح الأقسام' : 'Browse sections'}
            </button>
          </motion.div>
        ) : (
          <div className="cart-page__cols">
            <motion.div className="cart-page__items" variants={staggerContainer} initial="hidden" animate="show">
              <AnimatePresence>
                {items.map((item) => {
                  const opts = optionValues(item.options);
                  const hasOldPrice = Number(item.originalPrice) > Number(item.price);
                  const itemLink = item.link || '/marketplace';
                  return (
                    <motion.div
                      key={item.id}
                      className="cart-page__item"
                      variants={staggerItem}
                      layout
                      exit={{ opacity: 0, x: isRtl ? 70 : -70, height: 0, marginBottom: 0, transition: { duration: 0.3 } }}
                    >
                      {itemLink ? (
                        <a href={itemLink} className="cart-page__thumb">
                          {item.img ? <img src={item.img} alt="" loading="lazy" /> : null}
                        </a>
                      ) : (
                        <span className="cart-page__thumb">
                          {item.img ? <img src={item.img} alt="" loading="lazy" /> : null}
                        </span>
                      )}

                      <div className="cart-page__info">
                        <div className="cart-page__name">
                          {isRtl ? item.title_ar : item.title_en || item.title_ar}
                        </div>

                        {opts.length > 0 && (
                          <div className="cart-page__opts">
                            {opts.map((o) => (
                              <span className="cart-page__opt" key={o}>{o}</span>
                            ))}
                          </div>
                        )}

                        <div className="cart-page__price-row">
                          <span className="cart-page__price">{fmt(item.price)}</span>
                          {hasOldPrice && <span className="cart-page__oldprice">{fmt(item.originalPrice)}</span>}
                          <div className="cart-page__qty">
                            <button
                              className="cart-page__qty-btn"
                              onClick={() => updateQty(item.id, item.qty - 1)}
                              disabled={item.qty <= 1}
                              aria-label="-"
                            >
                              −
                            </button>
                            <span className="cart-page__qty-val">{item.qty}</span>
                            <button className="cart-page__qty-btn" onClick={() => updateQty(item.id, item.qty + 1)} aria-label="+">
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="cart-page__actions">
                        <button
                          className="cart-page__remove"
                          onClick={() => { setRemoving(item.id); setTimeout(() => remove(item.id), 200); }}
                          disabled={removing === item.id}
                          aria-label={isRtl ? 'إزالة' : 'Remove'}
                          title={isRtl ? 'إزالة من السلة' : 'Remove from cart'}
                        >
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          </svg>
                        </button>
                        <span className="cart-page__line-total">{fmt(Number(item.price) * Number(item.qty))}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            <motion.aside
              className="cart-page__summary"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
            >
              <h3 className="cart-page__summary-title">{isRtl ? 'ملخص الطلب' : 'Order Summary'}</h3>
              <div className="cart-page__row"><span>{isRtl ? 'المجموع الفرعي' : 'Subtotal'}</span><span>{fmt(subtotal)}</span></div>
              <div className="cart-page__row"><span>{isRtl ? 'الضريبة (VAT 15%)' : 'Tax (VAT 15%)'}</span><span>{fmt(tax)}</span></div>
              <div className="cart-page__row"><span>{isRtl ? 'الشحن' : 'Shipping'}</span><span>{isRtl ? 'مجاني' : 'Free'}</span></div>
              {savings > 0 && (
                <div className="cart-page__row cart-page__saved"><span>{isRtl ? 'وفّرت' : 'You saved'}</span><span>{fmt(savings)}</span></div>
              )}
              <div className="cart-page__row cart-page__row--lg"><span>{isRtl ? 'الإجمالي' : 'Total'}</span><span className="cart-page__row--total">{fmt(total)}</span></div>
              <button className="cart-page__cta" onClick={handleCheckout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                {isRtl ? 'إتمام الدفع' : 'Checkout'}
              </button>
              <p className="cart-page__pay-note">{isRtl ? 'دفع آمن ومشفّر — بطاقة بنكية أو USDT عبر Binance.' : 'Secure encrypted payment — card or USDT via Binance.'}</p>
            </motion.aside>
          </div>
        )}
      </div>
    </div>
  );
}