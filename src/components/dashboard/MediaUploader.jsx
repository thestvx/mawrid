import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { uploadToCloudinary, isCloudinaryConfigured } from '../../lib/cloudinary';

function CloudIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2" />
      <path d="M12 12v9" />
      <path d="m8 17 4 4 4-4" />
    </svg>
  );
}

function errLabel(message, dir) {
  if (message === 'CLOUDINARY_NOT_CONFIGURED') {
    return dir === 'rtl' ? 'كلاوديناري غير مضبوط' : 'Cloudinary not configured';
  }
  if (message === 'NETWORK') {
    return dir === 'rtl' ? 'خطأ في الشبكة أثناء الرفع' : 'Network error while uploading';
  }
  return message;
}

const BOX_W = 520;

function ImageCropModal({ src, aspect, output, onCancel, onSave }) {
  const { dir } = useLanguage();
  const imgRef = useRef(null);
  const [metrics, setMetrics] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const savingRef = useRef(false);

  const boxH = Math.round(BOX_W / aspect);
  const scaledW = metrics ? metrics.iw * metrics.base * zoom : BOX_W;
  const scaledH = metrics ? metrics.ih * metrics.base * zoom : boxH;

  const clampPan = (z, p) => {
    if (!metrics) return { x: 0, y: 0 };
    const sw = metrics.iw * metrics.base * z;
    const sh = metrics.ih * metrics.base * z;
    const mx = Math.max(0, (sw - BOX_W) / 2);
    const my = Math.max(0, (sh - boxH) / 2);
    return { x: Math.max(-mx, Math.min(mx, p.x)), y: Math.max(-my, Math.min(my, p.y)) };
  };

  const setZoomClamped = (z) => {
    const nz = Math.max(1, Math.min(4, z));
    setZoom(nz);
    setPan((p) => clampPan(nz, p));
  };

  const onImgLoad = () => {
    const el = imgRef.current;
    if (!el) return;
    const iw = el.naturalWidth;
    const ih = el.naturalHeight;
    const base = Math.max(BOX_W / iw, boxH / ih);
    setMetrics({ iw, ih, base });
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const onDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    setDragging(true);
  };

  const onMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan(() => clampPan(zoom, { x: dragStart.current.px + dx, y: dragStart.current.py + dy }));
  };

  const onUp = (e) => {
    setDragging(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const onWheel = (e) => {
    e.preventDefault();
    setZoomClamped(zoom - Math.sign(e.deltaY) * 0.08);
  };

  const save = () => {
    if (!metrics || savingRef.current) return;
    savingRef.current = true;
    const { iw, ih, base } = metrics;
    const swScaled = iw * base * zoom;
    const shScaled = ih * base * zoom;
    const ox = (swScaled - BOX_W) / 2 - pan.x;
    const oy = (shScaled - boxH) / 2 - pan.y;
    const sx = Math.max(0, ox) * (iw / swScaled);
    const sy = Math.max(0, oy) * (ih / shScaled);
    const sw = Math.max(1, BOX_W * (iw / swScaled));
    const sh = Math.max(1, boxH * (ih / shScaled));
    const canvas = document.createElement('canvas');
    canvas.width = output.w;
    canvas.height = output.h;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, output.w, output.h);
    canvas.toBlob((blob) => {
      savingRef.current = false;
      if (blob) onSave(blob);
      else onCancel();
    }, 'image/jpeg', 0.92);
  };

  return createPortal(
    <div className="crop-ovl" onPointerDown={(e) => e.stopPropagation()}>
      <div className="crop-modal">
        <div className="crop-modal__head">
          <h4>{dir === 'rtl' ? 'قصّ الصورة واضبطها' : 'Crop & adjust'}</h4>
          <button className="d-modal__close" onClick={onCancel} >✕</button>
        </div>
        <div className="crop-stage">
          <div
            className="crop-box"
            style={{ aspectRatio: `${aspect} / 1` }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onWheel={onWheel}
          >
            {!metrics && <span className="crop-box__load">{dir === 'rtl' ? 'جارٍ التحميل…' : 'Loading…'}</span>}
            <img
              ref={imgRef}
              src={src}
              alt=""
              draggable={false}
              onLoad={onImgLoad}
              style={{
                width: scaledW,
                height: scaledH,
                transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px)`,
              }}
            />
            <div className="crop-grid" />
          </div>
        </div>
        <div className="crop-tools">
          <span className="crop-tools__label">{dir === 'rtl' ? 'تقريب' : 'Zoom'}</span>
          <input
            type="range"
            min="1"
            max="4"
            step="0.01"
            value={zoom}
            onChange={(e) => setZoomClamped(parseFloat(e.target.value))}
            aria-label={dir === 'rtl' ? 'التقريب' : 'Zoom'}
          />
          <button type="button" className="crop-reset" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
            {dir === 'rtl' ? 'إعادة' : 'Reset'}
          </button>
        </div>
        <p className="crop-hint">
          {dir === 'rtl' ? 'اسحب الصورة للمعاينة، واستخدم شريط التقريب للتكبير ثم اضغط تطبيق.' : 'Drag to reposition, use the slider to zoom, then apply.'}
        </p>
        <div className="crop-modal__foot">
          <button type="button" className="d-actions__btn" onClick={onCancel}>
            {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
          </button>
          <button type="button" className="btn btn--primary" onClick={save}>
            {dir === 'rtl' ? 'تطبيق القصّ' : 'Apply crop'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ImageField({ label, value, onChange, crop }) {
  const { dir } = useLanguage();
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [cropSrc, setCropSrc] = useState(null);
  const inputRef = useRef(null);
  const previewUrlRef = useRef(null);

  const closeCrop = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setCropSrc(null);
  };

  const uploadCropped = async (blob) => {
    setError('');
    setProgress(0);
    try {
      const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
      const { url } = await uploadToCloudinary(file, { onProgress: setProgress });
      onChange(url);
    } catch (e) {
      setError(errLabel(e.message, dir));
    } finally {
      setProgress(null);
      closeCrop();
    }
  };

  const handleFiles = async (files) => {
    const file = files?.[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      setError(dir === 'rtl' ? 'الرجاء اختيار صورة' : 'Please choose an image');
      return;
    }
    setError('');
    if (crop) {
      const url = URL.createObjectURL(file);
      previewUrlRef.current = url;
      setCropSrc(url);
      return;
    }
    setProgress(0);
    try {
      const { url } = await uploadToCloudinary(file, { onProgress: setProgress });
      onChange(url);
    } catch (e) {
      setError(errLabel(e.message, dir));
    } finally {
      setProgress(null);
    }
  };

  const cropProps = crop || { aspect: 1, output: { w: 800, h: 800 } };

  return (
    <div className="d-form__group">
      {label && <label>{label}</label>}
      <div className={`d-upload${value ? ' has-img' : ''}`}>
        {value ? (
          <img className="d-upload__preview" src={value} alt="" />
        ) : (
          <button type="button" className="d-upload__drop" onClick={() => inputRef.current?.click()}>
            <CloudIcon />
            <span>{dir === 'rtl' ? 'اسحب صورة أو اضغط للرفع' : 'Drop an image or click to upload'}</span>
            {!isCloudinaryConfigured && <em>{dir === 'rtl' ? 'كلاوديناري غير مضبوط' : 'Cloudinary not configured'}</em>}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
        />
        {value && (
          <div className="d-upload__bar" style={{ width: `${progress ?? 100}%` }} />
        )}
        <div className="d-upload__row">
          <button type="button" className="d-upload__pick" onClick={() => inputRef.current?.click()}>
            {value
              ? (dir === 'rtl' ? 'تغيير الصورة' : 'Change image')
              : (dir === 'rtl' ? 'اختيار صورة' : 'Choose image')}
          </button>
          {crop && value && (
            <button type="button" className="d-upload__crop" onClick={() => setCropSrc(value)}>
              {dir === 'rtl' ? 'قصّ / ضبط' : 'Crop / adjust'}
            </button>
          )}
          {value && (
            <button type="button" className="d-upload__clear" onClick={() => onChange('')}>
              {dir === 'rtl' ? 'إزالة' : 'Remove'}
            </button>
          )}
        </div>
      </div>
      {progress != null && (
        <span className="d-upload__progress">{dir === 'rtl' ? 'جارٍ الرفع' : 'Uploading'}… {progress}%</span>
      )}
      {error && <span className="d-upload__error">{error}</span>}
      {cropSrc && (
        <ImageCropModal
          src={cropSrc}
          aspect={cropProps.aspect}
          output={cropProps.output}
          onCancel={closeCrop}
          onSave={uploadCropped}
        />
      )}
    </div>
  );
}

export function MediaAddButton({ label, accept = 'image/*,video/*,audio/*', multiple = true, onAdd }) {
  const { dir } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFiles = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    setError('');
    setBusy(true);
    let done = 0;
    for (const file of list) {
      try {
        const { url, resourceType } = await uploadToCloudinary(file, {
          onProgress: (pct) => setProgress(Math.round((done + pct / 100) / list.length * 100)),
        });
        onAdd(url, resourceType);
      } catch (e) {
        setError(errLabel(e.message, dir));
        break;
      }
      done += 1;
      setProgress(Math.round((done / list.length) * 100));
    }
    setBusy(false);
    setProgress(0);
  };

  return (
    <div className="d-form__group">
      {label && <label>{label}</label>}
      <button
        type="button"
        className="d-upload__add"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
      >
        {busy ? (
          <>… {progress}%</>
        ) : (
          <>
            <CloudIcon />
            {dir === 'rtl' ? 'رفع وسائط من جهازك' : 'Upload media from your device'}
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />
      {busy && (
        <span className="d-upload__progress">{dir === 'rtl' ? 'جارٍ الرفع' : 'Uploading'}… {progress}%</span>
      )}
      {error && <span className="d-upload__error">{error}</span>}
      <span className="d-upload__hint">
        {dir === 'rtl'
          ? 'روابط الوسائط تُضاف تلقائياً للقائمة أدناه'
          : 'Uploaded media URLs are added to the list below automatically'}
      </span>
    </div>
  );
}