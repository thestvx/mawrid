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

function VerifiedBadge() {
  return (
    <span className="seller-card__verify" aria-label="verified">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
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

export default function SellerCard({ profile, onOpen }) {
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const isBrand = profile.kind === 'brand';
  const name = isBrand ? profile.brand : profile.name;
  const role = isRtl ? profile.role_ar : profile.role_en;
  const bio = isRtl ? profile.bio_ar : profile.bio_en;
  const av = AVAIL[profile.availability] || AVAIL.full;
  const hoursLabel = `${profile.hours.from} – ${profile.hours.to} · ${profile.hours.zone}`;
  const starRating = profile.stats ? profile.stats.rating : 0;

  return (
    <article className="seller-card">
      <div className="seller-card__cover" style={{ background: profile.cover }}>
        <img className="seller-card__watermark" src={SPECIALTY_ICON[profile.specialtyKey]} alt="" loading="lazy" />
        <span className="seller-card__kind">
          {isRtl ? (isBrand ? 'براند مؤثّق' : 'مورّد موثّق') : (isBrand ? 'Verified brand' : 'Verified supplier')}
        </span>
      </div>

      <div className="seller-card__body">
        <div className="seller-card__avatar-wrap">
          <span className="seller-card__avatar" style={{ background: profile.avatarGradient }}>
            {initials(name)}
          </span>
          {profile.verified && <VerifiedBadge />}
        </div>

        <h3 className="seller-card__name">{name}</h3>
        <p className="seller-card__role">{role}</p>
        <p className="seller-card__bio">{bio}</p>

        <div className="seller-card__facts">
          <span className="seller-card__fact">
            <ClockIcon />
            {hoursLabel}
          </span>
          <span className={`seller-card__avail seller-card__avail--${profile.availability}`}>
            {isRtl ? av.ar : av.en}
          </span>
        </div>

        <div className="seller-card__stats">
          <div className="seller-card__stat">
            <b>{profile.stats.projects}</b>
            <span>{isRtl ? 'عمل/مشروع' : 'works'}</span>
          </div>
          <div className="seller-card__stat">
            <b>{profile.stats.products}</b>
            <span>{isRtl ? 'منتج' : 'products'}</span>
          </div>
          <div className="seller-card__stat seller-card__stat--rating">
            <Stars rating={starRating} />
          </div>
        </div>

        <button className="seller-card__open" onClick={() => onOpen(profile)}>
          {isRtl ? (isBrand ? 'عرض الأعمال والطلب' : 'عرض الأعمال') : (isBrand ? 'View works & request' : 'View works')}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isRtl ? 'scaleX(-1)' : undefined }}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </article>
  );
}