import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import WorksModal from '../components/sellers/WorksModal';
import { AudioWaves, PlayIcon, MediaStage } from '../components/sellers/media';
import { SELLER_SPECIALTIES, findStoreById } from '../data/sellers';
import { fetchSellers } from '../lib/supabase';
import './SellersPage.css';
import './SellerStorefront.css';

const SPECIALTY_ICON = {
  designers: '/sellers/icons/designers.png',
  editors: '/sellers/icons/editors.png',
  commentators: '/sellers/icons/commentators.png',
  creators: '/sellers/icons/creators.png',
  developers: '/sellers/icons/developers.png',
  brands: '/sellers/icons/brands.png',
};

const EASE = [0.16, 1, 0.3, 1];

const FILTERS = [
  { key: 'all', ar: 'الكل', en: 'All' },
  { key: 'image', ar: 'صور', en: 'Images' },
  { key: 'video', ar: 'فيديو', en: 'Videos' },
  { key: 'audio', ar: 'صوت', en: 'Audio' },
];

const AVAIL = {
  full: { ar: 'متفرّغ للعمل', en: 'Full-time' },
  part: { ar: 'متفرّغ جزئياً', en: 'Part-time' },
  busy: { ar: 'مشغول حالياً', en: 'Busy' },
};

const initials = (name) => (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('');

const rise = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

function Chevron({ isRtl }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isRtl ? 'scaleX(-1)' : undefined }}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function Verified({ size = 16 }) {
  return (
    <span className="store-verify" style={{ width: size, height: size }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

function Stars({ rating }) {
  return (
    <span className="store-stars" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <b>{rating}</b>
    </span>
  );
}

function ClockIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function PinIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function BoltIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
    </svg>
  );
}

function LinkIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  );
}

export default function SellerStorefront() {
  const { dir } = useLanguage();
  const { id } = useParams();
  const isRtl = dir === 'rtl';

  const [realSellers, setRealSellers] = useState([]);
  const needsStoreFetch = Boolean(id && (id.startsWith('real-') || id.startsWith('mawrid-')));
  const [ready, setReady] = useState(() => !needsStoreFetch);
  const [tab, setTab] = useState('works');
  const [filter, setFilter] = useState('all');
  const [activeWork, setActiveWork] = useState(null);
  const [request, setRequest] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!needsStoreFetch) return;
    let flag = true;
    fetchSellers().then((s) => {
      if (!flag) return;
      setRealSellers(s.data || []);
      setReady(true);
    });
    return () => { flag = false; };
  }, [needsStoreFetch, id]);

  const profile = useMemo(() => findStoreById(id, realSellers), [id, realSellers]);
  const isBrand = profile?.kind === 'brand';
  const works = useMemo(() => profile?.works || [], [profile]);

  useEffect(() => {
    if (!profile) return;
    setTab(profile.kind === 'brand' ? 'store' : 'works');
    setFilter('all');
  }, [profile]);

  useEffect(() => {
    setActiveWork(works[0] || null);
  }, [works]);

  const counts = useMemo(() => ({
    all: works.length,
    image: works.filter((w) => w.type === 'image').length,
    video: works.filter((w) => w.type === 'video').length,
    audio: works.filter((w) => w.type === 'audio').length,
  }), [works]);

  const visible = filter === 'all' ? works : works.filter((w) => w.type === filter);

  if (!profile) {
    return (
      <main className="store-page">
        <div className="container store-notfound">
          {ready ? (
            <>
              <img src="/sellers/icons/creators.png" alt="" />
              <h1>{isRtl ? 'الملف غير موجود' : 'Profile not found'}</h1>
              <p>{isRtl ? 'يمكن المورّد حذف ملفّه أو الرابط غير صحيح.' : 'This seller may have removed their profile or the link is wrong.'}</p>
              <Link to="/sellers" className="store-back">{isRtl ? 'رجوع لسوق المورّدين' : 'Back to sellers'}</Link>
            </>
          ) : (
            <span className="store-spinner" aria-label="loading" />
          )}
        </div>
      </main>
    );
  }

  const name = isBrand ? profile.brand : profile.name;
  const role = isRtl ? profile.role_ar : profile.role_en;
  const bio = isRtl ? profile.bio_ar : profile.bio_en;
  const av = AVAIL[profile.availability] || AVAIL.full;
  const specialtyMeta = SELLER_SPECIALTIES.find((s) => s.key === profile.specialtyKey) || SELLER_SPECIALTIES[0];
  const specialtyLabel = isRtl ? specialtyMeta.name_ar : specialtyMeta.name_en;
  const hoursLabel = `${profile.hours.from} – ${profile.hours.to} · ${profile.hours.zone}`;
  const palette = isBrand
    ? Array.from(new Map((profile.models || []).flatMap((m) => (m.colors || [])).map((c) => [c.hex, c])).values())
    : [];

  const isUrl = (v) => typeof v === 'string' && /^(https?:|data:|\/)/.test(v);
  const coverStyle = isUrl(profile.cover)
    ? { backgroundImage: `url(${profile.cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: profile.cover };

  const tabs = isBrand
    ? [
        { key: 'store', ar: 'المتجر', en: 'Store' },
        { key: 'about', ar: 'نبذة', en: 'About' },
      ]
    : [
        { key: 'works', ar: 'الأعمال', en: 'Works' },
        { key: 'about', ar: 'نبذة', en: 'About' },
      ];

  const stats = [
    { value: works.length || profile.stats.projects, ar: 'عمل منشور', en: 'Published works' },
    { value: profile.stats.products, ar: 'منتج وخدمة', en: 'Products & services' },
    { value: profile.stats.rating, ar: 'تقييم العملاء', en: 'Client rating', star: true },
    { value: isRtl ? 'أقل من ٢٤س' : '< 24h', ar: 'زمن الرد', en: 'Response time' },
  ];

  const openPrimary = () => {
    if (isBrand && profile.models?.length) {
      setRequest({ tab: 'request', modelId: profile.models[0].id });
    } else {
      setRequest({ tab: 'works' });
    }
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="store-page">
      <div className="container store-shell">
        <motion.nav
          className="store-crumbs"
          aria-label="breadcrumb"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <Link to="/">{isRtl ? 'الرئيسية' : 'Home'}</Link>
          <Chevron isRtl={isRtl} />
          <Link to="/sellers">{isRtl ? 'سوق المورّدين' : 'Sellers'}</Link>
          <Chevron isRtl={isRtl} />
          <Link to={`/sellers/${profile.specialtyKey}`}>{specialtyLabel}</Link>
          <Chevron isRtl={isRtl} />
          <span className="is-current">{name}</span>
        </motion.nav>

        <motion.section
          className="store-banner"
          style={coverStyle}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <img className="store-banner__mark" src={SPECIALTY_ICON[profile.specialtyKey]} alt="" />
        </motion.section>

        <motion.header
          className="store-head"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.08 }}
        >
          <div className="store-head__left">
            <span className="store-avatar" style={profile.avatar_url ? undefined : { background: profile.avatarGradient }}>
              {profile.avatar_url ? <img src={profile.avatar_url} alt={name} /> : initials(name)}
              {profile.verified && <Verified size={22} />}
            </span>
            <div className="store-head__info">
              <div className="store-head__title">
                <h1 className="store-name">{name}</h1>
                {profile.verified && <Verified size={16} />}
              </div>
              <p className="store-role">{role}</p>
              <div className="store-meta">
                <span className="store-meta__item">
                  <Stars rating={profile.stats.rating} />
                </span>
                <span className="store-meta__dot" aria-hidden="true" />
                <span className="store-meta__item"><ClockIcon size={14} /> {hoursLabel}</span>
                <span className="store-meta__dot" aria-hidden="true" />
                <span className="store-meta__item"><PinIcon size={14} /> {specialtyLabel}</span>
                <span className="store-meta__dot" aria-hidden="true" />
                <span className="store-meta__item"><BoltIcon size={14} /> {isRtl ? av.ar : av.en}</span>
              </div>
            </div>
          </div>
          <div className="store-head__actions">
            <button className="store-btn store-btn--dark" onClick={openPrimary}>
              {isRtl ? (isBrand ? 'اطلب موديل' : 'اطلب خدمة') : (isBrand ? 'Request a model' : 'Hire now')}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isRtl ? 'scaleX(-1)' : undefined }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button className="store-btn store-btn--outline" onClick={share}>
              {copied ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'مشاركة' : 'Share')}
            </button>
          </div>
        </motion.header>

        <motion.div
          className="store-stats"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.14 }}
        >
          {stats.map((s, i) => (
            <div className="store-stat" key={i}>
              <b>{s.star ? <Stars rating={s.value} /> : s.value}</b>
              <span>{isRtl ? s.ar : s.en}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="sf-trust"
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          {[
            { icon: 'shield', ar: 'جودة مضمونة', en: 'Certified quality' },
            { icon: 'truck', ar: 'شحن سريع', en: 'Fast shipping' },
            { icon: 'chat', ar: 'دعم خلال ٢٤س', en: 'Support in 24h' },
          ].map((f) => (
            <motion.div className="sf-trust__item" key={f.icon} variants={rise}>
              <span className={`sf-trust__ico sf-trust__ico--${f.icon}`}>
                {f.icon === 'shield' ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z" />
                  </svg>
                ) : f.icon === 'truck' ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 18H3V5h13v13M16 9h4l3 4v5h-3M7 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0ZM16 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0Z" />
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.38 9 9 0 0 1-3.9-.9L3 20l1.02-5.6A8.38 8.38 0 1 1 21 11.5Z" />
                  </svg>
                )}
              </span>
              <b>{isRtl ? f.ar : f.en}</b>
            </motion.div>
          ))}
        </motion.div>

        {tab === 'store' && isBrand && palette.length > 0 && (
          <motion.section
            className="store-featured"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="store-featured__media">
              {profile.models[0]?.image
                ? <img src={profile.models[0].image} alt="" loading="lazy" />
                : <img src={profile.models[0]?.image || SPECIALTY_ICON[profile.specialtyKey]} alt="" className="store-featured__ph" />}
            </div>
            <div className="store-featured__body">
              <span className="store-featured__eyebrow">
                {isRtl ? 'مجموعة مميزة' : 'Featured collection'}
              </span>
              <h2 className="store-featured__title">
                {isRtl ? `توقيع ${name} بالألوان` : `${name}'s signature palette`}
              </h2>
              <p className="store-featured__desc">
                {isRtl
                  ? `اكتشف ${palette.length} لوناً من تشكيلة ${name} — اختر موديلك وألوانك، ويصلك تأكيد من المورّد خلال أقل من ٢٤ ساعة.`
                  : `Explore ${palette.length} colors from ${name}'s collection — pick your model and shades, and the supplier confirms within 24 hours.`}
              </p>
              <div className="store-featured__swatches" aria-hidden="true">
                {palette.slice(0, 7).map((c) => (
                  <i key={c.hex} style={{ background: c.hex }} />
                ))}
              </div>
              <button className="store-featured__cta" onClick={() => setRequest({ tab: 'request', modelId: profile.models[0]?.id || null })}>
                {isRtl ? 'اطلب موديل ولون' : 'Request model & color'}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isRtl ? 'scaleX(-1)' : undefined }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </motion.section>
        )}

        <div className="store-body">
          <div className="store-main">
            <div className="store-tabs" role="tablist">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  className={tab === t.key ? 'is-active' : ''}
                  onClick={() => setTab(t.key)}
                >
                  {isRtl ? t.ar : t.en}
                  <i className="store-tabs__ink" />
                </button>
              ))}
            </div>

            <div className="store-panels">
              {tab === 'store' && isBrand && (
                <motion.div
                  className="store-models"
                  key="store"
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                >
                  {profile.models.map((m) => (
                    <motion.article className="store-model" key={m.id} variants={rise}>
                      <div className="store-model__media">
                        {m.image
                          ? <img src={m.image} alt={isRtl ? m.name_ar : m.name_en} loading="lazy" />
                          : <img src={SPECIALTY_ICON[profile.specialtyKey]} alt="" className="store-model__ph" />}
                        {(m.colors || []).length > 0 && (
                          <span className="store-model__colors">
                            {(m.colors || []).map((c) => <i key={c.hex} style={{ background: c.hex }} title={c.name_ar} />)}
                          </span>
                        )}
                      </div>
                      <div className="store-model__body">
                        <h3>{(isRtl ? m.name_ar : m.name_en) || (isRtl ? 'موديل' : 'Model')}</h3>
                        <button className="store-model__cta" onClick={() => setRequest({ tab: 'request', modelId: m.id })}>
                          {isRtl ? 'اطلب موديل ولون' : 'Request model & color'}
                        </button>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              )}

              {tab === 'works' && (
                <motion.div className="store-works" key="works" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
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

                  <MediaStage work={activeWork} isRtl={isRtl} />

                  <div className="wm-grid">
                    {works.length === 0 && (
                      <p className="wm-empty">{isRtl ? 'ما توجد أعمال منشورة بعد' : 'No works published yet'}</p>
                    )}
                    {visible.map((w) => (
                      <button
                        key={w.id}
                        className={`wm-item wm-item--${w.type}${activeWork && activeWork.id === w.id ? ' is-active' : ''}`}
                        onClick={() => setActiveWork(w)}
                      >
                        {w.type === 'image' && <img src={w.src} alt={isRtl ? w.title_ar : w.title_en} loading="lazy" />}
                        {w.type === 'video' && (
                          <>
                            <img src={w.poster} alt="" loading="lazy" />
                            <span className="wm-item__play"><PlayIcon /></span>
                          </>
                        )}
                        {w.type === 'audio' && (
                          <span className="wm-item__audio"><AudioWaves /></span>
                        )}
                        <span className="wm-item__meta">
                          <b>{isRtl ? w.title_ar : w.title_en}</b>
                          {w.duration && <em>{w.duration}</em>}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {tab === 'about' && (
                <motion.div className="store-about" key="about" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
                  <h3>{isRtl ? `عن ${name}` : `About ${name}`}</h3>
                  <p>{bio}</p>
                  <ul className="store-about__list">
                    <li>
                      <ClockIcon />
                      {isRtl ? `ساعات العمل: ${hoursLabel}` : `Working hours: ${hoursLabel}`}
                    </li>
                    <li>
                      <PinIcon />
                      {isRtl ? `التخصّص: ${specialtyLabel}` : `Specialty: ${specialtyLabel}`}
                    </li>
                    <li>
                      <BoltIcon />
                      {isRtl ? `حالة العمل: ${av.ar}` : `Availability: ${av.en}`}
                    </li>
                  </ul>
                </motion.div>
              )}
            </div>
          </div>

          <aside className="store-side">
            <div className="store-card">
              <h4>{isRtl ? 'معلومات سريعة' : 'Quick facts'}</h4>
              <ul className="store-facts">
                <li>
                  <ClockIcon />
                  <span>{isRtl ? 'ساعات العمل' : 'Working hours'}</span>
                  <b>{profile.hours.from} – {profile.hours.to}</b>
                </li>
                <li>
                  <BoltIcon />
                  <span>{isRtl ? 'زمن الرد' : 'Response time'}</span>
                  <b>{isRtl ? 'أقل من ٢٤ ساعة' : '< 24 hours'}</b>
                </li>
                <li>
                  <PinIcon />
                  <span>{isRtl ? 'التخصّص' : 'Specialty'}</span>
                  <b>{specialtyLabel}</b>
                </li>
                {profile.website && (
                  <li>
                    <LinkIcon />
                    <span>{isRtl ? 'الموقع الإلكتروني' : 'Website'}</span>
                    <a
                      href={/^https?:\/\//i.test(profile.website) ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--sf-brand)', fontWeight: 600, textDecoration: 'underline' }}
                    >
                      {profile.website.replace(/^https?:\/\//i, '').slice(0, 24)}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {isBrand && palette.length > 0 && (
              <div className="store-card">
                <h4>{isRtl ? 'درجات الألوان المتاحة' : 'Available colors'}</h4>
                <div className="store-palette">
                  {palette.map((c) => (
                    <span key={c.hex}>
                      <i style={{ background: c.hex }} />
                      {c.name_ar}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="store-card store-card--cta">
              <h4>{isRtl ? `اطلب من ${name}` : `Order from ${name}`}</h4>
              <p>
                {isRtl
                  ? (isBrand
                    ? 'اختر الموديل واللون والكمية، ويوصلك تأكيد من المورّد خلال أقل من ٢٤ ساعة.'
                    : 'أرسل تفاصيل مشروعك ويتم الرد عليك خلال أقل من ٢٤ ساعة.')
                  : (isBrand
                    ? 'Pick the model, color and quantity — the supplier confirms within 24 hours.'
                    : 'Send your brief and get a reply within 24 hours.')}
              </p>
              <button className="store-btn store-btn--dark store-btn--block" onClick={openPrimary}>
                {isRtl ? 'ابدأ الطلب الآن' : 'Start your order'}
              </button>
            </div>
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {request && (
          <WorksModal
            profile={profile}
            initialTab={request.tab || 'works'}
            initialModelId={request.modelId || null}
            onClose={() => setRequest(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
