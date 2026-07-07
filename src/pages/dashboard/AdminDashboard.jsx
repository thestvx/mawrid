import { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const USERS = [
  { name: 'Ahmed Ali', email: 'ahmed@example.com', role: 'seller', status: 'verified', joined: '2026-01-15' },
  { name: 'Sara Khalid', email: 'sara@example.com', role: 'buyer', status: 'active', joined: '2026-03-20' },
  { name: 'Mohammed Noor', email: 'mohammed@example.com', role: 'seller', status: 'unverified', joined: '2026-05-10' },
  { name: 'Nora Ali', email: 'nora@example.com', role: 'buyer', status: 'active', joined: '2026-02-14' },
  { name: 'Fahad Omar', email: 'fahad@example.com', role: 'seller', status: 'verified', joined: '2025-11-01' },
];

const PENDING_PRODUCTS = [
  { name: 'E-Commerce App Template', seller: 'Mohammed Noor', submitted: '2026-07-04' },
  { name: 'Social Media Kit Pro', seller: 'Nora Designs', submitted: '2026-07-03' },
  { name: 'WordPress Theme Pack', seller: 'Creative Studio X', submitted: '2026-07-02' },
];

const VENDOR_QUEUE = [
  { initials: 'AZ', name: 'Azure Tech Supplies', id: 'V-8892', type: 'Electronics', date: 'Today, 09:41 AM', status: 'review', color: '#8589ff' },
  { initials: 'OL', name: 'Oasis Logistics', id: 'V-8890', type: 'Services', date: 'Yesterday', status: 'docs', color: '#e1e3e4' },
  { initials: 'NM', name: 'Nova Manufacturing', id: 'V-8885', type: 'Industrial', date: 'Oct 24, 2023', status: 'flagged', color: '#2f2ebe' },
];

const ALERTS = [
  { type: 'error', title: 'High Chargeback Rate', desc: "Vendor 'TechNova' has exceeded the 2% chargeback threshold in the last 7 days.", action: 'Action Required' },
  { type: 'warning', title: 'API Rate Limit Approaching', desc: 'Payment gateway API calls at 85% capacity for current hour.', action: '12 mins ago' },
];

function useAnimatedNumber(target, duration = 2500, prefix = '', suffix = '') {
  const [display, setDisplay] = useState(prefix + '0' + suffix);
  const prevTarget = useRef(0);

  useEffect(() => {
    const start = prevTarget.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + eased * diff;
      const formatted = Number.isInteger(target) ? Math.floor(current).toLocaleString() : current.toFixed(2);
      setDisplay(prefix + formatted + suffix);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
    prevTarget.current = target;
  }, [target, duration, prefix, suffix]);

  return display;
}

function InitialsAvatar({ name, bg, size = 40 }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 10,
      background: bg || 'var(--color-secondary-container)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: size > 36 ? '0.875rem' : '0.75rem',
      color: 'var(--color-on-secondary-container)',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function StatCard({ label, value, suffix, prefix, trend, trendLabel, trendColor, icon, iconBg, glowColor, delay }) {
  const displayValue = useAnimatedNumber(value, 2500, prefix || '', suffix || '');

  return (
    <div className="d-stat" style={{
      position: 'relative',
      overflow: 'hidden',
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      transition: 'all 0.3s ease',
      animation: `fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
      animationDelay: `${delay}ms`,
      opacity: 0,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{
        position: 'absolute',
        right: -16,
        top: -16,
        width: 96,
        height: 96,
        borderRadius: '50%',
        background: glowColor || 'rgba(255, 98, 1, 0.08)',
        filter: 'blur(24px)',
        pointerEvents: 'none',
        transition: 'all 0.5s ease',
      }} className="stat-glow" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, position: 'relative', zIndex: 1 }}>
        <div>
          <span className="d-stat__label" style={{ display: 'block', marginBottom: 4 }}>{label}</span>
          <span className="d-stat__value" style={{ fontSize: '1.75rem' }}>{displayValue}</span>
        </div>
        <div style={{
          padding: 12,
          borderRadius: 12,
          background: iconBg || 'rgba(255, 98, 1, 0.08)',
          color: 'var(--color-primary)',
          fontSize: '1.5rem',
          lineHeight: 1,
          transition: 'transform 0.3s ease',
        }} className="stat-icon">
          {icon}
        </div>
      </div>
      {trend && trendLabel ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 }}>
          <span style={{
            color: trendColor || '#166534',
            background: trendColor ? `${trendColor}15` : '#dcfce7',
            padding: '2px 10px',
            borderRadius: 9999,
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
            {trend}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>{trendLabel}</span>
        </div>
      ) : trend ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 }}>
          <span style={{
            color: trendColor || '#991b1b',
            background: trendColor ? `${trendColor}15` : '#fee2e2',
            padding: '2px 10px',
            borderRadius: 9999,
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
          }}>
            {trend}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function VendorStatusBadge({ status, dir: direction }) {
  const config = {
    review: { bg: 'rgba(255, 98, 1, 0.08)', color: 'var(--color-primary)', border: 'rgba(255, 98, 1, 0.2)', dot: 'var(--color-primary)', label: direction === 'rtl' ? 'مراجعة' : 'Review' },
    docs: { bg: 'var(--color-surface-container-low)', color: 'var(--color-on-surface-variant)', border: 'var(--color-outline-variant)', dot: 'var(--color-on-surface-variant)', label: direction === 'rtl' ? 'مستندات معلقة' : 'Docs Pending' },
    flagged: { bg: 'rgba(186, 26, 26, 0.08)', color: 'var(--color-error)', border: 'rgba(186, 26, 26, 0.2)', dot: 'var(--color-error)', label: direction === 'rtl' ? 'مُعلّم' : 'Flagged' },
  };
  const c = config[status] || config.review;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 12px',
      borderRadius: 9999,
      fontSize: '0.75rem',
      fontWeight: 600,
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }} />
      {c.label}
    </span>
  );
}

export default function AdminDashboard() {
  const { t, dir } = useLanguage();
  const tab = new URLSearchParams(window.location.search).get('tab') || 'overview';

  const sellerProductCounts = useRef(USERS.filter(u => u.role === 'seller').map(() => Math.floor(Math.random() * 20) + 1));

  const renderContent = () => {
    switch (tab) {
      case 'users':
        return (
          <div className="d-card">
            <h3 className="d-card__title">{t('dashboard.userManagement')}</h3>
            <div className="d-table-wrap">
              <table className="d-table">
                <thead>
                  <tr>
                    <th>{dir === 'rtl' ? 'الاسم' : 'Name'}</th>
                    <th>{t('dashboard.sellerEmail')}</th>
                    <th>{dir === 'rtl' ? 'الدور' : 'Role'}</th>
                    <th>{t('dashboard.sellerStatus')}</th>
                    <th>{dir === 'rtl' ? 'تاريخ التسجيل' : 'Joined'}</th>
                    <th>{dir === 'rtl' ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {USERS.map((u, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <InitialsAvatar name={u.name} bg={i % 2 === 0 ? '#8589ff20' : '#ff620120'} />
                          <strong>{u.name}</strong>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td><span className={`d-badge ${u.role === 'seller' ? 'd-badge--seller' : 'd-badge--buyer'}`}>{t(`dashboard.role.${u.role}`)}</span></td>
                      <td><span className={`d-badge d-badge--${u.status === 'verified' ? 'completed' : u.status === 'active' ? 'active' : 'pending'}`}>{t(`dashboard.seller${u.status.charAt(0).toUpperCase() + u.status.slice(1)}`)}</span></td>
                      <td>{u.joined}</td>
                      <td>
                        <div className="d-actions">
                          <button className="d-actions__btn">{t('dashboard.approve')}</button>
                          <button className="d-actions__btn d-actions__btn--danger">{t('dashboard.ban')}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'sellers':
        return (
          <div className="d-card">
            <h3 className="d-card__title">{t('dashboard.sellerManagement')}</h3>
            <div className="d-table-wrap">
              <table className="d-table">
                <thead>
                  <tr>
                    <th>{t('dashboard.sellerName')}</th>
                    <th>{t('dashboard.sellerStore')}</th>
                    <th>{t('dashboard.sellerEmail')}</th>
                    <th>{t('dashboard.sellerProducts')}</th>
                    <th>{t('dashboard.sellerStatus')}</th>
                    <th>{dir === 'rtl' ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {USERS.filter(u => u.role === 'seller').map((u, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <InitialsAvatar name={u.name} bg={i % 2 === 0 ? '#8589ff20' : '#2f2ebe20'} />
                          <strong>{u.name}</strong>
                        </div>
                      </td>
                      <td>{dir === 'rtl' ? 'متجر إبداعي' : 'Creative Store'}</td>
                      <td>{u.email}</td>
                      <td>{sellerProductCounts.current[i]}</td>
                      <td><span className={`d-badge d-badge--${u.status === 'verified' ? 'completed' : 'pending'}`}>{t(`dashboard.seller${u.status.charAt(0).toUpperCase() + u.status.slice(1)}`)}</span></td>
                      <td>
                        <div className="d-actions">
                          <button className="d-actions__btn">{t('dashboard.approve')}</button>
                          <button className="d-actions__btn d-actions__btn--danger">{t('dashboard.reject')}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="d-card">
            <h3 className="d-card__title">{t('dashboard.productModeration')}</h3>
            {PENDING_PRODUCTS.length === 0 ? (
              <p className="d-empty">{dir === 'rtl' ? 'لا توجد منتجات بانتظار المراجعة' : 'No products pending review'}</p>
            ) : (
              <div className="d-table-wrap">
                <table className="d-table">
                  <thead>
                    <tr>
                      <th>{t('dashboard.productName')}</th>
                      <th>{t('dashboard.sellerName')}</th>
                      <th>{dir === 'rtl' ? 'تاريخ التقديم' : 'Submitted'}</th>
                      <th>{dir === 'rtl' ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PENDING_PRODUCTS.map((p, i) => (
                      <tr key={i}>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.seller}</td>
                        <td>{p.submitted}</td>
                        <td>
                          <div className="d-actions">
                            <button className="d-actions__btn d-actions__btn--approve">{t('dashboard.approve')}</button>
                            <button className="d-actions__btn d-actions__btn--danger">{t('dashboard.reject')}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'reports':
        return (
          <div className="d-card">
            <h3 className="d-card__title">{t('dashboard.reports')}</h3>
            <p className="d-empty" style={{ padding: '40px 0', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-secondary)' }}>
              {dir === 'rtl' ? 'التقارير قريباً' : 'Reports coming soon'}
            </p>
          </div>
        );

      case 'settings':
        return (
          <div className="d-card">
            <h3 className="d-card__title">{t('dashboard.platformSettings')}</h3>
            <form className="d-form" onSubmit={(e) => e.preventDefault()}>
              <div className="d-form__group">
                <label>{dir === 'rtl' ? 'اسم المنصة' : 'Platform Name'}</label>
                <input type="text" defaultValue="Mawrid" className="d-form__input" />
              </div>
              <div className="d-form__group">
                <label>{dir === 'rtl' ? 'نسبة عمولة المنصة (%)' : 'Platform Commission (%)'}</label>
                <input type="number" defaultValue={15} className="d-form__input" />
              </div>
              <div className="d-form__group">
                <label>{dir === 'rtl' ? 'الحد الأدنى للسحب' : 'Minimum Payout'}</label>
                <input type="number" defaultValue={50} className="d-form__input" />
              </div>
              <div className="d-form__group">
                <label>{dir === 'rtl' ? 'البريد الإلكتروني للدعم' : 'Support Email'}</label>
                <input type="email" defaultValue="support@mawrid.com" className="d-form__input" />
              </div>
              <button type="submit" className="btn btn--primary" style={{ alignSelf: 'flex-start' }}>
                {dir === 'rtl' ? 'حفظ الإعدادات' : 'Save Settings'}
              </button>
            </form>
          </div>
        );

      default:
        return (
          <>
            <div className="d-welcome" style={{ animation: 'fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
              <h2 className="d-welcome__title">{t('dashboard.welcome')}</h2>
              <p className="d-welcome__sub">{dir === 'rtl' ? 'إدارة المنصة بالكامل من هنا' : 'Manage the entire platform from here'}</p>
            </div>

            <div className="d-stats">
              <StatCard
                label={dir === 'rtl' ? 'إجمالي قيمة المعاملات (30 يوم)' : 'Total GMV (30d)'}
                value={1.24}
                prefix="$"
                suffix="M"
                trend="↑ 12.5%"
                trendLabel={dir === 'rtl' ? 'مقارنة بالشهر الماضي' : 'vs last month'}
                trendColor="#166534"
                icon="📈"
                iconBg="rgba(255, 98, 1, 0.08)"
                glowColor="rgba(255, 98, 1, 0.15)"
                delay={200}
              />
              <StatCard
                label={dir === 'rtl' ? 'البائعون النشطون' : 'Active Vendors'}
                value={842}
                trend="↑ 4.2%"
                trendLabel={dir === 'rtl' ? 'مقارنة بالشهر الماضي' : 'vs last month'}
                trendColor="#166534"
                icon="🏪"
                iconBg="rgba(133, 137, 255, 0.08)"
                glowColor="rgba(133, 137, 255, 0.15)"
                delay={300}
              />
              <StatCard
                label={dir === 'rtl' ? 'بانتظار الموافقة' : 'Pending Approvals'}
                value={28}
                trend={dir === 'rtl' ? 'يتطلب انتباهاً' : 'Requires attention'}
                trendColor="#991b1b"
                icon="⏳"
                iconBg="rgba(186, 26, 26, 0.08)"
                glowColor="rgba(186, 26, 26, 0.15)"
                delay={400}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: 24,
              marginBottom: 32,
            }}>
              <div className="d-card" style={{
                marginBottom: 0,
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                animation: 'fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 400ms forwards',
                opacity: 0,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 className="d-card__title" style={{ marginBottom: 0 }}>{dir === 'rtl' ? 'قائمة التحقق من البائعين' : 'Vendor Verification Queue'}</h3>
                  <a href="#" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)' }} onClick={e => e.preventDefault()}>
                    {dir === 'rtl' ? 'عرض الكل' : 'View All'}
                  </a>
                </div>
                <div className="d-table-wrap">
                  <table className="d-table">
                    <thead>
                      <tr>
                        <th>{dir === 'rtl' ? 'المتقدم' : 'Applicant'}</th>
                        <th>{dir === 'rtl' ? 'نوع النشاط' : 'Business Type'}</th>
                        <th>{dir === 'rtl' ? 'تاريخ التقديم' : 'Date Applied'}</th>
                        <th>{dir === 'rtl' ? 'الحالة' : 'Status'}</th>
                        <th style={{ textAlign: dir === 'rtl' ? 'left' : 'right' }}>{dir === 'rtl' ? 'إجراء' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {VENDOR_QUEUE.map((v, i) => (
                        <tr key={i}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <InitialsAvatar name={v.name} bg={v.color + '20'} size={40} />
                              <div>
                                <p style={{ fontWeight: 600, margin: 0, fontSize: '0.875rem' }}>{v.name}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', margin: 0 }}>ID: {v.id}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ color: 'var(--color-secondary)' }}>{v.type}</td>
                          <td style={{ color: 'var(--color-secondary)' }}>{v.date}</td>
                          <td><VendorStatusBadge status={v.status} dir={dir} /></td>
                          <td style={{ textAlign: dir === 'rtl' ? 'left' : 'right' }}>
                            <button style={{
                              color: 'var(--color-primary)',
                              background: 'transparent',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              fontSize: '1rem',
                              opacity: 0.4,
                              transition: 'all 0.3s',
                            }}
                              onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = dir === 'rtl' ? 'translateX(-4px)' : 'translateX(4px)'; }}
                              onMouseLeave={e => { e.currentTarget.style.opacity = '0.4'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                              {dir === 'rtl' ? '←' : '→'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="d-card" style={{
                marginBottom: 0,
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                animation: 'fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 500ms forwards',
                opacity: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <span style={{ color: 'var(--color-error)', fontSize: '1.25rem' }}>⚠️</span>
                  <h3 className="d-card__title" style={{ marginBottom: 0 }}>{dir === 'rtl' ? 'تنبيهات حرجة' : 'Critical Alerts'}</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {ALERTS.map((a, i) => (
                    <div key={i} style={{
                      padding: 16,
                      borderRadius: 12,
                      background: a.type === 'error' ? 'rgba(186, 26, 26, 0.08)' : 'var(--color-surface-container-low)',
                      border: `1px solid ${a.type === 'error' ? 'rgba(186, 26, 26, 0.15)' : 'var(--color-outline-variant)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: a.type === 'error' ? 'var(--color-error)' : 'var(--color-primary)',
                          marginTop: 6,
                          flexShrink: 0,
                        }} />
                        <div>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 4px', color: 'var(--color-on-surface)' }}>{a.title}</h4>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)', margin: 0, lineHeight: 1.4 }}>{a.desc}</p>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: a.type === 'error' ? 'var(--color-error)' : 'var(--color-secondary)',
                            marginTop: 8,
                            display: 'inline-block',
                          }}>
                            {a.action}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button style={{
                  width: '100%',
                  marginTop: 20,
                  padding: '10px 0',
                  borderRadius: 12,
                  border: '1px solid var(--color-outline-variant)',
                  background: 'transparent',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  color: 'var(--color-on-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}>
                  {dir === 'rtl' ? 'عرض جميع التنبيهات' : 'View All Alerts'}
                </button>
              </div>
            </div>

            <div className="d-grid">
              <a href="/owner?tab=users" className="d-quick-card" onClick={(e) => { e.preventDefault(); window.location.href = '/owner?tab=users'; }}>
                <span className="d-quick-card__icon">👥</span>
                <span>{t('dashboard.userManagement')}</span>
              </a>
              <a href="/owner?tab=sellers" className="d-quick-card" onClick={(e) => { e.preventDefault(); window.location.href = '/owner?tab=sellers'; }}>
                <span className="d-quick-card__icon">🏪</span>
                <span>{t('dashboard.sellerManagement')}</span>
              </a>
              <a href="/owner?tab=products" className="d-quick-card" onClick={(e) => { e.preventDefault(); window.location.href = '/owner?tab=products'; }}>
                <span className="d-quick-card__icon">📦</span>
                <span>{t('dashboard.productModeration')}</span>
              </a>
              <a href="/owner?tab=reports" className="d-quick-card" onClick={(e) => { e.preventDefault(); window.location.href = '/owner?tab=reports'; }}>
                <span className="d-quick-card__icon">📄</span>
                <span>{t('dashboard.reports')}</span>
              </a>
            </div>

            <div className="d-card">
              <h3 className="d-card__title">{t('dashboard.pendingApproval')}</h3>
              <div className="d-table-wrap">
                <table className="d-table">
                  <thead>
                    <tr>
                      <th>{t('dashboard.productName')}</th>
                      <th>{t('dashboard.sellerName')}</th>
                      <th>{dir === 'rtl' ? 'تاريخ التقديم' : 'Submitted'}</th>
                      <th>{dir === 'rtl' ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PENDING_PRODUCTS.map((p, i) => (
                      <tr key={i}>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.seller}</td>
                        <td>{p.submitted}</td>
                        <td>
                          <div className="d-actions">
                            <button className="d-actions__btn d-actions__btn--approve">{t('dashboard.approve')}</button>
                            <button className="d-actions__btn d-actions__btn--danger">{t('dashboard.reject')}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .d-stat:hover .stat-icon {
          transform: scale(1.1);
        }
        .d-stat:hover .stat-glow {
          transform: scale(1.2);
        }
      `}</style>
      <div className="d-content">{renderContent()}</div>
    </>
  );
}
