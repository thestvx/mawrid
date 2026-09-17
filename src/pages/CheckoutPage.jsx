import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import CreditCardForm from '../components/ui/CreditCardForm';
import './CheckoutPage.css';

const nF2 = (n) => Number(n).toFixed(2);

export default function CheckoutPage() {
  const { dir } = useLanguage();
  const rtl = dir === 'rtl';
  const nav = useNavigate();
  const { items, subtotal, tax, total, count, clear } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [processing, setProcessing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [ref, setRef] = useState('');

  const handlePaid = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setRef('MWR-' + Date.now().toString(36).toUpperCase() + Math.floor(100 + Math.random() * 900));
    clear();
    setProcessing(false);
    setPlaced(true);
  };

  if (placed) {
    return (
      <div className="checkout-page">
        <div className="checkout-page__glow checkout-page__glow--1" aria-hidden="true" />
        <div className="checkout-page__glow checkout-page__glow--2" aria-hidden="true" />
        <div className="checkout-page__box checkout-page__box--ok">
          <span className="checkout-page__ok">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
              <circle cx="12" cy="12" r="10" /><path d="M8 12.4l2.6 2.6 5.4-5.6" />
            </svg>
          </span>
          <h2>{rtl ? 'تم استلام طلبك!' : 'Order received!'}</h2>
          <p>{rtl ? 'شكراً لثقتك بمَورد. تم تأكيد الدفع — سيصلك التفعيل والفواتير على بريدك خلال دقائق.' : 'Thank you for trusting Mawrid. Payment confirmed — your activation and receipt are coming to your inbox within minutes.'}</p>
          <span className="checkout-page__ref">{ref}</span>
          <div className="checkout-page__row">
            <Link to="/dashboard/buyer" className="btn btn--primary">{rtl ? 'لوحة تحكمي' : 'My dashboard'}</Link>
            <Link to="/marketplace" className="btn btn--ghost">{rtl ? 'مواصلة التسوق' : 'Continue shopping'}</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="checkout-page">
        <div className="checkout-page__glow checkout-page__glow--1" aria-hidden="true" />
        <div className="checkout-page__glow checkout-page__glow--2" aria-hidden="true" />
        <div className="checkout-page__box checkout-page__box--auth">
          <span className="checkout-page__lock">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </span>
          <h2>{rtl ? 'سجّل دخولك للمتابعة' : 'Sign in to continue'}</h2>
          <p>{rtl ? 'سيتم إعادتك إلى الشيك أوت بعد الدخول.' : 'You will return to checkout after signing in.'}</p>
          <Link to="/auth?mode=signin&next=/checkout" className="btn btn--primary">{rtl ? 'تسجيل الدخول' : 'Sign in'}</Link>
        </div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-page__glow checkout-page__glow--1" aria-hidden="true" />
        <div className="checkout-page__glow checkout-page__glow--2" aria-hidden="true" />
        <div className="checkout-page__box checkout-page__box--empty">
          <span className="checkout-page__empty-icon">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </span>
          <h2>{rtl ? 'سلتك فارغة' : 'Your cart is empty'}</h2>
          <p>{rtl ? 'أضف منتجات قبل إتمام الدفع.' : 'Add items before checking out.'}</p>
          <Link to="/marketplace" className="btn btn--primary">{rtl ? 'تصفح المتجر' : 'Browse marketplace'}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-page__glow checkout-page__glow--1" aria-hidden="true" />
      <div className="checkout-page__glow checkout-page__glow--2" aria-hidden="true" />

      <div className="checkout-page__layout">
        <motion.header className="checkout-page__head" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <span className="checkout-page__head-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
            </svg>
          </span>
          <div>
            <h2>{rtl ? 'إتمام الطلب' : 'Secure Checkout'}</h2>
            <p>{rtl ? 'بوابة دفع آمنة ومشفرة — بطاقة بنكية أو USDT عبر Binance.' : 'Secure encrypted gateway — bank card or USDT via Binance.'}</p>
          </div>
        </motion.header>

        <div className="checkout-page__cols">
          <motion.section className="checkout-page__box checkout-page__box--pay" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}>
            <CreditCardForm onSubmit={handlePaid} disabled={processing} />
            {processing && (
              <p className="checkout-page__processing">
                <span className="checkout-page__spinner" aria-hidden="true" />
                {rtl ? 'جارٍ تأكيد الدفع…' : 'Confirming payment…'}
              </p>
            )}
          </motion.section>

          <motion.aside className="checkout-page__box checkout-page__box--summary" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.16 }}>
            <h3 className="checkout-page__summary-title">{rtl ? 'ملخص الطلب' : 'Order Summary'}</h3>
            <div className="checkout-page__lines">
              {items.map((i) => (
                <div className="checkout-page__line" key={i.id}>
                  <span className="checkout-page__line-name">{rtl ? i.title_ar : i.title_en || i.title_ar}</span>
                  <span className="checkout-page__line-qty">× {i.qty}</span>
                  <span className="checkout-page__line-price">${nF2(Number(i.price) * Number(i.qty))}</span>
                </div>
              ))}
            </div>
            <div className="checkout-page__row"><span>{rtl ? 'المجموع الفرعي' : 'Subtotal'}</span><span>${nF2(subtotal)}</span></div>
            <div className="checkout-page__row"><span>{rtl ? 'الضريبة (VAT 15%)' : 'Tax (VAT 15%)'}</span><span>${nF2(tax)}</span></div>
            <div className="checkout-page__row"><span>{rtl ? 'الشحن' : 'Shipping'}</span><span>{rtl ? 'مجاني' : 'Free'}</span></div>
            <div className="checkout-page__row checkout-page__row--total"><span>{rtl ? 'الإجمالي' : 'Total'}</span><span>${nF2(total)}</span></div>
            <p className="checkout-page__note">{rtl ? `سيتم تسليم منتجاتك الرقمية إلى ${user?.email || ''}` : `Your digital products will be delivered to ${user?.email || ''}`}</p>
          </motion.aside>
        </div>

        <div className="checkout-page__foot">
          <span className="checkout-page__secure">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {rtl ? 'تشفير SSL 256-bit · PCI-DSS · Visa · Mastercard · USDT (BEP-20/TRC-20)' : '256-bit SSL · PCI-DSS · Visa · Mastercard · USDT (BEP-20/TRC-20)'}
          </span>
          <span>·</span>
          <span>{rtl ? 'دفع آمن' : 'Secure payment'}</span>
        </div>
      </div>
    </div>
  );
}
