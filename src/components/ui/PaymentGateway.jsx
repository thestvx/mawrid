import { useEffect, useMemo, useRef, useState } from 'react';
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
  if (first === '4') return 'visa';
  if (first === '5' || first === '2') return 'mastercard';
  return 'mastercard';
}

function formatClock(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return { m, s };
}

function KeypadIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="6" cy="5" r="1.4" /><circle cx="12" cy="5" r="1.4" /><circle cx="18" cy="5" r="1.4" />
      <circle cx="6" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="18" cy="12" r="1.4" />
      <circle cx="6" cy="19" r="1.4" /><circle cx="12" cy="19" r="1.4" /><circle cx="18" cy="19" r="1.4" />
    </svg>
  );
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
  const { fmt, currency } = useCurrency();
  const { items, tax, total } = useCart();

  const [cardNumber, setCardNumber] = useState('2412 7512 3412 3456');
  const cardholder = 'Jonathan Michael';
  const [cvv, setCvv] = useState('327');
  const [expMonth, setExpMonth] = useState('09');
  const [expYear, setExpYear] = useState('22');
  const [password, setPassword] = useState('1234');
  const [focused, setFocused] = useState('');
  const [editable, setEditable] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');
  const [secs, setSecs] = useState(TOTAL_SECONDS);
  const inputRef = useRef(null);

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
  const maskLast4 = cleanDigits(cardNumber).slice(-4) || '3456';

  const lastFourParts = [
    { text: '••••', active: false },
    { text: '••••', active: false },
    { text: '••••', active: false },
    { text: maskLast4, active: true },
  ];

  const productLabel = items[0]
    ? (rtl ? items[0].title_ar : items[0].title_en || items[0].title_ar)
    : tr('بطاقة رقمية', 'Digital card');

  const valid = () => {
    const num = cleanDigits(cardNumber);
    if (num.length !== 16) return tr('أدخل 16 رقماً صحيحاً', 'Enter a valid 16-digit card number');
    if (cleanDigits(cvv).length < 3) return tr('أدخل رمز أمان صحيح', 'Enter a valid CVV');
    const m = parseInt(expMonth, 10);
    const y = parseInt(expYear, 10);
    if (!m || m < 1 || m > 12) return tr('أدخل شهر انتهاء صحيح', 'Enter a valid expiry month');
    if (!y || y < 21 || y > 99) return tr('أدخل سنة انتهاء صحيحة', 'Enter a valid expiry year');
    if (password.trim().length < 4) return tr('أدخل كلمة المرور الديناميكية', 'Enter your dynamic password');
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
    window.setTimeout(() => {
      onSubmit();
    }, 1400);
  };

  const toggleEdit = () => {
    setEditable((v) => !v);
    setError('');
    if (!editable && inputRef.current) {
      window.setTimeout(() => inputRef.current.focus(), 50);
    }
  };

  const totalParts = (() => {
    const num = Number(total);
    const cur = currency;
    const decimals = cur === 'DZD' ? 0 : 2;
    const body = num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    return { body, code: cur === 'DZD' ? 'دج' : cur };
  })();

  return (
    <div className="acp-overlay">
      <div className="acp-backdrop" aria-hidden="true" />
      <div className="acp-modal" role="dialog" aria-modal="true" aria-label={tr('بوابة الدفع', 'Payment Gateway')}>
        <header className="acp-head">
          <div className="acp-brand">
            <span className="acp-brand__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </span>
            <span className="acp-brand__name">AceCoin<span>Pay</span></span>
          </div>

          <div className="acp-timer" aria-label={tr('المتبقي من الجلسة', 'Session time left')}>
            <span className="acp-timer__digit">{clock.m}</span>
            <span className="acp-timer__sep">:</span>
            <span className="acp-timer__digit">{clock.s}</span>
          </div>

          {onClose && (
            <button className="acp-close" onClick={onClose} aria-label={tr('إغلاق', 'Close')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
                <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          )}
        </header>

        <div className="acp-body">
          {/* ── Left — payment form ── */}
          <section className="acp-form">
            <div className="acp-field-head">
              <div>
                <h3 className="acp-label">{tr('رقم البطاقة', 'Card Number')}</h3>
                <p className="acp-hint">{tr('أدخل رقم البطاقة المكوّن من 16 رقماً', 'Enter the 16-digit card number on the card')}</p>
              </div>
              <button className={`acp-edit ${editable ? 'acp-edit--on' : ''}`} onClick={toggleEdit} aria-pressed={editable}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
                {tr('تعديل', 'Edit')}
              </button>
            </div>

            <div className={`acp-input acp-input--card ${focused === 'card' ? 'acp-input--focus' : ''}`}>
              <span className={`acp-brand-logo acp-brand-logo--${brand}`}>
                {brand === 'visa' ? <span className="acp-visa-logo">VISA</span> : (
                  <span className="acp-mc-logo">
                    <span className="acp-mc-circle acp-mc-circle--a" />
                    <span className="acp-mc-circle acp-mc-circle--b" />
                  </span>
                )}
              </span>
              <input
                ref={inputRef}
                className="acp-field"
                value={cardNumber}
                readOnly={!editable}
                inputMode="numeric"
                autoComplete="cc-number"
                onFocus={() => setFocused('card')}
                onBlur={() => setFocused('')}
                onChange={(e) => setCardNumber(group4(e.target.value))}
              />
              <span className="acp-check">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
            </div>

            <div className="acp-row">
              <div className="acp-field-head acp-field-head--cvv">
                <div>
                  <h3 className="acp-label">{tr('رقم CVV', 'CVV Number')}</h3>
                  <p className="acp-hint">{tr('أدخل رقم الأمان المكوّن من 3 أو 4 أرقام', 'Enter the 3 or 4 digit number on the card')}</p>
                </div>
              </div>

              <div className={`acp-input acp-input--cvv ${focused === 'cvv' ? 'acp-input--focus' : ''}`}>
                <input
                  className="acp-field"
                  value={cvv}
                  readOnly={!editable}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  onFocus={() => setFocused('cvv')}
                  onBlur={() => setFocused('')}
                  onChange={(e) => setCvv(cleanDigits(e.target.value).slice(0, 4))}
                />
                <span className="acp-input__icon"><KeypadIcon /></span>
              </div>
            </div>

            <div className="acp-row">
              <div className="acp-field-head">
                <div>
                  <h3 className="acp-label">{tr('تاريخ الانتهاء', 'Expiry Date')}</h3>
                  <p className="acp-hint">{tr('أدخل تاريخ انتهاء البطاقة', 'Enter the expiration date of the card')}</p>
                </div>
              </div>

              <div className="acp-expiry">
                <div className={`acp-input acp-input--exp ${focused === 'mon' ? 'acp-input--focus' : ''}`}>
                  <input
                    className="acp-field"
                    value={expMonth}
                    readOnly={!editable}
                    inputMode="numeric"
                    aria-label={tr('الشهر', 'Month')}
                    onFocus={() => setFocused('mon')}
                    onBlur={() => setFocused('')}
                    onChange={(e) => setExpMonth(cleanDigits(e.target.value).slice(0, 2))}
                  />
                </div>
                <span className="acp-expiry__sep">/</span>
                <div className={`acp-input acp-input--exp acp-input--exp-active ${focused === 'yr' ? 'acp-input--focus' : ''}`}>
                  <input
                    className="acp-field"
                    value={expYear}
                    readOnly={!editable}
                    inputMode="numeric"
                    aria-label={tr('السنة', 'Year')}
                    onFocus={() => setFocused('yr')}
                    onBlur={() => setFocused('')}
                    onChange={(e) => setExpYear(cleanDigits(e.target.value).slice(0, 2))}
                  />
                </div>
              </div>
            </div>

            <div className="acp-row">
              <div className="acp-field-head">
                <div>
                  <h3 className="acp-label">{tr('كلمة المرور', 'Password')}</h3>
                  <p className="acp-hint">{tr('أدخل كلمة المرور الديناميكية', 'Enter your Dynamic password')}</p>
                </div>
              </div>

              <div className={`acp-input acp-input--pwd ${focused === 'pwd' ? 'acp-input--focus' : ''}`}>
                <input
                  className="acp-field"
                  type="password"
                  value={password}
                  readOnly={!editable}
                  autoComplete="off"
                  onFocus={() => setFocused('pwd')}
                  onBlur={() => setFocused('')}
                  onChange={(e) => setPassword(e.target.value.slice(0, 12))}
                />
                <span className="acp-input__icon"><KeypadIcon /></span>
              </div>
            </div>

            <button
              className={`acp-pay ${status === 'loading' ? 'acp-pay--loading' : ''} ${status === 'error' ? 'acp-pay--error' : ''}`}
              onClick={handlePay}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <>
                  <span className="acp-pay__spinner" aria-hidden="true" />
                  {tr('جارٍ الدفع…', 'Processing…')}
                </>
              ) : (
                tr('ادفع الآن', 'Pay Now')
              )}
            </button>

            {error && <p className="acp-error">{error}</p>}
          </section>

          {/* ── Right — card preview + order summary ── */}
          <aside className="acp-side">
            <div className="acp-card" data-type={brand}>
              <div className="acp-card__grain" aria-hidden="true" />
              <div className="acp-card__top">
                <ChipIcon />
                <span className="acp-card__contactless"><ContactlessIcon /></span>
              </div>

              <div className="acp-card__mid">
                <div className="acp-card__name">{cardholder || tr('حامل البطاقة', 'Card Holder')}</div>
                <div className="acp-card__digits">
                  {lastFourParts.map((p, i) => (
                    <span key={i} className={p.active ? 'acp-card__digit acp-card__digit--active' : 'acp-card__digit'}>
                      {p.text}
                    </span>
                  ))}
                </div>
              </div>

              <div className="acp-card__bottom">
                <div className="acp-card__exp">
                  <span className="acp-card__exp-label">{tr('الانتهاء', 'EXP')}</span>
                  <span className="acp-card__exp-value">{expMonth || '••'}/{expYear || '••'}</span>
                </div>
                <div className="acp-card__net">
                  <span className="acp-mc-logo">
                    <span className="acp-mc-circle acp-mc-circle--a" />
                    <span className="acp-mc-circle acp-mc-circle--b" />
                  </span>
                  <span className="acp-card__wordmark">mastercard</span>
                </div>
              </div>
            </div>

            <div className="acp-summary">
              <div className="acp-summary__row">
                <span className="acp-summary__key">{tr('الشركة', 'Company')}</span>
                <span className="acp-summary__val">{tr('مَورد', 'Mawrid')}</span>
              </div>
              <div className="acp-summary__row">
                <span className="acp-summary__key">{tr('رقم الطلب', 'Order Number')}</span>
                <span className="acp-summary__val">{orderNumber}</span>
              </div>
              <div className="acp-summary__row">
                <span className="acp-summary__key">{tr('المنتج', 'Product')}</span>
                <span className="acp-summary__val acp-summary__val--truncate">{productLabel}</span>
              </div>
              <div className="acp-summary__row">
                <span className="acp-summary__key">{tr('الضريبة (15%)', 'VAT (15%)')}</span>
                <span className="acp-summary__val">{fmt(tax)}</span>
              </div>
              <div className="acp-summary__divider" />
              <div className="acp-summary__pay">
                <div>
                  <span className="acp-summary__due">{tr('عليك الدفع', 'You have to Pay')}</span>
                  <div className="acp-summary__total">
                    <span className="acp-summary__total-num">{totalParts.body}</span>
                    <span className="acp-summary__total-cur">{totalParts.code}</span>
                  </div>
                </div>
                <span className="acp-summary__rec">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" /><path d="M9 13h6M9 17h6" />
                  </svg>
                </span>
              </div>
            </div>
          </aside>
        </div>

        <footer className="acp-foot">
          <span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {tr('SSL 256-bit · Visa · Mastercard · USDT (BEP-20/TRC-20)', '256-bit SSL · Visa · Mastercard · USDT (BEP-20/TRC-20)')}
          </span>
          <span>{tr('واجهة توضيحية — لا تُخزَّن بيانات البطاقة', 'Demo UI — card data is never stored')}</span>
        </footer>
      </div>
    </div>
  );
}