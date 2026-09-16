import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import DashIcon from '../../components/dashboard/DashIcon';

const INITIAL_USERS = [
  { id: 1, name: 'Ahmed Ali', email: 'ahmed@example.com', role: 'seller', status: 'verified', suspended: false, joined: '2026-01-15', products: 14 },
  { id: 2, name: 'Sara Khalid', email: 'sara@example.com', role: 'buyer', status: 'active', suspended: false, joined: '2026-03-20', products: 0 },
  { id: 3, name: 'Mohammed Noor', email: 'mohammed@example.com', role: 'seller', status: 'unverified', suspended: false, joined: '2026-05-10', products: 3 },
  { id: 4, name: 'Nora Ali', email: 'nora@example.com', role: 'buyer', status: 'active', suspended: false, joined: '2026-02-14', products: 0 },
  { id: 5, name: 'Fahad Omar', email: 'fahad@example.com', role: 'seller', status: 'verified', suspended: false, joined: '2025-11-01', products: 22 },
  { id: 6, name: 'Layla Hassan', email: 'layla@example.com', role: 'buyer', status: 'active', suspended: false, joined: '2026-06-08', products: 0 },
  { id: 7, name: 'Omar Farouk', email: 'omar@example.com', role: 'seller', status: 'unverified', suspended: true, joined: '2026-04-19', products: 1 },
];

const INITIAL_PRODUCTS = [
  { id: 1, name: 'E-Commerce App Template', seller: 'Mohammed Noor', price: 49, sales: 0, status: 'pending', submitted: '2026-07-04', revenue: 0 },
  { id: 2, name: 'Social Media Kit Pro', seller: 'Nora Designs', price: 29, sales: 0, status: 'pending', submitted: '2026-07-03', revenue: 0 },
  { id: 3, name: 'WordPress Theme Pack', seller: 'Creative Studio X', price: 79, sales: 0, status: 'pending', submitted: '2026-07-02', revenue: 0 },
  { id: 4, name: 'Figma UI Toolkit', seller: 'Ahmed Ali', price: 39, sales: 412, status: 'active', submitted: '2026-01-20', revenue: 16068 },
  { id: 5, name: 'React Admin Bundle', seller: 'Fahad Omar', price: 99, sales: 187, status: 'active', submitted: '2025-12-02', revenue: 18513 },
  { id: 6, name: '3D Icon Collection', seller: 'Ahmed Ali', price: 19, sales: 1024, status: 'active', submitted: '2026-02-11', revenue: 19456 },
  { id: 7, name: 'Notion Life OS', seller: 'Fahad Omar', price: 25, sales: 0, status: 'rejected', submitted: '2026-05-30', revenue: 0 },
];

const INITIAL_ORDERS = [
  { id: 'ORD-10423', customer: 'Nora Ali', amount: 39, status: 'completed', date: '2026-07-05', product: 'Figma UI Toolkit' },
  { id: 'ORD-10422', customer: 'Layla Hassan', amount: 19, status: 'pending', date: '2026-07-05', product: '3D Icon Collection' },
  { id: 'ORD-10421', customer: 'Sara Khalid', amount: 99, status: 'processing', date: '2026-07-04', product: 'React Admin Bundle' },
  { id: 'ORD-10420', customer: 'Ahmed Ali', amount: 29, status: 'completed', date: '2026-07-03', product: 'Social Media Kit Pro' },
  { id: 'ORD-10419', customer: 'Omar Farouk', amount: 79, status: 'cancelled', date: '2026-07-02', product: 'WordPress Theme Pack' },
  { id: 'ORD-10418', customer: 'Sara Khalid', amount: 49, status: 'completed', date: '2026-07-01', product: 'E-Commerce App Template' },
];

const INITIAL_PAYOUTS = [
  { id: 'PYT-551', seller: 'Ahmed Ali', amount: 1280, status: 'pending', date: '2026-07-05' },
  { id: 'PYT-550', seller: 'Fahad Omar', amount: 2430, status: 'pending', date: '2026-07-04' },
  { id: 'PYT-549', seller: 'Nora Designs', amount: 860, status: 'processed', date: '2026-07-01' },
  { id: 'PYT-548', seller: 'Creative Studio X', amount: 1540, status: 'processed', date: '2026-06-28' },
];

const INITIAL_CATEGORIES = [
  { id: 1, name: 'قوالب مواقع', nameEn: 'Website Templates', enabled: true, products: 34 },
  { id: 2, name: 'هوية بصرية', nameEn: 'Branding', enabled: true, products: 52 },
  { id: 3, name: 'قوالب المتاجر', nameEn: 'E-commerce', enabled: true, products: 18 },
  { id: 4, name: 'تطبيقات جوال', nameEn: 'Mobile Apps', enabled: true, products: 11 },
  { id: 5, name: 'إضافات أدوات', nameEn: 'Plugins & Tools', enabled: false, products: 27 },
  { id: 6, name: 'محتوى وويب', nameEn: 'Content & Web', enabled: true, products: 9 },
];

const INITIAL_REVIEWS = [
  { id: 1, author: 'Sara Khalid', product: 'React Admin Bundle', rating: 5, text: 'ممتاز ومتوافق مع آخر إصدار', hidden: false, date: '2026-07-04' },
  { id: 2, author: 'Layla Hassan', product: '3D Icon Collection', rating: 2, text: 'الجودة ليست كما توقعت', hidden: false, date: '2026-07-02' },
  { id: 3, author: 'Omar Farouk', product: 'Figma UI Toolkit', rating: 4, text: 'جيد جداً، يستحق التجربة', hidden: false, date: '2026-06-30' },
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
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
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

function StatusPill({ status }) {
  const map = {
    verified: 'completed', active: 'active', pending: 'pending',
    processing: 'pending', completed: 'completed', cancelled: 'cancelled',
    unverified: 'pending', rejected: 'rejected', processed: 'completed',
    hidden: 'inactive', visible: 'active',
  };
  const cls = map[status] || 'inactive';
  let label = status;
  return <span className={`d-badge d-badge--${cls}`}>{label}</span>;
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
          lineHeight: 1,
          transition: 'transform 0.3s ease',
        }} className="stat-icon">
          <DashIcon name={icon} size={24} />
        </div>
      </div>
      {trend && (
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
          {trendLabel && <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { dir } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';
  const setTab = useCallback((next) => {
    if (next === 'overview') setSearchParams({}, { replace: true });
    else setSearchParams({ tab: next }, { replace: true });
  }, [setSearchParams]);

  const [users, setUsers] = useState(INITIAL_USERS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [payouts, setPayouts] = useState(INITIAL_PAYOUTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const toggleUserSuspension = (id) => {
    const u = users.find(x => x.id === id);
    setUsers(users.map(x => x.id === id ? { ...x, suspended: !x.suspended } : x));
    notify(u && !u.suspended ? (dir === 'rtl' ? 'تم حظر المستخدم' : 'User suspended') : (dir === 'rtl' ? 'تم رفع الحظر' : 'User unsuspended'));
  };

  const changeUserRole = (id, role) => {
    setUsers(users.map(x => x.id === id ? { ...x, role } : x));
    notify(dir === 'rtl' ? 'تم تغيير الدور' : 'Role changed');
  };

  const toggleSellerVerify = (id) => {
    setUsers(users.map(x => x.id === id ? { ...x, status: x.status === 'verified' ? 'unverified' : 'verified' } : x));
  };

  const setProductStatus = (id, status) => {
    setProducts(products.map(p => p.id === id ? { ...p, status } : p));
    notify(status === 'active' ? (dir === 'rtl' ? 'تم اعتماد المنتج' : 'Product approved') : (dir === 'rtl' ? 'تم تحديث المنتج' : 'Product updated'));
  };

  const removeProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
    notify(dir === 'rtl' ? 'تم حذف المنتج' : 'Product deleted');
  };

  const setOrderStatus = (id, status) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    notify(dir === 'rtl' ? 'تم تحديث الطلب' : 'Order updated');
  };

  const settlePayout = (id) => {
    setPayouts(payouts.map(p => p.id === id ? { ...p, status: 'processed' } : p));
    notify(dir === 'rtl' ? 'تمت التسوية' : 'Payout settled');
  };

  const toggleCategory = (id) => {
    setCategories(categories.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const addCategory = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = (fd.get('name') || '').toString().trim();
    const nameEn = (fd.get('nameEn') || '').toString().trim();
    if (!name) return;
    setCategories([...categories, { id: Date.now(), name, nameEn: nameEn || name, enabled: true, products: 0 }]);
    e.target.reset();
    notify(dir === 'rtl' ? 'تمت إضافة التصنيف' : 'Category added');
  };

  const toggleReview = (id) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, hidden: !r.hidden } : r));
  };

  const removeReview = (id) => {
    setReviews(reviews.filter(r => r.id !== id));
    notify(dir === 'rtl' ? 'تم حذف التقييم' : 'Review removed');
  };

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return users;
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, search]);

  const pendingProducts = products.filter(p => p.status === 'pending');

  const renderOverview = () => (
    <>
      <div className="d-welcome" style={{ animation: 'fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
        <h2 className="d-welcome__title">{dir === 'rtl' ? 'نظرة عامة على المنصة' : 'Platform Overview'}</h2>
        <p className="d-welcome__sub">{dir === 'rtl' ? 'التحكم الكامل في منصة مَورد' : 'Full control of the Mawrid platform'}</p>
      </div>

      <div className="d-stats">
        <StatCard label={dir === 'rtl' ? 'إجمالي المستخدمين' : 'Total Users'} value={users.length + 1843} trend="↑ 8.2%" trendLabel={dir === 'rtl' ? 'هذا الشهر' : 'this month'} trendColor="#166534" icon="users" iconBg="rgba(73, 75, 214, 0.08)" glowColor="rgba(73, 75, 214, 0.15)" delay={100} />
        <StatCard label={dir === 'rtl' ? 'البائعون النشطون' : 'Active Sellers'} value={users.filter(u => u.role === 'seller' && !u.suspended).length + 615} trend="↑ 4.2%" trendLabel={dir === 'rtl' ? 'مقارنة بالشهر' : 'vs last month'} trendColor="#166534" icon="stores" iconBg="rgba(133, 137, 255, 0.08)" glowColor="rgba(133, 137, 255, 0.15)" delay={200} />
        <StatCard label={dir === 'rtl' ? 'إجمالي المبيعات' : 'Total Sales'} value={1627} trend="↑ 12.5%" trendLabel={dir === 'rtl' ? 'مقارنة بالشهر' : 'vs last month'} trendColor="#166534" icon="analytics" iconBg="rgba(255, 98, 1, 0.08)" glowColor="rgba(255, 98, 1, 0.15)" delay={300} />
        <StatCard label={dir === 'rtl' ? 'بانتظار الموافقة' : 'Pending Approvals'} value={pendingProducts.length} trend={dir === 'rtl' ? 'يتطلب انتباه' : 'Requires attention'} trendColor="#991b1b" icon="clock" iconBg="rgba(186, 26, 26, 0.08)" glowColor="rgba(186, 26, 26, 0.15)" delay={400} />
      </div>

      <div className="d-grid">
        <a href="?tab=users" className="d-quick-card" onClick={(e) => { e.preventDefault(); setTab('users'); }}>
          <span className="d-quick-card__icon" style={{ color: 'var(--color-primary)' }}><DashIcon name="users" size={24} /></span>
          <span>{dir === 'rtl' ? 'إدارة المستخدمين' : 'User Management'}</span>
        </a>
        <a href="?tab=sellers" className="d-quick-card" onClick={(e) => { e.preventDefault(); setTab('sellers'); }}>
          <span className="d-quick-card__icon" style={{ color: '#494bd6' }}><DashIcon name="stores" size={24} /></span>
          <span>{dir === 'rtl' ? 'إدارة البائعين' : 'Seller Management'}</span>
        </a>
        <a href="?tab=products" className="d-quick-card" onClick={(e) => { e.preventDefault(); setTab('products'); }}>
          <span className="d-quick-card__icon" style={{ color: '#10b981' }}><DashIcon name="products" size={24} /></span>
          <span>{dir === 'rtl' ? 'مراجعة المنتجات' : 'Product Moderation'}</span>
        </a>
        <a href="?tab=orders" className="d-quick-card" onClick={(e) => { e.preventDefault(); setTab('orders'); }}>
          <span className="d-quick-card__icon" style={{ color: '#f59e0b' }}><DashIcon name="orders" size={24} /></span>
          <span>{dir === 'rtl' ? 'الطلبات' : 'Orders'}</span>
        </a>
        <a href="?tab=categories" className="d-quick-card" onClick={(e) => { e.preventDefault(); setTab('categories'); }}>
          <span className="d-quick-card__icon" style={{ color: '#8b5cf6' }}><DashIcon name="layers" size={24} /></span>
          <span>{dir === 'rtl' ? 'التصنيفات' : 'Categories'}</span>
        </a>
        <a href="?tab=reviews" className="d-quick-card" onClick={(e) => { e.preventDefault(); setTab('reviews'); }}>
          <span className="d-quick-card__icon" style={{ color: '#ec4899' }}><DashIcon name="message" size={24} /></span>
          <span>{dir === 'rtl' ? 'التقييمات' : 'Reviews'}</span>
        </a>
        <a href="?tab=payouts" className="d-quick-card" onClick={(e) => { e.preventDefault(); setTab('payouts'); }}>
          <span className="d-quick-card__icon" style={{ color: '#14b8a6' }}><DashIcon name="payouts" size={24} /></span>
          <span>{dir === 'rtl' ? 'المدفوعات' : 'Payouts'}</span>
        </a>
        <a href="?tab=settings" className="d-quick-card" onClick={(e) => { e.preventDefault(); setTab('settings'); }}>
          <span className="d-quick-card__icon" style={{ color: '#64748b' }}><DashIcon name="settings" size={24} /></span>
          <span>{dir === 'rtl' ? 'الإعدادات' : 'Settings'}</span>
        </a>
      </div>

      <div className="d-card">
        <div className="d-card__header">
          <h3 className="d-card__title">{dir === 'rtl' ? 'منتجات بانتظار المراجعة' : 'Products Pending Review'}</h3>
          <button className="d-actions__btn" onClick={() => setTab('products')}>{dir === 'rtl' ? 'عرض الكل' : 'View All'}</button>
        </div>
        {pendingProducts.length === 0 ? (
          <p className="d-empty">{dir === 'rtl' ? 'لا يوجد منتجات بانتظار المراجعة' : 'No products pending review'}</p>
        ) : (
          <div className="d-table-wrap">
            <table className="d-table">
              <thead>
                <tr>
                  <th>{dir === 'rtl' ? 'المنتج' : 'Product'}</th>
                  <th>{dir === 'rtl' ? 'البائع' : 'Seller'}</th>
                  <th>{dir === 'rtl' ? 'السعر' : 'Price'}</th>
                  <th>{dir === 'rtl' ? 'التقديم' : 'Submitted'}</th>
                  <th>{dir === 'rtl' ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {pendingProducts.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.seller}</td>
                    <td>${p.price}</td>
                    <td>{p.submitted}</td>
                    <td>
                      <div className="d-actions">
                        <button className="d-actions__btn d-actions__btn--approve" onClick={() => setProductStatus(p.id, 'active')}>{dir === 'rtl' ? 'اعتماد' : 'Approve'}</button>
                        <button className="d-actions__btn d-actions__btn--danger" onClick={() => setProductStatus(p.id, 'rejected')}>{dir === 'rtl' ? 'رفض' : 'Reject'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );

  const renderUsers = () => (
    <div className="d-card">
      <div className="d-card__header">
        <h3 className="d-card__title">{dir === 'rtl' ? 'إدارة المستخدمين' : 'User Management'}</h3>
        <input
          type="text"
          placeholder={dir === 'rtl' ? 'بحث بالاسم أو البريد...' : 'Search by name or email...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="d-form__input"
          style={{ maxWidth: 260, padding: '10px 14px' }}
        />
      </div>
      <div className="d-table-wrap">
        <table className="d-table">
          <thead>
            <tr>
              <th>{dir === 'rtl' ? 'المستخدم' : 'User'}</th>
              <th>{dir === 'rtl' ? 'الدور' : 'Role'}</th>
              <th>{dir === 'rtl' ? 'الحالة' : 'Status'}</th>
              <th>{dir === 'rtl' ? 'التسجيل' : 'Joined'}</th>
              <th>{dir === 'rtl' ? 'التحكم' : 'Controls'}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} style={u.suspended ? { opacity: 0.55 } : undefined}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <InitialsAvatar name={u.name} bg={'#8589ff20'} />
                    <div>
                      <strong>{u.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <select
                    value={u.role}
                    onChange={e => changeUserRole(u.id, e.target.value)}
                    className="d-form__input"
                    style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
                  >
                    <option value="buyer">{dir === 'rtl' ? 'مشتري' : 'Buyer'}</option>
                    <option value="seller">{dir === 'rtl' ? 'بائع' : 'Seller'}</option>
                    <option value="admin">{dir === 'rtl' ? 'مدير' : 'Admin'}</option>
                  </select>
                </td>
                <td><span className={`d-badge d-badge--${u.suspended ? 'cancelled' : u.status === 'verified' ? 'completed' : 'active'}`}>{u.suspended ? (dir === 'rtl' ? 'محظور' : 'Suspended') : u.status === 'verified' ? (dir === 'rtl' ? 'موثق' : 'Verified') : (dir === 'rtl' ? 'نشط' : 'Active')}</span></td>
                <td>{u.joined}</td>
                <td>
                  <div className="d-actions">
                    <button
                      className={`d-actions__btn ${u.suspended ? 'd-actions__btn--approve' : 'd-actions__btn--danger'}`}
                      onClick={() => toggleUserSuspension(u.id)}
                    >
                      {u.suspended ? (dir === 'rtl' ? 'رفع حظر' : 'Unban') : (dir === 'rtl' ? 'حظر' : 'Ban')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSellers = () => (
    <div className="d-card">
      <h3 className="d-card__title">{dir === 'rtl' ? 'إدارة البائعين' : 'Seller Management'}</h3>
      <div className="d-table-wrap">
        <table className="d-table">
          <thead>
            <tr>
              <th>{dir === 'rtl' ? 'البائع' : 'Seller'}</th>
              <th>{dir === 'rtl' ? 'المتجر' : 'Store'}</th>
              <th>{dir === 'rtl' ? 'المنتجات' : 'Products'}</th>
              <th>{dir === 'rtl' ? 'التوثيق' : 'Verification'}</th>
              <th>{dir === 'rtl' ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.role === 'seller').map((u, i) => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <InitialsAvatar name={u.name} bg={i % 2 === 0 ? '#8589ff20' : '#2f2ebe20'} />
                    <strong>{u.name}</strong>
                  </div>
                </td>
                <td>{dir === 'rtl' ? 'متجر إبداعي' : 'Creative Store'}</td>
                <td>{u.products}</td>
                <td><StatusPill status={u.status} /></td>
                <td>
                  <div className="d-actions">
                    {u.status === 'verified' ? (
                      <button className="d-actions__btn d-actions__btn--danger" onClick={() => toggleSellerVerify(u.id)}>{dir === 'rtl' ? 'إلغاء التوثيق' : 'Unverify'}</button>
                    ) : (
                      <button className="d-actions__btn d-actions__btn--approve" onClick={() => toggleSellerVerify(u.id)}>{dir === 'rtl' ? 'توثيق' : 'Verify'}</button>
                    )}
                    <button className="d-actions__btn d-actions__btn--danger" onClick={() => toggleUserSuspension(u.id)}>{u.suspended ? (dir === 'rtl' ? 'رفع حظر' : 'Unban') : (dir === 'rtl' ? 'حظر' : 'Ban')}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="d-card">
      <div className="d-card__header">
        <h3 className="d-card__title">{dir === 'rtl' ? 'إدارة المنتجات' : 'Product Management'}</h3>
        <span className="d-badge d-badge--pending">{pendingProducts.length} {dir === 'rtl' ? 'بانتظار المراجعة' : 'pending'}</span>
      </div>
      <div className="d-table-wrap">
        <table className="d-table">
          <thead>
            <tr>
              <th>{dir === 'rtl' ? 'المنتج' : 'Product'}</th>
              <th>{dir === 'rtl' ? 'البائع' : 'Seller'}</th>
              <th>{dir === 'rtl' ? 'السعر' : 'Price'}</th>
              <th>{dir === 'rtl' ? 'المبيعات' : 'Sales'}</th>
              <th>{dir === 'rtl' ? 'الإيرادات' : 'Revenue'}</th>
              <th>{dir === 'rtl' ? 'الحالة' : 'Status'}</th>
              <th>{dir === 'rtl' ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td><strong>{p.name}</strong></td>
                <td>{p.seller}</td>
                <td>${p.price}</td>
                <td>{p.sales}</td>
                <td>${p.revenue.toLocaleString()}</td>
                <td><StatusPill status={p.status} /></td>
                <td>
                  <div className="d-actions">
                    {p.status !== 'active' && (
                      <button className="d-actions__btn d-actions__btn--approve" onClick={() => setProductStatus(p.id, 'active')}>{dir === 'rtl' ? 'اعتماد' : 'Approve'}</button>
                    )}
                    {p.status !== 'rejected' && (
                      <button className="d-actions__btn d-actions__btn--danger" onClick={() => setProductStatus(p.id, 'rejected')}>{dir === 'rtl' ? 'رفض' : 'Reject'}</button>
                    )}
                    <button className="d-actions__btn d-actions__btn--danger" onClick={() => removeProduct(p.id)}>{dir === 'rtl' ? 'حذف' : 'Delete'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="d-card">
      <h3 className="d-card__title">{dir === 'rtl' ? 'إدارة الطلبات' : 'Order Management'}</h3>
      <div className="d-table-wrap">
        <table className="d-table">
          <thead>
            <tr>
              <th>{dir === 'rtl' ? 'الطلب' : 'Order'}</th>
              <th>{dir === 'rtl' ? 'المنتج' : 'Product'}</th>
              <th>{dir === 'rtl' ? 'العميل' : 'Customer'}</th>
              <th>{dir === 'rtl' ? 'المبلغ' : 'Amount'}</th>
              <th>{dir === 'rtl' ? 'التاريخ' : 'Date'}</th>
              <th>{dir === 'rtl' ? 'الحالة' : 'Status'}</th>
              <th>{dir === 'rtl' ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td className="d-table__id">{o.id}</td>
                <td>{o.product}</td>
                <td>{o.customer}</td>
                <td>${o.amount}</td>
                <td>{o.date}</td>
                <td><StatusPill status={o.status} /></td>
                <td>
                  <select
                    value={o.status}
                    onChange={e => setOrderStatus(o.id, e.target.value)}
                    className="d-form__input"
                    style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
                  >
                    <option value="pending">{dir === 'rtl' ? 'قيد المعالجة' : 'Pending'}</option>
                    <option value="processing">{dir === 'rtl' ? 'قيد التنفيذ' : 'Processing'}</option>
                    <option value="completed">{dir === 'rtl' ? 'مكتمل' : 'Completed'}</option>
                    <option value="cancelled">{dir === 'rtl' ? 'ملغي' : 'Cancelled'}</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPayouts = () => (
    <div className="d-card">
      <h3 className="d-card__title">{dir === 'rtl' ? 'إدارة المدفوعات' : 'Payout Management'}</h3>
      <div className="d-table-wrap">
        <table className="d-table">
          <thead>
            <tr>
              <th>{dir === 'rtl' ? 'الدفعة' : 'Payout'}</th>
              <th>{dir === 'rtl' ? 'البائع' : 'Seller'}</th>
              <th>{dir === 'rtl' ? 'المبلغ' : 'Amount'}</th>
              <th>{dir === 'rtl' ? 'التاريخ' : 'Date'}</th>
              <th>{dir === 'rtl' ? 'الحالة' : 'Status'}</th>
              <th>{dir === 'rtl' ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map(p => (
              <tr key={p.id}>
                <td className="d-table__id">{p.id}</td>
                <td>{p.seller}</td>
                <td>${p.amount.toLocaleString()}</td>
                <td>{p.date}</td>
                <td><StatusPill status={p.status} /></td>
                <td>
                  {p.status === 'pending' ? (
                    <button className="d-actions__btn d-actions__btn--approve" onClick={() => settlePayout(p.id)}>{dir === 'rtl' ? 'تسوية' : 'Settle'}</button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>{dir === 'rtl' ? 'تمت' : 'Done'}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCategories = () => (
    <>
      <div className="d-card">
        <h3 className="d-card__title">{dir === 'rtl' ? 'إضافة تصنيف جديد' : 'Add New Category'}</h3>
        <form className="d-form" onSubmit={addCategory}>
          <div className="d-form__row">
            <div className="d-form__group">
              <label>{dir === 'rtl' ? 'الاسم (عربي)' : 'Name (Arabic)'}</label>
              <input name="name" type="text" className="d-form__input" required />
            </div>
            <div className="d-form__group">
              <label>{dir === 'rtl' ? 'الاسم (إنجليزي)' : 'Name (English)'}</label>
              <input name="nameEn" type="text" className="d-form__input" />
            </div>
          </div>
          <button type="submit" className="btn btn--primary" style={{ alignSelf: 'flex-start' }}>{dir === 'rtl' ? 'إضافة' : 'Add'}</button>
        </form>
      </div>

      <div className="d-card">
        <h3 className="d-card__title">{dir === 'rtl' ? 'التصنيفات الحالية' : 'Current Categories'}</h3>
        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>{dir === 'rtl' ? 'التصنيف' : 'Category'}</th>
                <th>{dir === 'rtl' ? 'المنتجات' : 'Products'}</th>
                <th>{dir === 'rtl' ? 'الحالة' : 'Status'}</th>
                <th>{dir === 'rtl' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong><div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>{c.nameEn}</div></td>
                  <td>{c.products}</td>
                  <td><StatusPill status={c.enabled ? 'active' : 'hidden'} /></td>
                  <td>
                    <button className="d-actions__btn" onClick={() => toggleCategory(c.id)}>
                      {c.enabled ? (dir === 'rtl' ? 'إخفاء' : 'Disable') : (dir === 'rtl' ? 'تفعيل' : 'Enable')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderReviews = () => (
    <div className="d-card">
      <h3 className="d-card__title">{dir === 'rtl' ? 'إدارة التقييمات' : 'Review Management'}</h3>
      <div className="d-table-wrap">
        <table className="d-table">
          <thead>
            <tr>
              <th>{dir === 'rtl' ? 'الكاتب' : 'Author'}</th>
              <th>{dir === 'rtl' ? 'المنتج' : 'Product'}</th>
              <th>{dir === 'rtl' ? 'التقييم' : 'Rating'}</th>
              <th>{dir === 'rtl' ? 'النص' : 'Text'}</th>
              <th>{dir === 'rtl' ? 'الحالة' : 'Status'}</th>
              <th>{dir === 'rtl' ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r.id}>
                <td><strong>{r.author}</strong></td>
                <td>{r.product}</td>
                <td>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                <td style={{ whiteSpace: 'normal', maxWidth: 260 }}>{r.text}</td>
                <td><StatusPill status={r.hidden ? 'hidden' : 'visible'} /></td>
                <td>
                  <div className="d-actions">
                    <button className="d-actions__btn" onClick={() => toggleReview(r.id)}>{r.hidden ? (dir === 'rtl' ? 'إظهار' : 'Show') : (dir === 'rtl' ? 'إخفاء' : 'Hide')}</button>
                    <button className="d-actions__btn d-actions__btn--danger" onClick={() => removeReview(r.id)}>{dir === 'rtl' ? 'حذف' : 'Delete'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="d-card">
      <h3 className="d-card__title">{dir === 'rtl' ? 'التقارير' : 'Reports'}</h3>
      <div className="d-grid d-grid--sm">
        <div className="d-balance"><span className="d-balance__label">{dir === 'rtl' ? 'إيرادات الشهر' : 'Monthly Revenue'}</span><span className="d-balance__amount">$128,450</span></div>
        <div className="d-balance"><span className="d-balance__label">{dir === 'rtl' ? 'عمولات المنصة' : 'Platform Commission'}</span><span className="d-balance__amount">$19,267</span></div>
        <div className="d-balance"><span className="d-balance__label">{dir === 'rtl' ? 'متوسط قيمة الطلب' : 'Avg Order Value'}</span><span className="d-balance__amount">$58</span></div>
        <div className="d-balance"><span className="d-balance__label">{dir === 'rtl' ? 'طلبات الشهر' : 'Monthly Orders'}</span><span className="d-balance__amount">2,214</span></div>
      </div>
      <p className="d-empty" style={{ padding: '24px 0 0' }}>{dir === 'rtl' ? 'تفصيل كامل للتقارير قريباً مع الربط بقاعدة البيانات' : 'Detailed reports coming soon with database integration'}</p>
    </div>
  );

  const renderSettings = () => (
    <div className="d-card">
      <h3 className="d-card__title">{dir === 'rtl' ? 'إعدادات المنصة' : 'Platform Settings'}</h3>
      <form className="d-form" onSubmit={(e) => { e.preventDefault(); notify(dir === 'rtl' ? 'تم حفظ الإعدادات' : 'Settings saved'); }}>
        <div className="d-form__row">
          <div className="d-form__group">
            <label>{dir === 'rtl' ? 'اسم المنصة' : 'Platform Name'}</label>
            <input type="text" defaultValue="مَورد" className="d-form__input" />
          </div>
          <div className="d-form__group">
            <label>{dir === 'rtl' ? 'نسبة العمولة (%)' : 'Commission Rate (%)'}</label>
            <input type="number" defaultValue={15} className="d-form__input" />
          </div>
        </div>
        <div className="d-form__row">
          <div className="d-form__group">
            <label>{dir === 'rtl' ? 'الحد الأدنى للسحب' : 'Minimum Payout'}</label>
            <input type="number" defaultValue={50} className="d-form__input" />
          </div>
          <div className="d-form__group">
            <label>{dir === 'rtl' ? 'بريد الدعم' : 'Support Email'}</label>
            <input type="email" defaultValue="support@mawrid.com" className="d-form__input" />
          </div>
        </div>
        <button type="submit" className="btn btn--primary" style={{ alignSelf: 'flex-start' }}>{dir === 'rtl' ? 'حفظ الإعدادات' : 'Save Settings'}</button>
      </form>
    </div>
  );

  const renderContent = () => {
    switch (tab) {
      case 'users': return renderUsers();
      case 'sellers': return renderSellers();
      case 'products': return renderProducts();
      case 'orders': return renderOrders();
      case 'payouts': return renderPayouts();
      case 'categories': return renderCategories();
      case 'reviews': return renderReviews();
      case 'reports': return renderReports();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .d-stat:hover .stat-icon { transform: scale(1.1); }
        .d-stat:hover .stat-glow { transform: scale(1.2); }
        .d-quick-card__icon { display: inline-flex; }
      `}</style>
      <div className="d-content">{renderContent()}</div>
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--color-on-surface)',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: 9999,
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 2000,
          animation: 'fadeInUp 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}>
          {toast}
        </div>
      )}
    </>
  );
}