import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const RECENT_ORDERS = [
  { id: '#ORD-001', date: '2026-07-05', product: 'Nitec Pro UI Kit', amount: 129, status: 'completed' },
  { id: '#ORD-002', date: '2026-07-03', product: 'ChatGPT Pro Subscription', amount: 19.99, status: 'completed' },
  { id: '#ORD-003', date: '2026-06-28', product: 'Dashboard Template', amount: 49, status: 'pending' },
];

const FAVORITES = [
  { title: 'Abstract 3D Shape Pack', price: 29, image: '🎨' },
  { title: 'Fintech Admin Dashboard', price: 55, image: '📊' },
  { title: 'Corporate Vector Pack', price: 24, image: '📄' },
];

const DOWNLOADS = [
  { title: 'Nitec Pro UI Kit', date: '2026-07-05', size: '145 MB' },
  { title: 'Smart Watch WH22-6 Guide', date: '2026-06-20', size: '12 MB' },
];

export default function BuyerDashboard() {
  const { t, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  const tab = new URLSearchParams(window.location.search).get('tab') || 'overview';

  const renderContent = () => {
    switch (tab) {
      case 'orders':
        return (
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

      case 'downloads':
        return (
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
                      <span>{item.date} &middot; {item.size}</span>
                    </div>
                    <button className="d-list__action">{dir === 'rtl' ? 'تحميل' : 'Download'}</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'favorites':
        return (
          <div className="d-card">
            <h3 className="d-card__title">{t('dashboard.favorites')}</h3>
            {FAVORITES.length === 0 ? (
              <p className="d-empty">{t('dashboard.noFavorites')}</p>
            ) : (
              <div className="d-grid d-grid--sm">
                {FAVORITES.map((item, i) => (
                  <div key={i} className="d-fav-card">
                    <div className="d-fav-card__icon">{item.image}</div>
                    <h4>{item.title}</h4>
                    <span className="d-fav-card__price">${item.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'settings':
        return (
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
              <p className="d-welcome__sub">{dir === 'rtl' ? 'تصفح أحدث المنتجات في السوق' : 'Browse the latest products in the marketplace'}</p>
              <Link to="/marketplace" className="btn btn--primary">{t('dashboard.browseMarketplace')}</Link>
            </div>

            <div className="d-stats">
              <div className="d-stat"><span className="d-stat__value">3</span><span className="d-stat__label">{t('dashboard.totalOrders')}</span></div>
              <div className="d-stat"><span className="d-stat__value">4</span><span className="d-stat__label">{t('dashboard.totalProducts')}</span></div>
              <div className="d-stat"><span className="d-stat__value">$197.99</span><span className="d-stat__label">{t('dashboard.totalRevenue')}</span></div>
            </div>

            <div className="d-grid">
              <Link to="/dashboard/buyer?tab=orders" className="d-quick-card">
                <span className="d-quick-card__icon">📋</span>
                <span>{t('dashboard.orders')}</span>
              </Link>
              <Link to="/dashboard/buyer?tab=downloads" className="d-quick-card">
                <span className="d-quick-card__icon">⬇️</span>
                <span>{t('dashboard.downloads')}</span>
              </Link>
              <Link to="/dashboard/buyer?tab=favorites" className="d-quick-card">
                <span className="d-quick-card__icon">❤️</span>
                <span>{t('dashboard.favorites')}</span>
              </Link>
              <Link to="/dashboard/buyer?tab=settings" className="d-quick-card">
                <span className="d-quick-card__icon">⚙️</span>
                <span>{t('dashboard.settings')}</span>
              </Link>
            </div>

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
          </>
        );
    }
  };

  return <div className="d-content">{renderContent()}</div>;
}
