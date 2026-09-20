import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { uploadToCloudinary, isCloudinaryConfigured } from '../../lib/cloudinary';
import './MediaPicker.css';

export default function MediaPicker({ open, value, onSelect, onClose, gallery = [] }) {
  const { dir } = useLanguage();
  const [tab, setTab] = useState('upload');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTab(value ? 'url' : 'upload');
      setUrl(value || '');
      setError('');
      setProgress(0);
    }
  }, [open, value]);

  if (!open) return null;

  const upload = async (file) => {
    if (!file) return;
    if (!/^image\//.test(file.type)) { setError(dir === 'rtl' ? 'يرجى اختيار صورة' : 'Please choose an image'); return; }
    setError(''); setBusy(true); setProgress(0);
    try {
      const { url: u } = await uploadToCloudinary(file, { onProgress: setProgress });
      onSelect(u);
      onClose();
    } catch (e) {
      setError(dir === 'rtl'
        ? (e.message === 'CLOUDINARY_NOT_CONFIGURED' ? 'الرفع غير مضبوط — جرّب لصق الرابط' : 'تعذّر الرفع')
        : (e.message === 'CLOUDINARY_NOT_CONFIGURED' ? 'Upload not configured — try pasting a URL' : 'Upload failed'));
    } finally { setBusy(false); }
  };

  const applyUrl = () => {
    if (url.trim()) { onSelect(url.trim()); onClose(); }
  };

  const items = (gallery || []).filter((g) => g && (g.thumbnail || g.image || g.url));

  return createPortal(
    <div className="mp-ovl" onPointerDown={(e) => e.stopPropagation()}>
      <div className="mp">
        <div className="mp__head">
          <h4>{dir === 'rtl' ? 'اختر صورة' : 'Choose an image'}</h4>
          <button type="button" className="mp__close" onClick={onClose}>✕</button>
        </div>
        <div className="mp__tabs">
          {[['upload', dir === 'rtl' ? 'رفع من جهازك' : 'Upload'], ['url', dir === 'rtl' ? 'رابط صورة' : 'By URL'], ['gallery', dir === 'rtl' ? 'من منتجاتي' : 'My products']].map(([k, label]) => (
            <button key={k} type="button" className={tab === k ? 'is-active' : ''} onClick={() => { setTab(k); setError(''); }}>
              {label}
            </button>
          ))}
        </div>
        <div className="mp__body">
          {tab === 'upload' && (
            <button type="button" className="mp__drop" onClick={() => inputRef.current?.click()} disabled={busy}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2" /><path d="M12 12v9" /><path d="m8 17 4 4 4-4" /></svg>
              <span>{busy ? `${dir === 'rtl' ? 'جارٍ الرفع' : 'Uploading'}… ${progress}%` : (dir === 'rtl' ? 'اضغط لاختيار صورة من جهازك' : 'Click to pick an image from your device')}</span>
              {!isCloudinaryConfigured && <em>{dir === 'rtl' ? 'الرفع غير مضبوط في هذا المشروع — استخدم تبويب الرابط' : 'Upload not configured — use the URL tab'}</em>}
            </button>
          )}
          {tab === 'url' && (
            <div className="mp__url">
              <input type="text" dir="ltr" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') applyUrl(); }} />
              <button type="button" className="mp__use" onClick={applyUrl}>{dir === 'rtl' ? 'استخدم' : 'Use'}</button>
            </div>
          )}
          {tab === 'gallery' && (
            items.length ? (
              <div className="mp__grid">
                {items.map((g, i) => {
                  const src = g.thumbnail || g.image || g.url;
                  return src ? <button key={`${g.id || 'g'}-${i}`} type="button" className="mp__thumb" onClick={() => { onSelect(src); onClose(); }}><img src={src} alt="" /></button> : null;
                })}
              </div>
            ) : (
              <p className="mp__empty">{dir === 'rtl' ? 'لا منتجات بعد لاختيار صور منها' : 'No products yet to pick images from'}</p>
            )
          )}
          {error && <span className="mp__error">{error}</span>}
        </div>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
    </div>,
    document.body
  );
}