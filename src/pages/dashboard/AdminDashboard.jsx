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

export default function AdminDashboard() {
  const { t, dir } = useLanguage();
  const tab = new URLSearchParams(window.location.search).get('tab') || 'overview';

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
                      <td><strong>{u.name}</strong></td>
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
                      <td><strong>{u.name}</strong></td>
                      <td>{dir === 'rtl' ? 'متجر إبداعي' : 'Creative Store'}</td>
                      <td>{u.email}</td>
                      <td>{Math.floor(Math.random() * 20) + 1}</td>
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
            <div className="d-welcome">
              <h2 className="d-welcome__title">{t('dashboard.welcome')}</h2>
              <p className="d-welcome__sub">{dir === 'rtl' ? 'إدارة المنصة بالكامل من هنا' : 'Manage the entire platform from here'}</p>
            </div>

            <div className="d-stats">
              <div className="d-stat"><span className="d-stat__value">248</span><span className="d-stat__label">{t('dashboard.totalUsers')}</span></div>
              <div className="d-stat"><span className="d-stat__value">45</span><span className="d-stat__label">{t('dashboard.totalSellers')}</span></div>
              <div className="d-stat"><span className="d-stat__value">$128K</span><span className="d-stat__label">{t('dashboard.totalRevenue')}</span></div>
              <div className="d-stat"><span className="d-stat__value">3</span><span className="d-stat__label">{t('dashboard.pendingApproval')}</span></div>
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

  return <div className="d-content">{renderContent()}</div>;
}
