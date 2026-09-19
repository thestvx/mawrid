import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

const CONFETTI_COLORS = ['#ffffff', '#ffd7b8', '#ffe9d6', '#ffb37a', '#ff8a3d'];

export default function VerificationCelebration({ open, storeName, dir = 'rtl', onClose }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / 18;
        const distance = 130 + (i % 5) * 34;
        return {
          id: i,
          tx: `${Math.cos(angle) * distance}px`,
          ty: `${Math.sin(angle) * distance}px`,
          size: 6 + (i % 4) * 3,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          delay: 0.35 + (i % 6) * 0.05,
          duration: 0.9 + (i % 4) * 0.18,
          rotate: `${(i % 2 ? 1 : -1) * (120 + i * 12)}deg`,
        };
      }),
    []
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const rtl = dir === 'rtl';

  return createPortal(
    <div className="vcel" role="dialog" aria-modal="true" aria-label={rtl ? 'تم توثيق حسابك' : 'Account verified'}>
      <div className="vcel__bg" aria-hidden="true">
        <span className="vcel__beam vcel__beam--1" />
        <span className="vcel__beam vcel__beam--2" />
        <span className="vcel__beam vcel__beam--3" />
      </div>

      <div className="vcel__card">
        <div className="vcel__ring">
          <span className="vcel__pulse" />
          <span className="vcel__pulse vcel__pulse--2" />
          <span className="vcel__burst">
            {particles.map((p) => (
              <i
                key={p.id}
                style={{
                  '--tx': p.tx,
                  '--ty': p.ty,
                  '--rot': p.rotate,
                  width: p.size,
                  height: p.size,
                  background: p.color,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                }}
              />
            ))}
          </span>
          <span className="vcel__circle">
            <img src="/images/icons/success/successverification.png" alt="" className="vcel__icon" />
          </span>
          <span className="vcel__check">
            <svg viewBox="0 0 52 52" width="46" height="46" aria-hidden="true">
              <circle className="vcel__check-circle" cx="26" cy="26" r="23" />
              <path className="vcel__check-mark" d="M14.5 27.2l7.6 7.6L38 16.5" />
            </svg>
          </span>
        </div>

        <h2 className="vcel__title">
          {rtl ? 'تم تأكيد توثيقك كبائع في مَورد' : 'Your Mawrid seller account is verified'}
        </h2>
        <p className="vcel__text">
          {rtl
            ? `${storeName ? `${storeName}، ` : ''}أصبح حسابك موثّقاً الآن. يمكنك نشر متجرك ومنتجاتك والبدء باستقبال طلبات العملاء بثقة.`
            : `${storeName ? `${storeName}, ` : ''}your account is now verified. Publish your store and products and start receiving customer orders with confidence.`}
        </p>

        <button type="button" className="vcel__btn" onClick={onClose}>
          {rtl ? 'ابدأ الآن' : 'Get started'}
        </button>
      </div>
    </div>,
    document.body
  );
}
