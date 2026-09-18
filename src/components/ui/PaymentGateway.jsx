import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useCart } from '../../contexts/CartContext';
import './PaymentGateway.css';

const TOTAL_SECONDS = 119;

function cleanDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function group4(value) {
  return cleanDigits(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}

function cardType(number) {
  const first = cleanDigits(number).charAt(0);
  return first === '4' ? 'visa' : 'mastercard';
}

function formatClock(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return { m, s };
}

function ChipIcon() {
  return (
    <svg width="30" height="24" viewBox="0 0 30 24" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="28" height="22" rx="5" fill="#f3c866" />
      <path d="M9 1v22M15 1v22M21 1v22M1 8h28M1 16h28" stroke="#d9a93f" strokeWidth="1.6" />
      <rect x="9" y="8" width="12" height="8" fill="none" stroke="#c8952f" strokeWidth="1.4" />
      <path d="M11 1c-2.5 2-2.5 5 0 7M19 1c2.5 2 2.5 5 0 7" stroke="#ecc157" strokeWidth="1.2" />
    </svg>
  );
}

function ContactlessIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6.5 8.5a7 7 0 0 1 0 7M10 6.5a10.5 10.5 0 0 1 0 11M3.5 11a11 11 0 0 1 0 2" strokeLinecap="round" />
    </svg>
  );
}

export default function PaymentGateway({ onSubmit, processing = false, onClose }) {
  const { dir } = useLanguage();
  const rtl = dir === 'rtl';
  const tr = (ar, en) => (rtl ? ar : en);
  const { fmt, convert, currency } = useCurrency();
  const { items, tax, total } = useCart();

  const [cardNumber, setCardNumber] = useState('');
  const [cardholder, setCardholder] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [focused, setFocused] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');
  const [secs, setSecs] = useState(TOTAL_SECONDS);

  const orderNumber = useMemo(
    () => 'MWR-' + Date.now().toString(36).toUpperCase().slice(-6),
    []
  );

  useEffect(() => {
    const iv = setInterval(() => setSecs((s) => (s <= 1 ? TOTAL_SECONDS : s - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (processing) setStatus('loading');
    if (!processing && status === 'loading') setStatus('idle');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processing]);

  const clock = formatClock(secs);
  const brand = cardType(cardNumber);
  const maskLast4 = cleanDigits(cardNumber).slice(-4);
  const cardComplete = cleanDigits(cardNumber).length === 16;

  const lastFourParts = [
    { text: '••••', active: false },
    { text: '••••', active: false },
    { text: '••••', active: false },
    { text: maskLast4 || '••••', active: Boolean(maskLast4) },
  ];

  const productLabel = items[0]
    ? (rtl ? items[0].title_ar : items[0].title_en || items[0].title_ar)
    : tr('بطاقة رقمية', 'Digital card');

  const valid = () => {
    if (cleanDigits(cardNumber).length !== 16) return tr('أدخل رقم البطاقة المكوّن من 16 رقماً', 'Enter a valid 16-digit card number');
    if (cardholder.trim().length < 3) return tr('أدخل اسم حامل البطاقة', 'Enter the cardholder name');
    const m = parseInt(expMonth, 10);
    const y = parseInt(expYear, 10);
    if (!m || m < 1 || m > 12) return tr('أدخل شهر انتهاء صحيح', 'Enter a valid expiry month');
    if (!y || y < 20 || y > 99) return tr('أدخل سنة انتهاء صحيحة', 'Enter a valid expiry year');
    if (cleanDigits(cvv).length < 3) return tr('أدخل رمز الأمان (CVV)', 'Enter the CVV code');
    return '';
  };

  const handlePay = () => {
    if (status === 'loading') return;
    const err = valid();
    if (err) {
      setError(err);
      setStatus('error');
      window.setTimeout(() => setStatus('idle'), 2000);
      return;
    }
    setError('');
    setStatus('loading');
    window.setTimeout(() => onSubmit(), 1400);
  };

  const currencyMeta = {
    USD: { code: 'USD', decimals: 2 },
    EUR: { code: 'EUR', decimals: 2 },
    DZD: { code: 'دج', decimals: 0 },
  }[currency] || { code: 'USD', decimals: 2 };

  const convertedTotal = convert(total);
  const totalBody = convertedTotal.toLocaleString('en-US', {
    minimumFractionDigits: currencyMeta.decimals,
    maximumFractionDigits: currencyMeta.decimals,
  });

  return (
    <div className="mwp-overlay">
      <div className="mwp-backdrop" aria-hidden="true" />
      <div className="mwp-modal" role="dialog" aria-modal="true" aria-label={tr('بوابة الدفع', 'Payment Gateway')}>
        <header className="mwp-head">
          <div className="mwp-brand">
            <span className="mwp-brand__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" aria-hidden="true">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
                <path d="M6 15h4" />
              </svg>
            </span>
            <span className="mwp-brand__text">
              <span className="mwp-brand__name">{tr('مَورد', 'Mawrid')}</span>
              <span className="mwp-brand__sub">{tr('دفع آمن ومشفّر', 'Secure encrypted payment')}</span>
            </span>
          </div>

          <div className="mwp-timer" aria-label={tr('المتبقي من الجلسة', 'Session time left')}>
            <span className="mwp-timer__digit">{clock.m}</span>
            <span className="mwp-timer__sep">:</span>
            <span className="mwp-timer__digit">{clock.s}</span>
          </div>

          {onClose && (
            <button className="mwp-close" onClick={onClose} aria-label={tr('إغلاق', 'Close')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
                <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          )}
        </header>

        <div className="mwp-body">
          {/* ── Left — payment form ── */}
          <section className="mwp-form">
            <div className="mwp-field-input">
              <div className="mwp-field-head">
                <div>
                  <h3 className="mwp-label">{tr('رقم البطاقة', 'Card Number')}</h3>
                  <p className="mwp-hint">{tr('أدخل رقم البطاقة المكوّن من 16 رقماً', 'Enter the 16-digit card number on the card')}</p>
                </div>
              </div>
              <div className={`mwp-input ${focused === 'card' ? 'mwp-input--focus' : ''}`} data-complete={cardComplete ? 'true' : 'false'}>
                <span className={`mwp-brand-logo mwp-brand-logo--${brand}`}>
                  {brand === 'visa' ? <span className="mwp-visa-logo">VISA</span> : (
                    <span className="mwp-mc-logo">
                      <span className="mwp-mc-circle mwp-mc-circle--a" />
                      <span className="mwp-mc-circle mwp-mc-circle--b" />
                    </span>
                  )}
                </span>
                <input
                  className="mwp-field-input"
                  value={cardNumber}
                  placeholder="0000 0000 0000 0000"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  onFocus={() => setFocused('card')}
                  onBlur={() => setFocused('')}
                  onChange={(e) => setCardNumber(group4(e.target.value))}
                />
                {cardComplete && (
                  <span className="mwp-check">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                )}
              </div>
            </div>

            <div className="mwp-field-input">
              <div className="mwp-field-head">
                <h3 className="mwp-label">{tr('اسم حامل البطاقة', 'Card Holder Name')}</h3>
                <p className="mwp-hint">{tr('كما يظهر على البطاقة', 'Exactly as printed on the card')}</p>
              </div>
              <div className={`mwp-input ${focused === 'name' ? 'mwp-input--focus' : ''}`}>
                <input
                  className="mwp-field-input"
                  value={cardholder}
                  placeholder={tr('اسمك الكامل', 'Full name')}
                  autoComplete="cc-name"
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused('')}
                  onChange={(e) => setCardholder(e.target.value.slice(0, 40))}
                />
              </div>
            </div>

            <div className="mwp-cols">
              <div className="mwp-field-input">
                <div className="mwp-field-head">
                  <h3 className="mwp-label">{tr('تاريخ الانتهاء', 'Expiry Date')}</h3>
                </div>
                <div className="mwp-expiry">
                  <div className={`mwp-input mwp-input--exp ${focused === 'mon' ? 'mwp-input--focus' : ''}`}>
                    <input
                      className="mwp-field-input"
                      value={expMonth}
                      placeholder="MM"
                      inputMode="numeric"
                      aria-label={tr('الشهر', 'Month')}
                      onFocus={() => setFocused('mon')}
                      onBlur={() => setFocused('')}
                      onChange={(e) => setExpMonth(cleanDigits(e.target.value).slice(0, 2))}
                    />
                  </div>
                  <span className="mwp-expiry__sep">/</span>
                  <div className={`mwp-input mwp-input--exp mwp-input--exp-active ${focused === 'yr' ? 'mwp-input--focus' : ''}`}>
                    <input
                      className="mwp-field-input"
                      value={expYear}
                      placeholder="YY"
                      inputMode="numeric"
                      aria-label={tr('السنة', 'Year')}
                      onFocus={() => setFocused('yr')}
                      onBlur={() => setFocused('')}
                      onChange={(e) => setExpYear(cleanDigits(e.target.value).slice(0, 2))}
                    />
                  </div>
                </div>
              </div>

              <div className="mwp-field-input">
                <div className="mwp-field-head">
                  <h3 className="mwp-label">{tr('رمز الأمان', 'CVV')}</h3>
                  <p className="mwp-hint">{tr('3 أو 4 أرقام على ظهر البطاقة', '3 or 4 digits on the back')}</p>
                </div>
                <div className={`mwp-input ${focused === 'cvv' ? 'mwp-input--focus' : ''}`}>
                  <input
                    className="mwp-field-input"
                    value={cvv}
                    placeholder="•••"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    onFocus={() => setFocused('cvv')}
                    onBlur={() => setFocused('')}
                    onChange={(e) => setCvv(cleanDigits(e.target.value).slice(0, 4))}
                  />
                  <span className="mwp-input__cvv-note">{cvv ? '•'.repeat(cvv.length) : ''}</span>
                </div>
              </div>
            </div>

            <button
              className={`mwp-pay ${status === 'loading' ? 'mwp-pay--loading' : ''} ${status === 'error' ? 'mwp-pay--error' : ''}`}
              onClick={handlePay}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <>
                  <span className="mwp-pay__spinner" aria-hidden="true" />
                  {tr('جارٍ الدفع…', 'Processing…')}
                </>
              ) : (
                tr('ادفع الآن', 'Pay Now')
              )}
            </button>

            {error && <p className="mwp-error">{error}</p>}
          </section>

          {/* ── Right — card preview + order summary ── */}
          <aside className="mwp-side">
            <div className="mwp-card" data-type={brand} data-focus={focused}>
              <span className="mwp-card__sheen" aria-hidden="true" />
              <div className="mwp-card__top">
                <ChipIcon />
                <span className="mwp-card__contactless"><ContactlessIcon /></span>
              </div>

              <div className="mwp-card__mid">
                <div className="mwp-card__name">
                  {cardholder.trim() ? cardholder.toUpperCase() : tr('حامل البطاقة', 'CARDHOLDER')}
                </div>
                <div className="mwp-card__digits">
                  {lastFourParts.map((p, i) => (
                    <span key={i} className={p.active ? 'mwp-card__digit mwp-card__digit--active' : 'mwp-card__digit'}>
                      {p.text}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mwp-card__bottom">
                <div className="mwp-card__exp">
                  <span className="mwp-card__exp-label">EXP</span>
                  <span className="mwp-card__exp-value">
                    {(expMonth || '••')}/{expYear ? expYear.padStart(2, '0') : '••'}
                  </span>
                </div>
                <div className="mwp-card__net">
                  <span className="mwp-mc-logo">
                    <span className="mwp-mc-circle mwp-mc-circle--a" />
                    <span className="mwp-mc-circle mwp-mc-circle--b" />
                  </span>
                  <span className="mwp-card__wordmark">mastercard</span>
                </div>
              </div>
            </div>

            <div className="mwp-summary">
              <div className="mwp-summary__title">{tr('ملخص الطلب', 'Order summary')}</div>
              <div className="mwp-summary__row">
                <span className="mwp-summary__key">{tr('الشركة', 'Company')}</span>
                <span className="mwp-summary__val">{tr('مَورد', 'Mawrid')}</span>
              </div>
              <div className="mwp-summary__row">
                <span className="mwp-summary__key">{tr('رقم الطلب', 'Order Number')}</span>
                <span className="mwp-summary__val">{orderNumber}</span>
              </div>
              <div className="mwp-summary__row">
                <span className="mwp-summary__key">{tr('المنتج', 'Product')}</span>
                <span className="mwp-summary__val mwp-summary__val--truncate">{productLabel}</span>
              </div>
              <div className="mwp-summary__row">
                <span className="mwp-summary__key">{tr('الضريبة (15%)', 'VAT (15%)')}</span>
                <span className="mwp-summary__val">{fmt(tax)}</span>
              </div>
              <div className="mwp-summary__divider" />
              <div className="mwp-summary__pay">
                <div>
                  <span className="mwp-summary__due">{tr('عليك الدفع', 'You have to Pay')}</span>
                  <div className="mwp-summary__total">
                    <span className="mwp-summary__total-num">{totalBody}</span>
                    <span className="mwp-summary__total-cur">{currencyMeta.code}</span>
                  </div>
                </div>
                <span className="mwp-summary__rec">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" /><path d="M9 13h6M9 17h6" />
                  </svg>
                </span>
              </div>
            </div>
          </aside>
        </div>

        <footer className="mwp-foot">
          <span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            SSL 256-bit · Visa · Mastercard · USDT (BEP-20/TRC-20)
          </span>
          <span>{tr('عملية مشفّرة — بيانات بطاقتك لا تُخزَّن', 'Encrypted — your card data is never stored')}</span>
        </footer>
      </div>
    </div>
  );
}