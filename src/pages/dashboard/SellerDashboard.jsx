import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const PRODUCTS = [
  { name: 'Nitec Pro UI Kit', price: 129, sales: 342, revenue: 44118, status: 'active' },
  { name: 'Dashboard Template Pro', price: 49, sales: 189, revenue: 9261, status: 'active' },
  { name: 'Abstract 3D Shape Pack', price: 29, sales: 520, revenue: 15080, status: 'active' },
  { name: 'E-Commerce App Template', price: 45, sales: 98, revenue: 4410, status: 'pending' },
  { name: 'Fintech Admin Dashboard', price: 55, sales: 67, revenue: 3685, status: 'inactive' },
];

const ORDERS = [
  { id: '#ORD-0451', date: '2026-07-06', customer: 'Ali Hassan', product: 'Nitec Pro UI Kit', amount: 129, status: 'completed' },
  { id: '#ORD-0450', date: '2026-07-05', customer: 'Sara Khalid', product: 'Abstract 3D Pack', amount: 29, status: 'completed' },
  { id: '#ORD-0449', date: '2026-07-04', customer: 'Mohammed Noor', product: 'Dashboard Pro', amount: 49, status: 'pending' },
  { id: '#ORD-0448', date: '2026-07-03', customer: 'Nora Ali', product: 'Nitec Pro UI Kit', amount: 129, status: 'completed' },
  { id: '#ORD-0447', date: '2026-07-02', customer: 'Fahad Omar', product: 'E-Commerce Template', amount: 45, status: 'cancelled' },
];

export default function SellerDashboard() {
  const { t, dir } = useLanguage();
  const tab = new URLSearchParams(window.location.search).get('tab') || 'overview';

  const renderContent = () => {
    switch (tab) {
      case 'products':
        return (
          <div className="d-card">
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
                  {PRODUCTS.map((p, i) => (
                    <tr key={i}>
                      <td><strong>{p.name}</strong></td>
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
          <div className="d-card">
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
                      <td>{o.product}</td>
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
          <div className="d-card">
            <h3 className="d-card__title">{t('dashboard.analytics')}</h3>
            <p className="d-empty" style={{ padding: '40px 0', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-secondary)' }}>
              {dir === 'rtl' ? 'التحليلات والإحصائيات قريباً' : 'Analytics & statistics coming soon'}
            </p>
          </div>
        );

      case 'payouts':
        return (
          <div className="d-card">
            <h3 className="d-card__title">{t('dashboard.payouts')}</h3>
            <div className="d-balance">
              <span className="d-balance__label">{dir === 'rtl' ? 'الرصيد الحالي' : 'Current Balance'}</span>
              <span className="d-balance__amount">$12,847.50</span>
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
                  <tr><td>2026-07-01</td><td>$3,250.00</td><td><span className="d-badge d-badge--completed">{dir === 'rtl' ? 'مكتمل' : 'Completed'}</span></td></tr>
                  <tr><td>2026-06-15</td><td>$2,890.00</td><td><span className="d-badge d-badge--completed">{dir === 'rtl' ? 'مكتمل' : 'Completed'}</span></td></tr>
                  <tr><td>2026-06-01</td><td>$4,120.00</td><td><span className="d-badge d-badge--completed">{dir === 'rtl' ? 'مكتمل' : 'Completed'}</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="d-card">
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
              <div className="d-stat"><span className="d-stat__value">$76,554</span><span className="d-stat__label">{t('dashboard.totalRevenue')}</span></div>
              <div className="d-stat"><span className="d-stat__value">1,216</span><span className="d-stat__label">{t('dashboard.totalSales')}</span></div>
              <div className="d-stat"><span className="d-stat__value">5</span><span className="d-stat__label">{t('dashboard.totalProducts')}</span></div>
            </div>

            <div className="d-grid">
              <Link to="/dashboard/seller?tab=products" className="d-quick-card">
                <span className="d-quick-card__icon">📦</span>
                <span>{t('dashboard.products')}</span>
              </Link>
              <Link to="/dashboard/seller?tab=orders" className="d-quick-card">
                <span className="d-quick-card__icon">📋</span>
                <span>{t('dashboard.orders')}</span>
              </Link>
              <Link to="/dashboard/seller?tab=analytics" className="d-quick-card">
                <span className="d-quick-card__icon">📈</span>
                <span>{t('dashboard.analytics')}</span>
              </Link>
              <Link to="/dashboard/seller?tab=payouts" className="d-quick-card">
                <span className="d-quick-card__icon">💰</span>
                <span>{t('dashboard.payouts')}</span>
              </Link>
            </div>

            <div className="d-card">
              <div className="d-card__header">
                <h3 className="d-card__title">{t('dashboard.topProducts')}</h3>
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
                    </tr>
                  </thead>
                  <tbody>
                    {PRODUCTS.slice(0, 3).map((p, i) => (
                      <tr key={i}>
                        <td><strong>{p.name}</strong></td>
                        <td>${p.price}</td>
                        <td>{p.sales}</td>
                        <td>${p.revenue.toLocaleString()}</td>
                        <td><span className={`d-badge d-badge--${p.status}`}>{t(`dashboard.status${p.status.charAt(0).toUpperCase() + p.status.slice(1)}`)}</span></td>
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
