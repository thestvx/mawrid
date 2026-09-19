import { useRef, useState } from 'react';
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

export function ImageField({ label, value, onChange }) {
  const { dir } = useLanguage();
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFiles = async (files) => {
    const file = files?.[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      setError(dir === 'rtl' ? 'الرجاء اختيار صورة' : 'Please choose an image');
      return;
    }
    setError('');
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