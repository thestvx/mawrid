import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../pages/SellersPage.css';

const SPECIALTY_ICON = {
  designers: '/sellers/icons/designers.png',
  editors: '/sellers/icons/editors.png',
  commentators: '/sellers/icons/commentators.png',
  creators: '/sellers/icons/creators.png',
  developers: '/sellers/icons/developers.png',
  brands: '/sellers/icons/brands.png',
};

const initials = (name) => (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('');
const isImg = (v) => typeof v === 'string' && v.trim() && /^(https?:|data:|\/)/.test(v);

function VerifiedBadge() {
  return (
    <span className="seller-card__verify" aria-label="verified">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

const AVAIL = {
  full: { ar: 'متفرّغ للعمل', en: 'Full-time' },
  part: { ar: 'متفرّغ جزئياً', en: 'Part-time' },
  busy: { ar: 'مشغول حالياً', en: 'Busy' },
};

function Stars({ rating }) {
  return (
    <span className="seller-card__stars" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <b>{rating}</b>
    </span>
  );
}

export default function SellerCard({ profile }) {
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const isBrand = profile.kind === 'brand';
  const name = isBrand ? profile.brand : profile.name;
  const role = isRtl ? profile.role_ar : profile.role_en;
  const av = AVAIL[profile.availability] || AVAIL.full;
  const hoursLabel = `${profile.hours.from} – ${profile.hours.to}`;
  const starRating = profile.stats ? profile.stats.rating : 0;
  const href = `/sellers/${profile.specialtyKey}/${profile.id}`;
  const coverBg = /^(https?:|data:|\/)/.test(profile.cover || '')
    ? `url(${profile.cover}) center/cover no-repeat`
    : profile.cover;

  const shots = useMemo(() => {
    const all = [];
    if (Array.isArray(profile.models)) profile.models.forEach((m) => { if (isImg(m.image)) all.push({ id: m.id, src: m.image }); });
    (profile.works || []).forEach((w) => {
      if (w.type === 'image' && isImg(w.src)) all.push({ id: w.id, src: w.src });
      else if (isImg(w.poster)) all.push({ id: w.id, src: w.poster });
    });
    const seen = new Set();
    return all.filter((s) => {
      if (seen.has(s.src)) return false;
      seen.add(s.src);
      return true;
    });
  }, [profile]);

  const shown = shots.slice(0, 3);
  while (shown.length < 3) {
    shown.push({ id: `pad-${shown.length}`, pad: true });
  }
  const extra = Math.max(0, shots.length - 3);
  const cta = isRtl
    ? (isBrand ? 'زيارة المتجر والطلب' : 'عرض الأعمال')
    : (isBrand ? 'Visit store & order' : 'View works');

  return (
    <article className={`seller-card${isBrand ? ' seller-card--brand' : ''}`}>
      <div className="seller-card__cover">
        <span className="seller-card__cover-fill" style={{ background: coverBg }} />
        <img className="seller-card__watermark" src={SPECIALTY_ICON[profile.specialtyKey]} alt="" loading="lazy" />
        <span className={`seller-card__avail seller-card__avail--${profile.availability}`}>
          {isRtl ? av.ar : av.en}
        </span>
        <span className="seller-card__kind">
          {isRtl ? (isBrand ? 'براند مؤثّق' : 'مورّد موثّق') : (isBrand ? 'Verified brand' : 'Verified supplier')}
        </span>
        <Link className="seller-card__peek" to={href} aria-label={cta}>
          <span>{cta}</span>
        </Link>
      </div>

      <div className="seller-card__head">
        <span className="seller-card__avatar" style={profile.avatar_url ? undefined : { background: profile.avatarGradient }}>
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt={name} style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
            : initials(name)}
          {profile.verified && <VerifiedBadge />}
        </span>
        <div className="seller-card__id">
          <h3 className="seller-card__name">{name}</h3>
          <p className="seller-card__role">{role}</p>
        </div>
        <div className="seller-card__rating">
          <Stars rating={starRating} />
        </div>
      </div>

      <div className="seller-card__gallery">
        {shown.map((s, i) => (
          <span
            className={`seller-card__shot${s.pad ? ' seller-card__shot--pad' : ''}`}
            key={`${s.id}-${i}`}
            style={s.pad ? { background: profile.avatarGradient } : undefined}
          >
            {!s.pad && <img src={s.src} alt="" loading="lazy" />}
            {s.pad && <i className="seller-card__mono">{initials(name)}</i>}
            {extra > 0 && !s.pad && i === shown.length - 1 && (
              <i className="seller-card__more">+{extra}</i>
            )}
          </span>
        ))}
      </div>

      <div className="seller-card__foot">
        <span className="seller-card__hours">
          <ClockIcon />
          {hoursLabel}
        </span>
        <Link className="seller-card__open" to={href}>
          {cta}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isRtl ? 'scaleX(-1)' : undefined }}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
