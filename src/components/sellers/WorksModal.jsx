import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { AudioWaves, PlayIcon, MediaStage } from './media';
import '../../pages/SellersPage.css';

const FILTERS = [
  { key: 'all', ar: 'الكل', en: 'All' },
  { key: 'image', ar: 'صور', en: 'Images' },
  { key: 'video', ar: 'فيديو', en: 'Videos' },
  { key: 'audio', ar: 'صوت', en: 'Audio' },
];

const initials = (name) => (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('');

function VerifiedBadge({ size = 13 }) {
  return (
    <span className="wm-verify" style={{ width: size * 1.9, height: size * 1.9 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export default function WorksModal({ profile, onClose, initialTab = 'works', initialModelId = null }) {
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const isBrand = profile.kind === 'brand';
  const name = isBrand ? profile.brand : profile.name;
  const role = isRtl ? profile.role_ar : profile.role_en;
  const works = useMemo(() => profile.works || [], [profile]);

  const firstModel = profile.models
    ? (profile.models.find((m) => m.id === initialModelId) || profile.models[0])
    : null;

  const [tab, setTab] = useState(initialTab);
  const [filter, setFilter] = useState('all');
  const [active, setActive] = useState(null);
  const [modelId, setModelId] = useState(firstModel ? firstModel.id : null);
  const [activeColor, setActiveColor] = useState(firstModel ? firstModel.colors[0].hex : null);
  const [qty, setQty] = useState(1);
  const [sent, setSent] = useState(false);

  const visible = filter === 'all' ? works : works.filter((w) => w.type === filter);
  const model = profile.models ? profile.models.find((m) => m.id === modelId) : null;
  const activeColorObj = model ? (model.colors.find((c) => c.hex === activeColor) || model.colors[0]) : null;
  const colorName = activeColorObj ? activeColorObj.name_ar : '';

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  useEffect(() => {
    if (works.length) setActive(works[0]);
  }, [works]);

  const counts = useMemo(() => ({
    all: works.length,
    image: works.filter((w) => w.type === 'image').length,
    video: works.filter((w) => w.type === 'video').length,
    audio: works.filter((w) => w.type === 'audio').length,
  }), [works]);

  return (
    <motion.div
      className="wm-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="wm"
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, scale: 0.95, y: 22 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="wm__head">
          <div className="wm__who">
            <span className="wm__avatar" style={{ background: profile.avatarGradient }}>{initials(name)}</span>
            <div>
              <h3 className="wm__name">
                {name}
                {profile.verified && <VerifiedBadge size={12} />}
              </h3>
              <p className="wm__role">{role}</p>
            </div>
          </div>
          <button className="wm__close" onClick={onClose} aria-label="close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {isBrand && (
          <div className="wm__tabs">
            <button className={tab === 'works' ? 'is-active' : ''} onClick={() => setTab('works')}>
              {isRtl ? 'الأعمال' : 'Works'}
            </button>
            <button className={tab === 'request' ? 'is-active' : ''} onClick={() => setTab('request')}>
              {isRtl ? 'اطلب موديل ولون' : 'Request model & color'}
            </button>
          </div>
        )}

        {tab === 'request' && isBrand ? (
          sent ? (
            <div className="wm-success">
              <motion.span
                className="wm-success__ring"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 16 }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </motion.span>
              <h4>{isRtl ? 'تم إرسال طلبك بنجاح!' : 'Request sent successfully!'}</h4>
              <p>
                {model && (isRtl
                  ? `طلبك: ${model.name_ar}${colorName ? ' — ' + colorName : ''} × ${qty}`
                  : `${model.name_en} × ${qty}`)}{' '}
                {isRtl ? 'سيصلك تأكيد من المورّد خلال أقل من 24 ساعة.' : 'The supplier will confirm within 24 hours.'}
              </p>
              <button className="wm__primary" onClick={onClose}>{isRtl ? 'تم، حسناً' : 'Done'}</button>
            </div>
          ) : (
            <div className="wm-request" key="request">
              <h4 className="wm-request__title">{isRtl ? '١. اختر الموديل' : '1. Choose the model'}</h4>
              <div className="wm-models">
                {profile.models.map((m) => (
                  <button
                    key={m.id}
                    className={`wm-model${modelId === m.id ? ' is-active' : ''}`}
                    onClick={() => { setModelId(m.id); setActiveColor(m.colors[0].hex); setQty(1); }}
                  >
                    <img src={m.image} alt={isRtl ? m.name_ar : m.name_en} loading="lazy" />
                    <span>{isRtl ? m.name_ar : m.name_en}</span>
                    <em className="wm-model__dots">
                      {m.colors.map((c) => <i key={c.hex} style={{ background: c.hex }} />)}
                    </em>
                    {modelId === m.id && (
                      <b className="wm-model__check">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </b>
                    )}
                  </button>
                ))}
              </div>

              <h4 className="wm-request__title">{isRtl ? '٢. اختر اللون' : '2. Choose the color'}</h4>
              {model && (
                <div className="wm-colors">
                  {model.colors.map((c) => (
                    <button
                      key={c.hex}
                      className={`wm-color${activeColor === c.hex ? ' is-active' : ''}`}
                      onClick={() => setActiveColor(c.hex)}
                    >
                      <i style={{ background: c.hex }} />
                      <span>{isRtl ? (model.colors.find((x) => x.hex === c.hex) || {}).name_ar : c.name_ar}</span>
                    </button>
                  ))}
                </div>
              )}

              <h4 className="wm-request__title">{isRtl ? '٣. الكمية' : '3. Quantity'}</h4>
              <div className="wm-qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <b>{qty}</b>
                <button onClick={() => setQty((q) => Math.min(99, q + 1))}>+</button>
              </div>

              <button className="wm__primary wm__primary--send" onClick={() => setSent(true)}>
                {isRtl ? 'أرسل الطلب' : 'Send request'}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isRtl ? 'scaleX(-1)' : undefined }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <p className="wm-request__note">
                <ClockIcon />
                {isRtl ? 'سيؤكد المورّد طلبك خلال أقل من 24 ساعة' : 'The supplier confirms within 24 hours'}
              </p>
            </div>
          )
        ) : (
          <div className="wm-works">
            <div className="wm-filters">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  className={filter === f.key ? 'is-active' : ''}
                  onClick={() => setFilter(f.key)}
                  disabled={counts[f.key] === 0}
                >
                  {isRtl ? f.ar : f.en}
                  <em>{counts[f.key]}</em>
                </button>
              ))}
            </div>

            <MediaStage work={active} isRtl={isRtl} />

            <div className="wm-grid">
              {works.length === 0 && (
                <p className="wm-empty">{isRtl ? 'ما توجد أعمال منشورة بعد' : 'No works published yet'}</p>
              )}
              {visible.map((w) => (
                <button
                  key={w.id}
                  className={`wm-item wm-item--${w.type}${active && active.id === w.id ? ' is-active' : ''}`}
                  onClick={() => setActive(w)}
                >
                  {w.type === 'image' && <img src={w.src} alt={isRtl ? w.title_ar : w.title_en} loading="lazy" />}
                  {w.type === 'video' && (
                    <>
                      <img src={w.poster} alt="" loading="lazy" />
                      <span className="wm-item__play"><PlayIcon /></span>
                    </>
                  )}
                  {w.type === 'audio' && (
                    <span className="wm-item__audio">
                      <AudioWaves />
                    </span>
                  )}
                  <span className="wm-item__meta">
                    <b>{isRtl ? w.title_ar : w.title_en}</b>
                    {w.duration && <em>{w.duration}</em>}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}