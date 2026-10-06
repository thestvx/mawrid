import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import Badge from '../ui/Badge';
import './SellerCard.css';

const initials = (name) => (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('');

function VerifiedMark() {
  return (
    <span className="mw-seller-card__verified" aria-label="verified">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

function Stars({ rating }) {
  return (
    <span className="mw-seller-card__stars" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <b>{Number(rating).toFixed(1)}</b>
    </span>
  );
}

const AVAIL = {
  full: { ar: 'متاح الآن', en: 'Available', tone: 'verified' },
  part: { ar: 'متاح جزئياً', en: 'Part-time', tone: 'soft' },
  busy: { ar: 'مشغول', en: 'Busy', tone: 'muted' },
};

export default function SellerCard({ profile }) {
  const { t, dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const isBrand = profile.kind === 'brand';
  const name = isBrand ? profile.brand : profile.name;
  const role = isRtl ? profile.role_ar : profile.role_en;
  const av = AVAIL[profile.availability] || AVAIL.full;
  const starRating = profile.stats ? Number(profile.stats.rating) || 0 : 0;
  const href = `/sellers/${profile.specialtyKey}/${profile.id}`;
  const worksCount = Array.isArray(profile.works) ? profile.works.length : (profile.stats?.projects || 0);
  const cta = isRtl ? (isBrand ? 'زيارة المتجر' : 'عرض الملف') : (isBrand ? 'Visit store' : 'View profile');

  return (
    <article className="mw-seller-card">
      <div className="mw-seller-card__head">
        <span
          className="mw-seller-card__avatar"
          style={profile.avatar_url ? undefined : { background: profile.avatarGradient || 'var(--mw-brand-500)' }}
        >
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt={name} loading="lazy" />
            : initials(name)}
        </span>
        <div className="mw-seller-card__id">
          <h3 className="mw-seller-card__name">
            {name}
            {profile.verified && <VerifiedMark />}
          </h3>
          <p className="mw-seller-card__role">{role}</p>
        </div>
        <Badge tone={av.tone}>{isRtl ? av.ar : av.en}</Badge>
      </div>

      <div className="mw-seller-card__stats">
        <Stars rating={starRating} />
        <span className="mw-seller-card__dot" aria-hidden="true" />
        <span className="mw-seller-card__works">
          {worksCount} {isRtl ? 'عمل' : 'works'}
        </span>
      </div>

      <Link to={href} className="mw-btn mw-btn--secondary mw-btn--sm mw-btn--block">
        {cta}
        <svg className="mw-flip" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </article>
  );
}
