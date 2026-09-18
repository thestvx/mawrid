import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    <PaymentGateway
      onSubmit={handlePaid}
      processing={processing}
      onClose={() => nav('/cart')}
    />
  );
}