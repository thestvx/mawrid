import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import PaymentGateway from '../components/ui/PaymentGateway';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const { dir } = useLanguage();
  const rtl = dir === 'rtl';
  const nav = useNavigate();
  const { count, clear } = useCart();
  const { isAuthenticated } = useAuth();

  const [processing, setProcessing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [ref, setRef] = useState('');

  const handlePaid = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 400));
    setRef('MWR-' + Date.now().toString(36).toUpperCase() + Math.floor(100 + Math.random() * 900));
    clear();
    setProcessing(false);
    setPlaced(true);
  };

  if (placed) {
    return (
      <div className="co-succ-overlay">
        <div className="co-succ-backdrop" aria-hidden="true" />
        <motion.div
          className="co-succ-card"
          initial={{ opacity: 0, y: 46, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        >
          <div className="co-succ-badge">
            <span className="co-succ-ring co-succ-ring--1" aria-hidden="true" />
            <span className="co-succ-ring co-succ-ring--2" aria-hidden="true" />
            <span className="co-succ-confetti co-succ-confetti--1" aria-hidden="true" />
            <span className="co-succ-confetti co-succ-confetti--2" aria-hidden="true" />
            <span className="co-succ-confetti co-succ-confetti--3" aria-hidden="true" />
            <span className="co-succ-confetti co-succ-confetti--4" aria-hidden="true" />
            <span className="co-succ-confetti co-succ-confetti--5" aria-hidden="true" />
            <motion.svg
              width="66"
              height="66"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.circle
                cx="12"
                cy="12"
                r="10"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
              <motion.path
                d="M8 12.4l2.6 2.6 5.4-5.6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.45, delay: 0.5, ease: 'easeInOut' }}
              />
            </motion.svg>
          </div>

          <motion.h2
            className="co-succ-title"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {rtl ? 'تم استلام طلبك بنجاح!' : 'Order received!'}
          </motion.h2>

          <motion.p
            className="co-succ-sub"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {rtl ? 'شكراً لثقتك بمَورد — تم تأكيد الدفع بنجاح.' : 'Thank you for trusting Mawrid — your payment has been confirmed.'}
          </motion.p>

          <motion.div
            className="co-succ-ref"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 320, damping: 20 }}
          >
            <span>{rtl ? 'رقم الطلب' : 'Order number'}</span>
            <strong>{ref}</strong>
          </motion.div>

          <motion.div
            className="co-succ-note"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>
              {rtl
                ? 'سيصلك تفعيل طلبك خلال أقل من 24 ساعة عبر بريدك الإلكتروني.'
                : 'Your order will be delivered to your email within less than 24 hours.'}
            </span>
          </motion.div>

          <motion.div
            className="co-succ-actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to="/dashboard/buyer" className="co-succ-btn co-succ-btn--primary">
              {rtl ? 'لوحة تحكمي' : 'My dashboard'}
            </Link>
            <Link to="/marketplace" className="co-succ-btn co-succ-btn--ghost">
              {rtl ? 'مواصلة التسوق' : 'Continue shopping'}
            </Link>
          </motion.div>
        </motion.div>
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
          <p>{rtl ? 'سيتم إعادتك إلى الصفحة بعد الدخول.' : 'You will return after signing in.'}</p>
          <Link to="/auth?mode=signin&next=/checkout" className="co-succ-btn co-succ-btn--primary">
            {rtl ? 'تسجيل الدخول' : 'Sign in'}
          </Link>
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
          <Link to="/marketplace" className="co-succ-btn co-succ-btn--primary">
            {rtl ? 'تصفح المتجر' : 'Browse marketplace'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PaymentGateway
      onSubmit={handlePaid}
      processing={processing}
      onClose={() => nav('/cart')}
    />
  );
}