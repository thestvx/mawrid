import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

const CONFETTI_COLORS = ['#ffffff', '#ffe3c7', '#ffd0a8', '#ffb37a', '#ff8a3d'];

export default function VerificationCelebration({ open, storeName, dir = 'rtl', onClose }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / 22;
        const distance = 118 + (i % 5) * 30;
        return {
          id: i,
          tx: `${Math.cos(angle) * distance}px`,
          ty: `${Math.sin(angle) * distance}px`,
          size: 6 + (i % 4) * 3,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          delay: 0.45 + (i % 7) * 0.05,
          duration: 0.95 + (i % 4) * 0.2,
          rotate: `${(i % 2 ? 1 : -1) * (140 + i * 14)}deg`,
        };
      }),
    []
  );

  const orbit = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        angle: i * 45,
        size: i % 2 ? 7 : 10,
        delay: -(i * 0.5),
      })),
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
        <span className="vcel__blob vcel__blob--a" />
        <span className="vcel__blob vcel__blob--b" />
        <span className="vcel__blob vcel__blob--c" />
        <span className="vcel__shimmer" />
      </div>

      <div className="vcel__card">
        <div className="vcel__stage" aria-hidden="true">
          <span className="vcel__halo" />
          <span className="vcel__ring vcel__ring--outer" />
          <span className="vcel__ring vcel__ring--inner" />

          <ul className="vcel__orbit">
            {orbit.map((d) => (
              <li
                key={d.id}
                style={{
                  width: d.size,
                  height: d.size,
                  margin: -d.size / 2,
                  transform: `rotate(${d.angle}deg) translateY(-96px)`,
                  animationDelay: `${d.delay}s`,
                }}
              />
            ))}
          </ul>

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

          <span className="vcel__disc">
            <span className="vcel__discInner">
              <span className="vcel__shine" />
              <img className="vcel__icon" src="/images/icons/success/successverification.png" alt="" />
            </span>
          </span>

          <span className="vcel__check">
            <svg viewBox="0 0 52 52" width="62" height="62" aria-hidden="true">
              <circle className="vcel__check-circle" cx="26" cy="26" r="23" />
              <path className="vcel__check-mark" d="M15 27.2l7.6 7.6L38.5 17" />
            </svg>
          </span>
        </div>

        <p className="vcel__eyebrow">{rtl ? 'مَورد · حساب موثّق' : 'Mawrid · Verified account'}</p>
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
