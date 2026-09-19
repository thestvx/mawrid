import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import DashIcon from './DashIcon';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone = 'primary',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const { dir } = useLanguage();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onCancel?.();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  const danger = tone === 'danger';

  return createPortal(
    <div className="d-modal" onMouseDown={() => (!busy ? onCancel?.() : null)}>
      <div className="d-modal__card" style={{ maxWidth: 440 }} onMouseDown={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: danger ? 'rgba(186,26,26,0.1)' : 'rgba(255,98,1,0.12)',
              color: danger ? 'var(--color-error)' : 'var(--color-primary)',
            }}
          >
            <DashIcon name={danger ? 'warn' : 'settings'} size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-on-surface)' }}>
              {title}
            </h3>
            {message && (
              <p style={{ margin: '6px 0 0', fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-secondary)' }}>
                {message}
              </p>
            )}
          </div>
          <button type="button" className="d-modal__close" onClick={onCancel} disabled={busy} aria-label="close">
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, borderTop: '1px solid var(--color-outline-variant)', paddingTop: 16 }}>
          <button type="button" className="d-actions__btn" onClick={onCancel} disabled={busy}>
            {cancelLabel || (dir === 'rtl' ? 'إلغاء' : 'Cancel')}
          </button>
          <button
            type="button"
            className={danger ? 'btn btn--primary d-btn-danger' : 'btn btn--primary'}
            style={danger ? { background: 'var(--color-error)', borderColor: 'var(--color-error)' } : undefined}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? (dir === 'rtl' ? 'جارٍ…' : 'Working…') : (confirmLabel || (dir === 'rtl' ? 'تأكيد' : 'Confirm'))}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
