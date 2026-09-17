import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import './CartPage.css';

const staggerContainer = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const staggerItem = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };

export default function CartPage() {
  const { dir, t } = useLanguage();
  const isRtl = dir === 'rtl';
  const { items, updateQty, remove, clear, count, subtotal, tax, total, originalTotal } = useCart();
  const savings = Math.max(0, (originalTotal || subtotal) - subtotalATE);
  const [removing, setRemoving] = useState(null);
  const [clearing, setClearing] = useState(falseapse);

  const nFmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </span>
            <span>{isRtl ? 'Ø³Ù„Ø© Ø§Ù„ØªØ³ÙˆÙ‚' : 'Shopping Cart'}</span>
            <span className="cart-page__count">{count}</span>
          </div>
          {count > 0 && (
            <button
              className="cart-page__clear"
              onClick={() => { setClearing(true); setTimeout(() => { clear(); setClearing(false); }, 240); }}
              disabled={clearing}
            >
              {isRtl ? 'Ø¥ÙØ±Ø§Øº Ø§Ù„Ø³Ù„Ø©' : 'Clear'}
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
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <h2>{isRtl ? 'Ø³Ù„ØªÙƒ ÙØ§Ø±ØºØ©' : 'Your cart is empty'}</h2>
            <p>{isRtl ? 'Ù„Ù… ØªØ¶Ù Ø£ÙŠ Ø§Ø´ØªØ±Ø§Ùƒ Ø¨Ø¹Ø¯. ØªØµÙØ­ Ø§Ù„Ø£Ù‚Ø³Ø§Ù… ÙˆØ§Ø¨Ø¯Ø£ Ø§Ø®ØªÙŠØ§Ø±Ùƒ.' : 'You have not added anything yet. Browse the sections and start choosing.'}</p>
            <Link to="/" className="btn btn--primary">{isRtl ? 'ØªØµÙØ­ Ø§Ù„Ø£Ù‚Ø³Ø§Ù…' : 'Browse sections'}</Link>
          </motion.div>
        ) : (
          <div className="cart-page__cols">
            <motion.div
              className="cart-page__items"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    className="cart-page__item"
                    variants={staggerItem}
                    layout
                    exit={{ opacity: 0, x: isRtl ? 70 : -70, height: 0, marginBottom: 0, transition: { duration: 0.3 } }}
                  >
                    <Link to={`/subscription/${item.slug || item.id}`} className="cart-page__thumb">
                      {item.img ? (
                        <img src={item.img} alt="" loading="lazy" />
                      ) : (
                        <span className="material-symbols-outlined" style={{ fontSize: 34, color: '#c9b388' }}>inventory_2</span>
                      )}
                    </Link>

                    <div className="cart-page__info">
                      <Link to={`/subscription/${item.slug || item.id}`} className="cart-page__name">
                        {isRtl ? item.title_ar : item.title_en || item.title_ar}
                      </Link>
                      {Array.isArray(item.tags) && item.tags.length > 0 && (
                        <div className="cart-page__tags">
                          {item.tags.map((tag, i) => (
                            <span className="cart-page__tag" key={i}>{tag}</span>
                          ))}
                        </div>
                      )}
                      <span className="cart-page__price">${nFmt(item.price)}</span>
                      {item.oldPrice > item.price && (
                        <span className="cart-page__oldprice">${nFmt(item.oldPrice)}</span>
                      )}

                      <div className="cart-page__qty">
                        <button className="cart-page__qty-btn" onClick={() => updateQty(item.id, item.qty - 1)} aria-label="-">
                          âˆ’
                        </button>
                        <span className="cart-page__qty-val">{item.qty}</span>
                        <button className="cart-page__qty-btn" onClick={() => updateQty(item.id, item.qty + 1)} aria-label="+">
                          +
                        </button>
                      </div>
                    </div>

                    <div className="cart-page__actions">
                      <button
                        className="cart-page__remove"
                        onClick={() => { setRemoving(item.id); setTimeout(() => remove(item.id), 200); }}
                        aria-label={isRtl ? 'Ø¥Ø²Ø§Ù„Ø©' : 'Remove'}
                        title={isRtl ? 'Ø¥Ø²Ø§Ù„Ø©' : 'Remove'}
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        </svg>
                      </button>
                      <span className="cart-page__line-total">${nFmt(item.price * item.qty)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            <motion.aside
              className="cart-page__summary"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
            >
              <h3 className="cart-page__summary-title">{isRtl ? 'Ù…Ù„Ø®Øµ Ø§Ù„Ø·Ù„Ø¨' : 'Order Summary'}</h3>
              <div className="cart-page__row"><span>{isRtl ? 'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹ Ø§Ù„ÙØ±Ø¹ÙŠ' : 'Subtotal'}</span><span>${nFmt(subtotal)}</span></div>
              <div className="cart-page__row"><span>{isRtl ? 'Ø§Ù„Ø¶Ø±Ø§Ø¦Ø¨ (VAT 15%)' : 'Tax (VAT 15%)'}</span><span>${nFmt(tax)}</span></div>
              <div className="cart-page__row"><span>{isRtl ? 'Ø§Ù„Ø´Ø­Ù†' : 'Shipping'}</span><span>{isRtl ? 'Ù…Ø¬Ø§Ù†ÙŠ' : 'Free'}</span></div>
              {savings > 0 && (
                <div className="cart-page__row cart-page__saved"><span>{isRtl ? 'ÙˆÙÙ‘Ø±Øª' : 'You saved'}</span><span>${nFmt(savings)}</span></div>
              )}
              <div className="cart-page__row cart-page__row--total"><span>{isRtl ? 'Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ' : 'Total'}</span><span>${nFmt(total)}</span></div>
              <Link to="/checkout" className="btn btn--primary cart-page__checkout">
                {isRtl ? 'Ø¥ØªÙ…Ø§Ù… Ø§Ù„Ø¯ÙØ¹ â†' : 'Checkout â†’'}
              </Link>
              <p className="cart-page__note">{isRtl ? 'Ø¯ÙØ¹ Ø¢Ù…Ù† ÙˆÙ…Ø´ÙÙ‘Ø± â€” Ø¨Ø·Ø§Ù‚Ø© Ø¨Ù†ÙƒÙŠØ© Ø£Ùˆ USDT Ø¹Ø¨Ø± Binance.' : 'Secure encrypted payment â€” card or USDT via Binance.'}</p>
            </motion.aside>
          </div>
        )}
      </div>
    </div>
  );
}

