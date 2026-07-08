import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';

const RECENT_ORDERS = [
  { id: '#ORD-8923', date: '2026-07-07', product: 'SaaS Admin Pro Kit', amount: 49, status: 'completed', customer: 'Alex M.' },
  { id: '#ORD-8821', date: '2026-07-05', product: 'Nova Line Icons V2', amount: 24, status: 'completed', customer: 'Alex M.' },
  { id: '#ORD-8710', date: '2026-07-03', product: 'ChatGPT Pro Subscription', amount: 19.99, status: 'completed', customer: 'Alex M.' },
  { id: '#ORD-8604', date: '2026-06-28', product: 'Pitch Deck Master', amount: 39, status: 'pending', customer: 'Alex M.' },
  { id: '#ORD-8599', date: '2026-06-25', product: 'Color System Gen Plugin', amount: 15, status: 'completed', customer: 'Alex M.' },
  { id: '#ORD-8501', date: '2026-06-20', product: 'Dashboard Template Bundle', amount: 79, status: 'cancelled', customer: 'Alex M.' },
];

const FAVORITES = [
  { title: 'Abstract 3D Shape Pack', price: 29, color: '#ff6201', initials: '3D' },
  { title: 'Fintech Admin Dashboard', price: 55, color: '#494bd6', initials: 'FD' },
  { title: 'Corporate Vector Pack', price: 24, color: '#10b981', initials: 'CV' },
  { title: 'Isometric Illustration Kit', price: 35, color: '#a53c00', initials: 'II' },
  { title: 'Wireframe UI Starter', price: 19, color: '#ef4444', initials: 'WS' },
  { title: 'Motion Graphics Bundle', price: 45, color: '#f59e0b', initials: 'MG' },
];

const DOWNLOADS = [
  { title: 'SaaS Admin Pro Kit', date: '2026-07-07', size: '145 MB', version: 'v2.3.0' },
  { title: 'Nova Line Icons V2', date: '2026-07-05', size: '12 MB', version: 'v2.1.0' },
  { title: 'ChatGPT Pro Invoice', date: '2026-07-03', size: '0.4 MB', version: 'PDF' },
  { title: 'Pitch Deck Master', date: '2026-06-28', size: '89 MB', version: 'v1.0.0' },
  { title: 'Color System Gen', date: '2026-06-25', size: '3.2 MB', version: 'v1.2.0' },
];

const LEARNING_COURSES = [
  { title: 'Advanced Figma Systems', category: 'UI/UX', progress: 65, completed: 12, total: 18, color: '#494bd6', icon: '🎯' },
  { title: 'React Component Patterns', category: 'Dev', progress: 20, completed: 3, total: 15, color: '#a53c00', icon: '⚛️' },
  { title: 'Design System Architecture', category: 'UI/UX', progress: 42, completed: 8, total: 19, color: '#2f2ebe', icon: '🏛️' },
];

const LIBRARY_ITEMS = [
  { title: 'SaaS Admin Pro Kit', desc: 'Complete dashboard UI kit with 150+ components.', category: 'Template', updated: '2 days ago', color: '#ff6201', initials: 'SA' },
  { title: 'Nova Line Icons V2', desc: '2000+ essential line icons in SVG and Figma formats.', category: 'Icons', updated: '1 week ago', color: '#494bd6', initials: 'NL' },
  { title: 'Pitch Deck Master', desc: 'Keynote and PowerPoint startup pitch templates.', category: 'Template', updated: '1 month ago', color: '#2f2ebe', initials: 'PD' },
  { title: 'Color System Gen', desc: 'Automated palette generation tool for design systems.', category: 'Plugin', updated: '2 months ago', color: '#5f5e5e', initials: 'CG' },
];

const ACTIVITY_ITEMS = [
  { type: 'purchase', title: 'Purchased SaaS Admin Pro Kit', detail: 'Order #ORD-8923 \u2022 $49.00', time: 'Today, 10:42 AM', action: 'View Receipt', icon: '🛍️', color: '#ff6201' },
  { type: 'lesson', title: 'Completed lesson Variables Deep Dive', detail: 'in Advanced Figma Systems', time: 'Yesterday, 3:15 PM', action: 'Continue Course', icon: '▶️', color: '#494bd6' },
  { type: 'update', title: 'Asset update available for Nova Line Icons V2', detail: 'Version 2.1 introduces 50 new icons.', time: 'Oct 12, 2023', action: 'Download Update', icon: '🔄', color: '#5f5e5e' },
  { type: 'purchase', title: 'Purchased Pitch Deck Master', detail: 'Order #ORD-8604 \u2022 $39.00', time: 'Jun 28, 2026', action: 'View Receipt', icon: '🛍️', color: '#ff6201' },
  { type: 'lesson', title: 'Started module Component Architecture', detail: 'in React Component Patterns', time: 'Jun 25, 2026', action: 'Resume', icon: '▶️', color: '#494bd6' },
];

function AnimatedNumber({ value, suffix = '', duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  const easeOutCubic = useCallback((t) => 1 - Math.pow(1 - t, 3), []);

  useEffect(() => {
    if (value === display) return;
    const startValue = display;
    startRef.current = null;

    function animate(ts) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      setDisplay(Math.round(startValue + (value - startValue) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, duration, easeOutCubic]);

  return <>{display}{suffix}</>;
}

function ProgressBar({ progress, color }) {
  return (
    <div style={{ width: '100%', background: 'var(--color-surface-container-high)', borderRadius: 9999, height: 8, overflow: 'hidden', position: 'relative' }}>
      <div style={{ width: `${progress}%`, background: color || 'var(--color-primary-container)', height: 8, borderRadius: 9999, position: 'relative', overflow: 'hidden', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div style={{ position: 'absolute', inset: 0, transform: 'translateX(-100%)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', animation: 'shimmer 2s infinite' }} />
      </div>
    </div>
  );
}

const tabMeta = [
  { key: 'overview', labelKey: 'dashboard.overview', icon: '📊' },
  { key: 'orders', labelKey: 'dashboard.orders', icon: '📋' },
  { key: 'downloads', labelKey: 'dashboard.downloads', icon: '⬇️' },
  { key: 'favorites', labelKey: 'dashboard.favorites', icon: '❤️' },
  { key: 'settings', labelKey: 'dashboard.settings', icon: '⚙️' },
];

export default function BuyerDashboard() {
  const { t, dir } = useLanguage();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [activeMobileTab, setActiveMobileTab] = useState('overview');
  const tab = new URLSearchParams(window.location.search).get('tab') || 'overview';

  const isRtl = dir === 'rtl';

  const totalSpent = RECENT_ORDERS.reduce((sum, o) => sum + o.amount, 0);
  const completedOrders = RECENT_ORDERS.filter((o) => o.status === 'completed').length;

  useEffect(() => {
    if (role !== 'buyer' && role !== 'seller' && user) {
      navigate('/dashboard/buyer');
    }
  }, [role, user, navigate]);

  const renderOverview = () => (
    <>
      <div className="d-welcome" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', flexDirection: isRtl ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h2 className="d-welcome__title" style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>
              {t('dashboard.welcome')}
            </h2>
            <p className="d-welcome__sub" style={{ color: 'var(--color-secondary)', marginBottom: 0 }}>
              {isRtl ? 'لديك تحديثان في مكتبتك الرقمية ودورة واحدة قيد الإكمال.' : 'You have 2 new updates in your digital library and 1 course pending completion.'}
            </p>
          </div>
          <Link to="/marketplace" className="btn btn--primary" style={{ whiteSpace: 'nowrap' }}>
            {t('dashboard.browseMarketplace')}
          </Link>
        </div>
      </div>

      <div className="d-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        <div className="d-stat" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 96, height: 96, background: 'rgba(255,98,1,0.08)', borderRadius: '0 0 0 999px' }} />
          <span className="d-stat__value"><AnimatedNumber value={RECENT_ORDERS.length} /></span>
          <span className="d-stat__label">{t('dashboard.totalOrders')}</span>
        </div>
        <div className="d-stat" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 96, height: 96, background: 'rgba(73,75,214,0.08)', borderRadius: '0 0 0 999px' }} />
          <span className="d-stat__value"><AnimatedNumber value={DOWNLOADS.length} /></span>
          <span className="d-stat__label">{t('dashboard.totalProducts')}</span>
        </div>
        <div className="d-stat" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 96, height: 96, background: 'rgba(47,46,190,0.08)', borderRadius: '0 0 0 999px' }} />
          <span className="d-stat__value"><AnimatedNumber value={totalSpent} suffix="$" /></span>
          <span className="d-stat__label">{t('dashboard.totalRevenue')}</span>
        </div>
        <div className="d-stat" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 96, height: 96, background: 'rgba(22,101,52,0.08)', borderRadius: '0 0 0 999px' }} />
          <span className="d-stat__value"><AnimatedNumber value={completedOrders} /></span>
          <span className="d-stat__label">{t('dashboard.orderCompleted')}</span>
        </div>
      </div>

      <div className="d-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {tabMeta.filter((m) => m.key !== 'overview').map((meta) => (
          <Link key={meta.key} to={`/dashboard/buyer?tab=${meta.key}`} className="d-quick-card">
            <span className="d-quick-card__icon">{meta.icon}</span>
            <span>{t(meta.labelKey)}</span>
          </Link>
        ))}
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>
            {isRtl ? 'التقدم التعليمي' : 'Learning Progress'}
          </h3>
        </div>
        <div className="d-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {LEARNING_COURSES.map((course, i) => (
            <div key={i} className="d-card" style={{ position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'default' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 96, height: 96, background: `${course.color}10`, borderRadius: '0 0 0 999px', transition: 'transform 0.5s' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${course.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                  {course.icon}
                </div>
                <span style={{ background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface-variant)', fontSize: '0.6875rem', fontWeight: 700, padding: '2px 10px', borderRadius: 9999 }}>
                  {course.category}
                </span>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: 6, position: 'relative', zIndex: 1 }}>
                {course.title}
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)', marginBottom: 16, position: 'relative', zIndex: 1 }}>
                {course.desc}
              </p>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', marginBottom: 6 }}>
                  <span>{course.progress}% {isRtl ? 'مكتمل' : 'Completed'}</span>
                  <span>{course.completed}/{course.total} {isRtl ? 'دروس' : 'Lessons'}</span>
                </div>
                <ProgressBar progress={course.progress} color={course.color} />
              </div>
            </div>
          ))}
          <Link to="/marketplace" className="d-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', border: '2px dashed var(--color-outline-variant)', background: 'transparent', cursor: 'pointer', textDecoration: 'none' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, fontSize: '1.5rem', color: 'var(--color-on-surface-variant)' }}>
              +
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-on-surface)', marginBottom: 6 }}>
              {isRtl ? 'استكشف مهارات جديدة' : 'Explore New Skills'}
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)', marginBottom: 0 }}>
              {isRtl ? 'اكتشف دورات متميزة لنموك المهني.' : 'Discover premium courses for your growth.'}
            </p>
          </Link>
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: 2 }}>
              {isRtl ? 'مكتبتي الرقمية' : 'My Digital Library'}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)', margin: 0 }}>
              {isRtl ? 'الأصول والقوالب والأدوات المشتراة حديثاً.' : 'Recently purchased assets, templates, and tools.'}
            </p>
          </div>
        </div>
        <div className="d-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {LIBRARY_ITEMS.map((item, i) => (
            <div key={i} className="d-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'all 0.3s ease' }}>
              <div style={{ aspectRatio: '16/9', background: `linear-gradient(135deg, ${item.color}20, ${item.color}05)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: `${item.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, color: item.color }}>
                  {item.initials}
                </div>
                <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s', cursor: 'pointer' }}>
                  ⬇️
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 12px 8px', background: 'linear-gradient(transparent, rgba(0,0,0,0.5))', opacity: 0, transition: 'opacity 0.3s' }}>
                  <span style={{ color: '#fff', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.category}</span>
                </div>
              </div>
              <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-on-surface)', marginBottom: 4 }}>{item.title}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)', marginBottom: 12, flex: 1 }}>{item.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>
                    {isRtl ? 'آخر تحديث' : 'Updated'} {item.updated}
                  </span>
                  <button style={{ padding: '6px 14px', background: `${item.color}12`, color: item.color, border: 'none', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                    {isRtl ? 'تحميل' : 'Download'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="d-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-outline-variant)', background: 'var(--color-surface-bright)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="d-card__title" style={{ margin: 0 }}>
            {isRtl ? 'آخر النشاطات' : 'Recent Activity'}
          </h3>
        </div>
        <div>
          {ACTIVITY_ITEMS.map((item, i) => (
            <div key={i} style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: i < ACTIVITY_ITEMS.length - 1 ? '1px solid var(--color-outline-variant)' : 'none', transition: 'background 0.2s', cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${item.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1rem' }}>
                {item.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface)', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.title}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', margin: '2px 0 0' }}>
                  {item.detail}
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', display: 'block', marginBottom: 2 }}>{item.time}</span>
                <button style={{ fontSize: '0.75rem', color: 'var(--color-primary-container)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 600 }}>
                  {item.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderOrders = () => (
    <div className="d-card">
      <h3 className="d-card__title">{t('dashboard.recentOrders')}</h3>
      {RECENT_ORDERS.length === 0 ? (
        <p className="d-empty">{t('dashboard.noOrders')}</p>
      ) : (
        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>{t('dashboard.orderId')}</th>
                <th>{t('dashboard.orderDate')}</th>
                <th>{t('dashboard.productName')}</th>
                <th>{t('dashboard.orderAmount')}</th>
                <th>{t('dashboard.orderStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ORDERS.map((o) => (
                <tr key={o.id}>
                  <td className="d-table__id">{o.id}</td>
                  <td>{o.date}</td>
                  <td>{o.product}</td>
                  <td>${o.amount.toFixed(2)}</td>
                  <td><span className={`d-badge d-badge--${o.status}`}>{t(`dashboard.order${o.status.charAt(0).toUpperCase() + o.status.slice(1)}`)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderDownloads = () => (
    <div className="d-card">
      <h3 className="d-card__title">{t('dashboard.downloads')}</h3>
      {DOWNLOADS.length === 0 ? (
        <p className="d-empty">{t('dashboard.noDownloads')}</p>
      ) : (
        <div className="d-list">
          {DOWNLOADS.map((item, i) => (
            <div key={i} className="d-list__item">
              <div className="d-list__icon">📦</div>
              <div className="d-list__info">
                <strong>{item.title}</strong>
                <span>{item.version} &middot; {item.date} &middot; {item.size}</span>
              </div>
              <button className="d-list__action">{isRtl ? 'تحميل' : 'Download'}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFavorites = () => (
    <div className="d-card">
      <h3 className="d-card__title">{t('dashboard.favorites')}</h3>
      {FAVORITES.length === 0 ? (
        <p className="d-empty">{t('dashboard.noFavorites')}</p>
      ) : (
        <div className="d-grid d-grid--sm">
          {FAVORITES.map((item, i) => (
            <div key={i} className="d-fav-card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: `${item.color}10`, borderRadius: '0 0 0 999px' }} />
              <div className="d-fav-card__icon" style={{ position: 'relative', zIndex: 1, width: 56, height: 56, borderRadius: 14, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 12px' }}>
                <span style={{ fontSize: '1.5rem' }}>❤️</span>
              </div>
              <h4 style={{ position: 'relative', zIndex: 1 }}>{item.title}</h4>
              <span className="d-fav-card__price" style={{ position: 'relative', zIndex: 1 }}>${item.price}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="d-card">
      <h3 className="d-card__title">{t('dashboard.settings')}</h3>
      <form className="d-form" onSubmit={(e) => e.preventDefault()}>
        <div className="d-form__group">
          <label>{t('auth.fullName')}</label>
          <input type="text" defaultValue="Ahmed Mohammed" className="d-form__input" />
        </div>
        <div className="d-form__group">
          <label>{t('auth.email')}</label>
          <input type="email" defaultValue="ahmed@example.com" className="d-form__input" />
        </div>
        <div className="d-form__group">
          <label>{t('auth.phone')}</label>
          <input type="tel" defaultValue="+966 55 123 4567" className="d-form__input" />
        </div>
        <div className="d-form__group">
          <label>{isRtl ? 'البلد' : 'Country'}</label>
          <select className="d-form__input" defaultValue="SA" style={{ appearance: 'auto' }}>
            <option value="SA">{isRtl ? 'المملكة العربية السعودية' : 'Saudi Arabia'}</option>
            <option value="AE">{isRtl ? 'الإمارات العربية المتحدة' : 'UAE'}</option>
            <option value="KW">{isRtl ? 'الكويت' : 'Kuwait'}</option>
          </select>
        </div>
        <button type="submit" className="btn btn--primary" style={{ alignSelf: 'flex-start' }}>
          {isRtl ? 'حفظ التغييرات' : 'Save Changes'}
        </button>
      </form>
    </div>
  );

  const renderContent = () => {
    switch (tab) {
      case 'orders': return renderOrders();
      case 'downloads': return renderDownloads();
      case 'favorites': return renderFavorites();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  return (
    <div className="d-content">
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: 12 }}>
        {tabMeta.map((meta) => {
          const isActive = tab === meta.key;
          return (
            <Link
              key={meta.key}
              to={`/dashboard/buyer?tab=${meta.key}`}
              style={{
                padding: '8px 18px',
                borderRadius: 9999,
                fontSize: '0.8125rem',
                fontWeight: 600,
                textDecoration: 'none',
                background: isActive ? 'var(--color-primary-container)' : 'var(--color-surface-container-low)',
                color: isActive ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{meta.icon}</span>
              <span>{t(meta.labelKey)}</span>
            </Link>
          );
        })}
      </div>
      {renderContent()}
    </div>
  );
}