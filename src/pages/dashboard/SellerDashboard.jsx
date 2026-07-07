import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const PRODUCTS = [
  { id: 1, name: 'Nitec Pro UI Kit', price: 129, sales: 342, revenue: 44118, status: 'active', color: '#ff6201', initials: 'NP' },
  { id: 2, name: 'Dashboard Template Pro', price: 49, sales: 189, revenue: 9261, status: 'active', color: '#494bd6', initials: 'DT' },
  { id: 3, name: 'Abstract 3D Shape Pack', price: 29, sales: 520, revenue: 15080, status: 'active', color: '#10b981', initials: '3D' },
  { id: 4, name: 'E-Commerce App Template', price: 45, sales: 98, revenue: 4410, status: 'pending', color: '#f59e0b', initials: 'EC' },
  { id: 5, name: 'Fintech Admin Dashboard', price: 55, sales: 67, revenue: 3685, status: 'inactive', color: '#ef4444', initials: 'FA' },
];

const ORDERS = [
  { id: '#ORD-0451', date: '2026-07-06', customer: 'Ali Hassan', product: 'Nitec Pro UI Kit', amount: 129, status: 'completed', color: '#ff6201', initials: 'NP' },
  { id: '#ORD-0450', date: '2026-07-05', customer: 'Sara Khalid', product: 'Abstract 3D Pack', amount: 29, status: 'completed', color: '#10b981', initials: '3D' },
  { id: '#ORD-0449', date: '2026-07-04', customer: 'Mohammed Noor', product: 'Dashboard Pro', amount: 49, status: 'pending', color: '#494bd6', initials: 'DT' },
  { id: '#ORD-0448', date: '2026-07-03', customer: 'Nora Ali', product: 'Nitec Pro UI Kit', amount: 129, status: 'completed', color: '#ff6201', initials: 'NP' },
  { id: '#ORD-0447', date: '2026-07-02', customer: 'Fahad Omar', product: 'E-Commerce Template', amount: 45, status: 'cancelled', color: '#f59e0b', initials: 'EC' },
];

const PAYOUTS = [
  { date: '2026-07-01', amount: 3250.00, status: 'completed' },
  { date: '2026-06-15', amount: 2890.00, status: 'completed' },
  { date: '2026-06-01', amount: 4120.00, status: 'completed' },
  { date: '2026-05-15', amount: 1980.00, status: 'completed' },
];

const ALERTS = [
  { type: 'warning', titleKey: 'Low Stock Alert', descKey: '2 premium items are running low.' },
  { type: 'message', titleKey: 'New Customer Message', descKey: 'Regarding order #ORD-8921' },
];

function AnimatedCounter({ end, duration = 1500, suffix = '' }) {
  const [value, setValue] = useState(0);
  const frameRef = useRef();

  useEffect(() => {
    let startTime = null;
    const startValue = 0;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(now) {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      setValue(Math.floor(eased * (end - startValue) + startValue));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    }

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration]);

  return <>{value.toLocaleString()}{suffix}</>;
}

const avatarStyle = (color, initials, size = 40) => ({
  width: size,
  height: size,
  borderRadius: 10,
  background: `${color}18`,
  color: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: size * 0.35,
  flexShrink: 0,
});

export default function SellerDashboard() {
  const { t, dir } = useLanguage();
  const tab = new URLSearchParams(window.location.search).get('tab') || 'overview';

  const renderContent = () => {
    switch (tab) {
      case 'products':
        return (
          <div className="d-card" style={{ borderRadius: 20 }}>
            <div className="d-card__header">
              <h3 className="d-card__title">{t('dashboard.products')}</h3>
              <button className="btn btn--primary">{t('dashboard.addProduct')}</button>
            </div>
            <div className="d-table-wrap">
              <table className="d-table">
                <thead>
                  <tr>
                    <th>{t('dashboard.productName')}</th>
                    <th>{t('dashboard.productPrice')}</th>
                    <th>{t('dashboard.productSales')}</th>
                    <th>{t('dashboard.productRevenue')}</th>
                    <th>{t('dashboard.productStatus')}</th>
                    <th>{dir === 'rtl' ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {PRODUCTS.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={avatarStyle(p.color, p.initials)}>{p.initials}</div>
                          <strong>{p.name}</strong>
                        </div>
                      </td>
                      <td>${p.price}</td>
                      <td>{p.sales}</td>
                      <td>${p.revenue.toLocaleString()}</td>
                      <td><span className={`d-badge d-badge--${p.status}`}>{t(`dashboard.status${p.status.charAt(0).toUpperCase() + p.status.slice(1)}`)}</span></td>
                      <td>
                        <div className="d-actions">
                          <button className="d-actions__btn">{t('dashboard.editProduct')}</button>
                          <button className="d-actions__btn d-actions__btn--danger">{t('dashboard.deleteProduct')}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="d-card" style={{ borderRadius: 20 }}>
            <h3 className="d-card__title">{t('dashboard.orders')}</h3>
            <div className="d-table-wrap">
              <table className="d-table">
                <thead>
                  <tr>
                    <th>{t('dashboard.orderId')}</th>
                    <th>{t('dashboard.orderDate')}</th>
                    <th>{t('dashboard.orderCustomer')}</th>
                    <th>{t('dashboard.productName')}</th>
                    <th>{t('dashboard.orderAmount')}</th>
                    <th>{t('dashboard.orderStatus')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ORDERS.map((o) => (
                    <tr key={o.id}>
                      <td className="d-table__id">{o.id}</td>
                      <td>{o.date}</td>
                      <td>{o.customer}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={avatarStyle(o.color, o.initials, 32)}>{o.initials}</div>
                          {o.product}
                        </div>
                      </td>
                      <td>${o.amount}</td>
                      <td><span className={`d-badge d-badge--${o.status}`}>{t(`dashboard.order${o.status.charAt(0).toUpperCase() + o.status.slice(1)}`)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="d-card" style={{ borderRadius: 20 }}>
            <h3 className="d-card__title">{t('dashboard.analytics')}</h3>
            <p className="d-empty" style={{ padding: '40px 0', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-secondary)' }}>
              {dir === 'rtl' ? 'التحليلات والإحصائيات قريباً' : 'Analytics & statistics coming soon'}
            </p>
          </div>
        );

      case 'payouts':
        return (
          <div className="d-card" style={{ borderRadius: 20 }}>
            <h3 className="d-card__title">{t('dashboard.payouts')}</h3>
            <div className="d-balance" style={{ borderRadius: 16, background: 'linear-gradient(135deg, var(--color-primary-fixed) 0%, #fff5ed 100%)', border: '1px solid var(--color-outline-variant)' }}>
              <span className="d-balance__label">{dir === 'rtl' ? 'الرصيد الحالي' : 'Current Balance'}</span>
              <span className="d-balance__amount" style={{ fontSize: '2.5rem' }}>$<AnimatedCounter end={12847} />.50</span>
            </div>
            <div className="d-table-wrap" style={{ marginTop: 24 }}>
              <table className="d-table">
                <thead>
                  <tr>
                    <th>{dir === 'rtl' ? 'التاريخ' : 'Date'}</th>
                    <th>{dir === 'rtl' ? 'المبلغ' : 'Amount'}</th>
                    <th>{dir === 'rtl' ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {PAYOUTS.map((p, i) => (
                    <tr key={i}>
                      <td>{p.date}</td>
                      <td>${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td><span className="d-badge d-badge--completed">{dir === 'rtl' ? 'مكتمل' : 'Completed'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="d-card" style={{ borderRadius: 20 }}>
            <h3 className="d-card__title">{t('dashboard.settings')}</h3>
            <form className="d-form" onSubmit={(e) => e.preventDefault()}>
              <div className="d-form__group">
                <label>{t('auth.storeName')}</label>
                <input type="text" defaultValue="Creative Studio X" className="d-form__input" />
              </div>
              <div className="d-form__group">
                <label>{t('auth.storeDesc')}</label>
                <textarea className="d-form__input d-form__textarea" rows={3} defaultValue="Premium UI Kits & Digital Assets" />
              </div>
              <div className="d-form__row">
                <div className="d-form__group">
                  <label>{t('auth.email')}</label>
                  <input type="email" defaultValue="store@creativestudio.com" className="d-form__input" />
                </div>
                <div className="d-form__group">
                  <label>{t('auth.phone')}</label>
                  <input type="tel" defaultValue="+1 555 123 4567" className="d-form__input" />
                </div>
              </div>
              <button type="submit" className="btn btn--primary" style={{ alignSelf: 'flex-start' }}>
                {dir === 'rtl' ? 'حفظ التغييرات' : 'Save Changes'}
              </button>
            </form>
          </div>
        );

      default:
        return (
          <>
            <div className="d-welcome">
              <h2 className="d-welcome__title">{t('dashboard.welcome')}</h2>
              <p className="d-welcome__sub">{dir === 'rtl' ? 'إدارة متجرك ومنتجاتك بكل سهولة' : 'Manage your store and products with ease'}</p>
              <Link to="/dashboard/seller?tab=products" className="btn btn--primary">{t('dashboard.manageStore')}</Link>
            </div>

            <div className="d-stats">
              <div className="d-stat" style={{ position: 'relative', overflow: 'hidden', backdropFilter: 'blur(12px)', background: 'var(--color-surface-container-lowest)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,98,1,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--color-primary)' }}>$</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 10px', borderRadius: 9999 }}>+14.5%</span>
                </div>
                <span className="d-stat__value" style={{ fontSize: '1.75rem' }}>$<AnimatedCounter end={48290} /></span>
                <span className="d-stat__label">{t('dashboard.totalRevenue')}</span>
              </div>
              <div className="d-stat" style={{ position: 'relative', overflow: 'hidden', backdropFilter: 'blur(12px)', background: 'var(--color-surface-container-lowest)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(73,75,214,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#494bd6' }}>S</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 10px', borderRadius: 9999 }}>+5.2%</span>
                </div>
                <span className="d-stat__value" style={{ fontSize: '1.75rem', color: '#494bd6' }}><AnimatedCounter end={1216} /></span>
                <span className="d-stat__label">{t('dashboard.totalSales')}</span>
              </div>
              <div className="d-stat" style={{ position: 'relative', overflow: 'hidden', backdropFilter: 'blur(12px)', background: 'var(--color-surface-container-lowest)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
                <div style={{ position: 'absolute', right: -16, top: -16, opacity: 0.05, fontSize: 100, color: 'var(--color-primary)' }}>★</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,98,1,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--color-primary)' }}>★</div>
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                    <span className="d-stat__value" style={{ fontSize: '1.75rem', color: 'var(--color-primary-container)' }}>4.8</span>
                    <span style={{ fontSize: 12, color: 'var(--color-secondary)', marginBottom: 6 }}>/ 5.0</span>
                  </div>
                  <span className="d-stat__label">{dir === 'rtl' ? 'تقييم المتجر' : 'Store Rating'}</span>
                </div>
              </div>
            </div>

            <div className="d-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="d-card" style={{ borderRadius: 20, marginBottom: 0 }}>
                <div className="d-card__header">
                  <h3 className="d-card__title" style={{ marginBottom: 0 }}>{t('dashboard.topProducts')}</h3>
                  <Link to="/dashboard/seller?tab=products" style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>{t('dashboard.viewAll')}</Link>
                </div>
                <div className="d-table-wrap">
                  <table className="d-table">
                    <thead>
                      <tr>
                        <th>{t('dashboard.productName')}</th>
                        <th>{t('dashboard.productSales')}</th>
                        <th>{t('dashboard.productRevenue')}</th>
                        <th>{t('dashboard.productStatus')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PRODUCTS.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={avatarStyle(p.color, p.initials, 34)}>{p.initials}</div>
                              <strong style={{ fontSize: 13 }}>{p.name}</strong>
                            </div>
                          </td>
                          <td>{p.sales}</td>
                          <td style={{ fontWeight: 700, color: 'var(--color-primary-container)' }}>${p.revenue.toLocaleString()}</td>
                          <td><span className={`d-badge d-badge--${p.status}`}>{t(`dashboard.status${p.status.charAt(0).toUpperCase() + p.status.slice(1)}`)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="d-card" style={{ borderRadius: 20, marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                <h3 className="d-card__title">{dir === 'rtl' ? 'إجراءات مطلوبة' : 'Action Needed'}</h3>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {ALERTS.map((a, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      gap: 14,
                      padding: 16,
                      borderRadius: 14,
                      background: a.type === 'warning' ? 'rgba(186,26,26,0.06)' : 'var(--color-surface-container-low)',
                      border: a.type === 'warning' ? '1px solid rgba(186,26,26,0.12)' : '1px solid var(--color-outline-variant)',
                    }}>
                      <div style={{ fontSize: 20, color: a.type === 'warning' ? 'var(--color-error)' : 'var(--color-secondary)', marginTop: 1 }}>
                        {a.type === 'warning' ? '⚠' : '💬'}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-on-surface)', margin: 0 }}>{a.titleKey}</h4>
                        <p style={{ fontSize: 12, color: 'var(--color-secondary)', margin: '4px 0 0' }}>{a.descKey}</p>
                        <button style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', background: 'none', border: 'none', padding: 0, marginTop: 8, cursor: 'pointer' }}>
                          {a.type === 'warning' ? (dir === 'rtl' ? 'إعادة التخزين' : 'Restock Now') : (dir === 'rtl' ? 'رد' : 'Reply')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="d-card" style={{ borderRadius: 20 }}>
              <div className="d-card__header">
                <h3 className="d-card__title" style={{ marginBottom: 0 }}>{t('dashboard.recentOrders')}</h3>
                <Link to="/dashboard/seller?tab=orders" style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>{t('dashboard.viewAll')}</Link>
              </div>
              <div className="d-table-wrap">
                <table className="d-table">
                  <thead>
                    <tr>
                      <th>{t('dashboard.orderId')}</th>
                      <th>{t('dashboard.productName')}</th>
                      <th>{t('dashboard.orderDate')}</th>
                      <th>{t('dashboard.orderAmount')}</th>
                      <th>{t('dashboard.orderStatus')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ORDERS.map((o) => (
                      <tr key={o.id}>
                        <td className="d-table__id">{o.id}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={avatarStyle(o.color, o.initials, 32)}>{o.initials}</div>
                            {o.product}
                          </div>
                        </td>
                        <td>{o.date}</td>
                        <td style={{ fontWeight: 700 }}>${o.amount}</td>
                        <td><span className={`d-badge d-badge--${o.status}`}>{t(`dashboard.order${o.status.charAt(0).toUpperCase() + o.status.slice(1)}`)}</span></td>
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

  return <div className="d-content">{renderContent()}</div>;
}
