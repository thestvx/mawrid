import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import DashIcon from '../../components/dashboard/DashIcon';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const EMPTY_PRODUCT = {
  name: '',
  name_en: '',
  description: '',
  price: '',
  sale_price: '',
  category_id: '',
  seller_name: '',
  store_name: '',
  thumbnail: '',
  images: '',
  tags: '',
  stock: 0,
  status: 'pending',
  featured: false,
};

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
      overflow: 'hidden',
    }}>
      {name ? initials : <DashIcon name="users" size={size * 0.45} />}
    </div>
  );
}

function getStatusLabel(status, dir) {
  const map = {
    verified: dir === 'rtl' ? 'موثّق' : 'Verified',
    active: dir === 'rtl' ? 'نشط' : 'Active',
    pending: dir === 'rtl' ? 'قيد المراجعة' : 'Pending',
    processing: dir === 'rtl' ? 'قيد المعالجة' : 'Processing',
    completed: dir === 'rtl' ? 'مكتمل' : 'Completed',
    cancelled: dir === 'rtl' ? 'ملغي' : 'Cancelled',
    unverified: dir === 'rtl' ? 'غير موثق' : 'Unverified',
    rejected: dir === 'rtl' ? 'مرفوض' : 'Rejected',
    processed: dir === 'rtl' ? 'تمت التسوية' : 'Processed',
    hidden: dir === 'rtl' ? 'مخفي' : 'Hidden',
    visible: dir === 'rtl' ? 'ظاهر' : 'Visible',
    suspended: dir === 'rtl' ? 'محظور' : 'Suspended',
    buyer: dir === 'rtl' ? 'مشتري' : 'Buyer',
    seller: dir === 'rtl' ? 'بائع' : 'Seller',
    admin: dir === 'rtl' ? 'مدير' : 'Admin',
  };
  return map[status] || status;
}

function getStatusClass(status) {
  const map = {
    verified: 'completed', active: 'active', pending: 'pending',
    processing: 'pending', completed: 'completed', cancelled: 'cancelled',
    unverified: 'pending', rejected: 'rejected', processed: 'completed',
    hidden: 'inactive', visible: 'active', suspended: 'cancelled',
    seller: 'seller', buyer: 'buyer', admin: 'admin',
  };
  return map[status] || 'inactive';
}

function StatusPill({ status, dir }) {
  return <span className={`d-badge d-badge--${getStatusClass(status)}`}>{getStatusLabel(status, dir)}</span>;
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

function ProductImage({ src, name, size = 44 }) {
  return src ? (
    <img
      src={src}
      alt={name}
      style={{ width: size, height: size, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--color-outline-variant)' }}
      onError={e => { e.currentTarget.style.display = 'none'; }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: 'var(--color-surface-container-low)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      color: 'var(--color-secondary)',
    }}>
      <DashIcon name="products" size={size * 0.45} />
    </div>
  );
}

export default function AdminDashboard() {
  const { dir } = useLanguage();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';
  const setTab = useCallback((next) => {
    if (next === 'overview') setSearchParams({}, { replace: true });
    else setSearchParams({ tab: next }, { replace: true });
  }, [setSearchParams]);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [catForm, setCatForm] = useState({ id: '', name: '', name_en: '', slug: '', icon: '', sort_order: 0, enabled: true });
  const [toast, setToast] = useState(null);

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const loadAll = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      setDbError('supabase');
      return;
    }
    setLoading(true);
    const [pRes, cRes, uRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('users').select('*').order('created_at', { ascending: false }),
    ]);
    if (pRes.error) console.warn('products load failed:', pRes.error.message);
    if (cRes.error) console.warn('categories load failed:', cRes.error.message);
    if (uRes.error) console.warn('users load failed:', uRes.error.message);
    setProducts(pRes.data || []);
    setCategories(cRes.data || []);
    setUsers(uRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const catName = useCallback((id) => {
    const c = categories.find(x => x.id === id);
    if (!c) return '';
    return dir === 'rtl' ? (c.name || c.name_en) : (c.name_en || c.name);
  }, [categories, dir]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_PRODUCT);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || '',
      name_en: p.name_en || '',
      description: p.description || '',
      price: p.price != null ? String(p.price) : '',
      sale_price: p.sale_price != null ? String(p.sale_price) : '',
      category_id: p.category_id || '',
      seller_name: p.seller_name || '',
      store_name: p.store_name || '',
      thumbnail: p.thumbnail || '',
      images: (p.images && p.images.length ? p.images.join('\n') : ''),
      tags: (p.tags && p.tags.length ? p.tags.join(', ') : ''),
      stock: p.stock != null ? p.stock : 0,
      status: p.status || 'pending',
      featured: !!p.featured,
    });
    setShowForm(true);
  };

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const saveProduct = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      name_en: form.name_en.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price) || 0,
      sale_price: form.sale_price === '' ? null : (parseFloat(form.sale_price) || null),
      category_id: form.category_id || null,
      seller_name: form.seller_name.trim() || user?.name || '',
      store_name: form.store_name.trim() || '',
      thumbnail: form.thumbnail.trim(),
      images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      stock: parseInt(form.stock, 10) || 0,
      status: form.status,
      featured: form.featured,
    };
    let res;
    if (editing) {
      res = await supabase.from('products').update(payload).eq('id', editing.id);
    } else {
      res = await supabase.from('products').insert(payload);
    }
    setSaving(false);
    if (res.error) {
      notify(dir === 'rtl' ? 'فشل الحفظ: ' + res.error.message : 'Save failed: ' + res.error.message);
      return;
    }
    notify(editing
      ? (dir === 'rtl' ? 'تم تحديث المنتج' : 'Product updated')
      : (dir === 'rtl' ? 'تمت إضافة المنتج' : 'Product added'));
    setShowForm(false);
    loadAll();
  };

  const removeProduct = async (p) => {
    if (!window.confirm(dir === 'rtl' ? 'حذف المنتج نهائياً؟' : 'Delete this product permanently?')) return;
    const res = await supabase.from('products').delete().eq('id', p.id);
    if (res.error) { notify(dir === 'rtl' ? 'فشل الحذف' : 'Delete failed'); return; }
    notify(dir === 'rtl' ? 'تم حذف المنتج' : 'Product deleted');
    loadAll();
  };

  const setProductStatus = async (id, status) => {
    const res = await supabase.from('products').update({ status }).eq('id', id);
    if (res.error) { notify(dir === 'rtl' ? 'فشل التحديث' : 'Update failed'); return; }
    notify(status === 'active'
      ? (dir === 'rtl' ? 'تم اعتماد المنتج' : 'Product approved')
      : (dir === 'rtl' ? 'تم تحديث المنتج' : 'Product updated'));
    loadAll();
  };

  const toggleFeatured = async (p) => {
    const res = await supabase.from('products').update({ featured: !p.featured }).eq('id', p.id);
    if (!res.error) loadAll();
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    const name = (catForm.name || '').trim();
    if (!name) return;
    const payload = {
      name,
      name_en: (catForm.name_en || '').trim() || name,
      slug: (catForm.slug || '').trim() || (catForm.name_en || name).toLowerCase().replace(/\s+/g, '-') || 'cat',
      icon: (catForm.icon || '').trim(),
      enabled: catForm.enabled,
      sort_order: parseInt(catForm.sort_order, 10) || 0,
    };
    let res;
    if (catForm.id) {
      res = await supabase.from('categories').update(payload).eq('id', catForm.id);
    } else {
      res = await supabase.from('categories').insert(payload);
    }
    if (res.error) { notify(dir === 'rtl' ? 'فشل الحفظ: ' + res.error.message : 'Save failed: ' + res.error.message); return; }
    notify(catForm.id
      ? (dir === 'rtl' ? 'تم تحديث التصنيف' : 'Category updated')
      : (dir === 'rtl' ? 'تمت إضافة التصنيف' : 'Category added'));
    resetCatForm();
    loadAll();
  };

  const openEditCategory = (c) => setCatForm({
    id: c.id,
    name: c.name || '',
    name_en: c.name_en || '',
    slug: c.slug || '',
    icon: c.icon || '',
    sort_order: c.sort_order != null ? c.sort_order : 0,
    enabled: 'enabled' in c ? c.enabled : true,
  });

  const resetCatForm = () => setCatForm({
    id: '', name: '', name_en: '', slug: '', icon: '', sort_order: 0, enabled: true,
  });

  const deleteCategory = async (c) => {
    if (!window.confirm(dir === 'rtl' ? `حذف تصنيف "${c.name}"؟` : `Delete category "${c.name}"?`)) return;
    const res = await supabase.from('categories').delete().eq('id', c.id);
    if (res.error) { notify(dir === 'rtl' ? 'فشل الحذف' : 'Delete failed'); return; }
    notify(dir === 'rtl' ? 'تم حذف التصنيف' : 'Category deleted');
    loadAll();
  };

  const toggleCategory = async (c) => {
    const res = await supabase.from('categories').update({ enabled: !c.enabled }).eq('id', c.id);
    if (!res.error) loadAll();
  };

  const changeUserRole = async (u, role) => {
    const res = await supabase.from('users').update({ role }).eq('id', u.id);
    if (res.error) { notify(dir === 'rtl' ? 'فشل تغيير الدور' : 'Role change failed'); return; }
    notify(dir === 'rtl' ? 'تم تغيير الدور' : 'Role changed');
    loadAll();
  };

  const pendingProducts = products.filter(p => p.status === 'pending');
  const activeProducts = products.filter(p => p.status === 'active');
  const sellers = users.filter(u => u.role === 'seller');

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (catFilter !== 'all' && p.category_id !== catFilter) return false;
      if (!q) return true;
      return (p.name || '').toLowerCase().includes(q)
        || (p.name_en || '').toLowerCase().includes(q)
        || (p.seller_name || '').toLowerCase().includes(q);
    });
  }, [products, search, statusFilter, catFilter]);

  const formatMoney = (v) => {
    const n = parseFloat(v);
    if (isNaN(n)) return '$0';
    return '$' + n.toLocaleString(undefined, { minimumFractionDigits: n % 1 ? 2 : 0 });
  };

  const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString(dir === 'rtl' ? 'ar' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderOverview = () => {
    const totalSales = products.reduce((s, p) => s + (Number(p.sales) || 0), 0);
    return (
      <>
        <div className="d-welcome" style={{ animation: 'fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
          <h2 className="d-welcome__title">{dir === 'rtl' ? 'نظرة عامة على المنصة' : 'Platform Overview'}</h2>
          <p className="d-welcome__sub">{dir === 'rtl' ? 'التحكم الكامل في منصة مَورد' : 'Full control of the Mawrid platform'}</p>
        </div>

        <div className="d-stats">
          <StatCard label={dir === 'rtl' ? 'المنتجات' : 'Products'} value={products.length} icon="products" iconBg="rgba(255, 98, 1, 0.08)" glowColor="rgba(255, 98, 1, 0.15)" delay={100} />
          <StatCard label={dir === 'rtl' ? 'المنتجات النشطة' : 'Active Products'} value={activeProducts.length} icon="bag" iconBg="rgba(16, 185, 129, 0.08)" glowColor="rgba(16, 185, 129, 0.15)" delay={200} />
          <StatCard label={dir === 'rtl' ? 'التصنيفات' : 'Categories'} value={categories.filter(c => c.enabled).length} icon="layers" iconBg="rgba(139, 92, 246, 0.08)" glowColor="rgba(139, 92, 246, 0.15)" delay={300} />
          <StatCard label={dir === 'rtl' ? 'المستخدمون' : 'Users'} value={users.length} icon="users" iconBg="rgba(73, 75, 214, 0.08)" glowColor="rgba(73, 75, 214, 0.15)" delay={400} />
          <StatCard label={dir === 'rtl' ? 'البائعون' : 'Sellers'} value={sellers.length} icon="stores" iconBg="rgba(133, 137, 255, 0.08)" glowColor="rgba(133, 137, 255, 0.15)" delay={500} />
          <StatCard label={dir === 'rtl' ? 'إجمالي المبيعات' : 'Total Sales'} value={totalSales} icon="analytics" iconBg="rgba(245, 158, 11, 0.08)" glowColor="rgba(245, 158, 11, 0.15)" delay={600} />
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
          <a href="?tab=categories" className="d-quick-card" onClick={(e) => { e.preventDefault(); setTab('categories'); }}>
            <span className="d-quick-card__icon" style={{ color: '#8b5cf6' }}><DashIcon name="layers" size={24} /></span>
            <span>{dir === 'rtl' ? 'التصنيفات' : 'Categories'}</span>
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
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <ProductImage src={p.thumbnail} name={p.name} />
                          <strong>{dir === 'rtl' ? (p.name || p.name_en) : (p.name_en || p.name)}</strong>
                        </div>
                      </td>
                      <td>{p.seller_name || '—'}</td>
                      <td>{formatMoney(p.price)}</td>
                      <td>{fmtDate(p.created_at)}</td>
                      <td>
                        <div className="d-actions">
                          <button className="d-actions__btn d-actions__btn--approve" onClick={() => setProductStatus(p.id, 'active')}>{dir === 'rtl' ? 'اعتماد' : 'Approve'}</button>
                          <button className="d-actions__btn d-actions__btn--danger" onClick={() => setProductStatus(p.id, 'rejected')}>{dir === 'rtl' ? 'رفض' : 'Reject'}</button>
                          <button className="d-actions__btn" onClick={() => { setTab('products'); openEdit(p); }}>{dir === 'rtl' ? 'تعديل' : 'Edit'}</button>
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
  };

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
              <th>{dir === 'rtl' ? 'التسجيل' : 'Joined'}</th>
              <th>{dir === 'rtl' ? 'التحكم' : 'Controls'}</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => {
              const q = search.toLowerCase();
              return !q || (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
            }).map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <InitialsAvatar name={u.name} bg={'#8589ff20'} />
                    <div>
                      <strong>{u.name || '—'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <select
                    value={u.role}
                    onChange={e => changeUserRole(u, e.target.value)}
                    className="d-form__input"
                    style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
                  >
                    <option value="buyer">{dir === 'rtl' ? 'مشتري' : 'Buyer'}</option>
                    <option value="seller">{dir === 'rtl' ? 'بائع' : 'Seller'}</option>
                    <option value="admin">{dir === 'rtl' ? 'مدير' : 'Admin'}</option>
                  </select>
                </td>
                <td>{fmtDate(u.created_at)}</td>
                <td>
                  <StatusPill status={u.role} dir={dir} />
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={4} className="d-empty" style={{ textAlign: 'center' }}>{dir === 'rtl' ? 'لا يوجد مستخدمون بعد' : 'No users yet'}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSellers = () => (
    <div className="d-card">
      <h3 className="d-card__title">{dir === 'rtl' ? 'إدارة البائعين' : 'Seller Management'}</h3>
      {sellers.length === 0 ? (
        <p className="d-empty">{dir === 'rtl' ? 'لا يوجد بائعون بعد' : 'No sellers yet'}</p>
      ) : (
        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>{dir === 'rtl' ? 'البائع' : 'Seller'}</th>
                <th>{dir === 'rtl' ? 'المتجر' : 'Store'}</th>
                <th>{dir === 'rtl' ? 'منتجات المخزن' : 'Products'}</th>
                <th>{dir === 'rtl' ? 'البريد' : 'Email'}</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((u, i) => {
                const sellerProducts = products.filter(p => p.seller_name === u.name || p.seller_id === u.firebase_uid).length;
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <InitialsAvatar name={u.name} bg={i % 2 === 0 ? '#8589ff20' : '#2f2ebe20'} />
                        <strong>{u.name}</strong>
                      </div>
                    </td>
                    <td>{u.store_name || '—'}</td>
                    <td>{sellerProducts}</td>
                    <td>{u.email}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderProducts = () => (
    <>
      <div className="d-card">
        <div className="d-card__header">
          <div>
            <h3 className="d-card__title" style={{ marginBottom: 8 }}>{dir === 'rtl' ? 'إدارة المنتجات' : 'Product Management'}</h3>
            <span className="d-badge d-badge--pending">{pendingProducts.length} {dir === 'rtl' ? 'بانتظار المراجعة' : 'pending'}</span>
          </div>
          <button className="btn btn--primary" onClick={openAdd}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span>
              {dir === 'rtl' ? 'إضافة منتج' : 'Add Product'}
            </span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder={dir === 'rtl' ? 'بحث عن منتج...' : 'Search products...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="d-form__input"
            style={{ maxWidth: 280, padding: '10px 14px' }}
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="d-form__input" style={{ padding: '10px 14px', width: 'auto' }}>
            <option value="all">{dir === 'rtl' ? 'كل الحالات' : 'All statuses'}</option>
            <option value="pending">{dir === 'rtl' ? 'قيد المراجعة' : 'Pending'}</option>
            <option value="active">{dir === 'rtl' ? 'نشط' : 'Active'}</option>
            <option value="rejected">{dir === 'rtl' ? 'مرفوض' : 'Rejected'}</option>
          </select>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="d-form__input" style={{ padding: '10px 14px', width: 'auto' }}>
            <option value="all">{dir === 'rtl' ? 'كل التصنيفات' : 'All categories'}</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{dir === 'rtl' ? (c.name || c.name_en) : (c.name_en || c.name)}</option>
            ))}
          </select>
        </div>

        <div className="d-table-wrap">
          <table className="d-table d-table--products">
            <thead>
              <tr>
                <th>{dir === 'rtl' ? 'المنتج' : 'Product'}</th>
                <th>{dir === 'rtl' ? 'التصنيف' : 'Category'}</th>
                <th>{dir === 'rtl' ? 'السعر' : 'Price'}</th>
                <th>{dir === 'rtl' ? 'المخزون' : 'Stock'}</th>
                <th>{dir === 'rtl' ? 'المبيعات' : 'Sales'}</th>
                <th>{dir === 'rtl' ? 'الحالة' : 'Status'}</th>
                <th>{dir === 'rtl' ? 'مميز' : 'Featured'}</th>
                <th>{dir === 'rtl' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 260 }}>
                      <ProductImage src={p.thumbnail} name={p.name} />
                      <div style={{ overflow: 'hidden' }}>
                        <strong style={{ display: 'block', whiteSpace: 'normal' }}>{dir === 'rtl' ? (p.name || p.name_en) : (p.name_en || p.name)}</strong>
                        {p.seller_name && <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>{p.seller_name}</div>}
                      </div>
                    </div>
                  </td>
                  <td>{catName(p.category_id) || '—'}</td>
                  <td>
                    {p.sale_price ? (
                      <div>
                        <span style={{ color: '#166534', fontWeight: 700 }}>{formatMoney(p.sale_price)}</span>{' '}
                        <span style={{ color: 'var(--color-secondary)', textDecoration: 'line-through', fontSize: '0.75rem' }}>{formatMoney(p.price)}</span>
                      </div>
                    ) : formatMoney(p.price)}
                  </td>
                  <td>{p.stock != null ? p.stock : 0}</td>
                  <td>{p.sales || 0}</td>
                  <td><StatusPill status={p.status} dir={dir} /></td>
                  <td>
                    <button
                      onClick={() => toggleFeatured(p)}
                      title={dir === 'rtl' ? 'تبديل المميز' : 'Toggle featured'}
                      style={{
                        width: 32, height: 32, borderRadius: 8, border: '1px solid var(--color-outline-variant)',
                        background: p.featured ? '#fef3c7' : 'transparent', cursor: 'pointer',
                        color: p.featured ? '#b45309' : 'var(--color-secondary)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      ★
                    </button>
                  </td>
                  <td>
                    <div className="d-actions" style={{ flexWrap: 'wrap' }}>
                      {p.status !== 'active' && (
                        <button className="d-actions__btn d-actions__btn--approve" onClick={() => setProductStatus(p.id, 'active')}>{dir === 'rtl' ? 'اعتماد' : 'Approve'}</button>
                      )}
                      {p.status !== 'rejected' && (
                        <button className="d-actions__btn d-actions__btn--danger" onClick={() => setProductStatus(p.id, 'rejected')}>{dir === 'rtl' ? 'رفض' : 'Reject'}</button>
                      )}
                      <button className="d-actions__btn" onClick={() => openEdit(p)}>{dir === 'rtl' ? 'تعديل' : 'Edit'}</button>
                      <button className="d-actions__btn d-actions__btn--danger" onClick={() => removeProduct(p)}>{dir === 'rtl' ? 'حذف' : 'Delete'}</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr><td colSpan={8} className="d-empty" style={{ textAlign: 'center' }}>{dir === 'rtl' ? 'لا توجد منتجات' : 'No products found'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="d-modal">
          <div className="d-modal__card">
            <div className="d-modal__header">
              <h3>{editing ? (dir === 'rtl' ? 'تعديل المنتج' : 'Edit Product') : (dir === 'rtl' ? 'إضافة منتج جديد' : 'Add New Product')}</h3>
              <button className="d-modal__close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form className="d-form" onSubmit={saveProduct} style={{ maxWidth: '100%' }}>
              <div className="d-form__row">
                <div className="d-form__group">
                  <label>{dir === 'rtl' ? 'اسم المنتج (عربي)' : 'Product Name (Arabic)'} *</label>
                  <input value={form.name} onChange={e => setField('name', e.target.value)} className="d-form__input" required placeholder={dir === 'rtl' ? 'مثال: قالب متجر إلكتروني' : 'e.g. E-commerce template'} />
                </div>
                <div className="d-form__group">
                  <label>{dir === 'rtl' ? 'اسم المنتج (إنجليزي)' : 'Product Name (English)'}</label>
                  <input value={form.name_en} onChange={e => setField('name_en', e.target.value)} className="d-form__input" placeholder="e.g. Online Store Template" />
                </div>
              </div>

              <div className="d-form__group">
                <label>{dir === 'rtl' ? 'الوصف' : 'Description'}</label>
                <textarea value={form.description} onChange={e => setField('description', e.target.value)} className="d-form__input d-form__textarea" rows={3} />
              </div>

              <div className="d-form__row">
                <div className="d-form__group">
                  <label>{dir === 'rtl' ? 'السعر ($)' : 'Price ($)'} *</label>
                  <input value={form.price} onChange={e => setField('price', e.target.value)} type="number" step="0.01" min="0" className="d-form__input" required />
                </div>
                <div className="d-form__group">
                  <label>{dir === 'rtl' ? 'سعر الخصم ($) (اختياري)' : 'Sale Price ($) (optional)'}</label>
                  <input value={form.sale_price} onChange={e => setField('sale_price', e.target.value)} type="number" step="0.01" min="0" className="d-form__input" />
                </div>
              </div>

              <div className="d-form__row">
                <div className="d-form__group">
                  <label>{dir === 'rtl' ? 'التصنيف' : 'Category'}</label>
                  <select value={form.category_id} onChange={e => setField('category_id', e.target.value)} className="d-form__input">
                    <option value="">{dir === 'rtl' ? '— بدون تصنيف —' : '— No category —'}</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{dir === 'rtl' ? (c.name || c.name_en) : (c.name_en || c.name)}</option>
                    ))}
                  </select>
                </div>
                <div className="d-form__group">
                  <label>{dir === 'rtl' ? 'الحالة' : 'Status'}</label>
                  <select value={form.status} onChange={e => setField('status', e.target.value)} className="d-form__input">
                    <option value="pending">{dir === 'rtl' ? 'قيد المراجعة' : 'Pending'}</option>
                    <option value="active">{dir === 'rtl' ? 'نشط' : 'Active'}</option>
                    <option value="rejected">{dir === 'rtl' ? 'مرفوض' : 'Rejected'}</option>
                  </select>
                </div>
              </div>

              <div className="d-form__row">
                <div className="d-form__group">
                  <label>{dir === 'rtl' ? 'اسم البائع' : 'Seller Name'}</label>
                  <input value={form.seller_name} onChange={e => setField('seller_name', e.target.value)} className="d-form__input" />
                </div>
                <div className="d-form__group">
                  <label>{dir === 'rtl' ? 'اسم المتجر' : 'Store Name'}</label>
                  <input value={form.store_name} onChange={e => setField('store_name', e.target.value)} className="d-form__input" />
                </div>
              </div>

              <div className="d-form__row">
                <div className="d-form__group">
                  <label>{dir === 'rtl' ? 'رابط الصورة المصغرة' : 'Thumbnail URL'}</label>
                  <input value={form.thumbnail} onChange={e => setField('thumbnail', e.target.value)} className="d-form__input" placeholder="https://..." />
                </div>
                <div className="d-form__group">
                  <label>{dir === 'rtl' ? 'المخزون' : 'Stock'}</label>
                  <input value={form.stock} onChange={e => setField('stock', e.target.value)} type="number" min="0" className="d-form__input" />
                </div>
              </div>

              <div className="d-form__group">
                <label>{dir === 'rtl' ? 'روابط الصور (سطر لكل رابط)' : 'Image URLs (one per line)'}</label>
                <textarea value={form.images} onChange={e => setField('images', e.target.value)} className="d-form__input d-form__textarea" rows={3} placeholder="https://..." />
              </div>

              <div className="d-form__group">
                <label>{dir === 'rtl' ? 'الوسوم (مفصولة بفاصلة)' : 'Tags (comma separated)'}</label>
                <input value={form.tags} onChange={e => setField('tags', e.target.value)} className="d-form__input" placeholder="react, template, ecommerce" />
              </div>

              <div className="d-form__group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 24 }}>
                  <input type="checkbox" checked={form.featured} onChange={e => setField('featured', e.target.checked)} style={{ width: 18, height: 18 }} />
                  {dir === 'rtl' ? 'منتج مميز (يظهر في الواجهة)' : 'Featured product (shown on homepage)'}
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? (dir === 'rtl' ? 'جارٍ الحفظ...' : 'Saving...') : (editing ? (dir === 'rtl' ? 'حفظ التعديلات' : 'Save Changes') : (dir === 'rtl' ? 'إضافة المنتج' : 'Add Product'))}
                </button>
                <button type="button" className="btn" onClick={() => setShowForm(false)}>{dir === 'rtl' ? 'إلغاء' : 'Cancel'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  const renderCategories = () => {
    const productCount = (catId) => products.filter(p => p.category_id === catId).length;
    return (
      <>
        <div className="d-card">
          <h3 className="d-card__title">{catForm.id ? (dir === 'rtl' ? 'تعديل التصنيف' : 'Edit Category') : (dir === 'rtl' ? 'إضافة تصنيف جديد' : 'Add New Category')}</h3>
          <form className="d-form" onSubmit={saveCategory} key={catForm.id || 'new'}>
            <div className="d-form__row">
              <div className="d-form__group">
                <label>{dir === 'rtl' ? 'الاسم (عربي)' : 'Name (Arabic)'}</label>
                <input value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} type="text" className="d-form__input" required />
              </div>
              <div className="d-form__group">
                <label>{dir === 'rtl' ? 'الاسم (إنجليزي)' : 'Name (English)'}</label>
                <input value={catForm.name_en} onChange={e => setCatForm(f => ({ ...f, name_en: e.target.value }))} type="text" className="d-form__input" />
              </div>
            </div>
            <div className="d-form__row">
              <div className="d-form__group">
                <label>{dir === 'rtl' ? 'المعرف (slug)' : 'Slug'}</label>
                <input value={catForm.slug} onChange={e => setCatForm(f => ({ ...f, slug: e.target.value }))} type="text" className="d-form__input" placeholder="website-templates" />
              </div>
              <div className="d-form__group">
                <label>{dir === 'rtl' ? 'أيقونة' : 'Icon'}</label>
                <input value={catForm.icon} onChange={e => setCatForm(f => ({ ...f, icon: e.target.value }))} type="text" className="d-form__input" placeholder="layout" />
              </div>
            </div>
            <div className="d-form__row">
              <div className="d-form__group">
                <label>{dir === 'rtl' ? 'الترتيب' : 'Sort Order'}</label>
                <input value={catForm.sort_order} onChange={e => setCatForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} type="number" className="d-form__input" />
              </div>
              <div className="d-form__group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 44 }}>
                  <input type="checkbox" checked={catForm.enabled} onChange={e => setCatForm(f => ({ ...f, enabled: e.target.checked }))} style={{ width: 18, height: 18 }} />
                  {dir === 'rtl' ? 'مفعل' : 'Enabled'}
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn--primary">{catForm.id ? (dir === 'rtl' ? 'حفظ التعديلات' : 'Save Changes') : (dir === 'rtl' ? 'إضافة التصنيف' : 'Add Category')}</button>
              {catForm.id && <button type="button" className="btn" onClick={resetCatForm}>{dir === 'rtl' ? 'إلغاء التعديل' : 'Cancel Edit'}</button>}
            </div>
          </form>
        </div>

        <div className="d-card">
          <h3 className="d-card__title">{dir === 'rtl' ? 'التصنيفات الحالية' : 'Current Categories'}</h3>
          <div className="d-table-wrap">
            <table className="d-table">
              <thead>
                <tr>
                  <th>{dir === 'rtl' ? 'التصنيف' : 'Category'}</th>
                  <th>{dir === 'rtl' ? 'الترتيب' : 'Order'}</th>
                  <th>{dir === 'rtl' ? 'المنتجات' : 'Products'}</th>
                  <th>{dir === 'rtl' ? 'الحالة' : 'Status'}</th>
                  <th>{dir === 'rtl' ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td>
                      <strong>{dir === 'rtl' ? (c.name || c.name_en) : (c.name_en || c.name)}</strong>
                      {c.icon && <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>{c.icon}</div>}
                    </td>
                    <td>{c.sort_order ?? 0}</td>
                    <td>{productCount(c.id)}</td>
                    <td><StatusPill status={c.enabled ? 'active' : 'hidden'} dir={dir} /></td>
                    <td>
                      <div className="d-actions" style={{ flexWrap: 'wrap' }}>
                        <button className="d-actions__btn" onClick={() => toggleCategory(c)}>
                          {c.enabled ? (dir === 'rtl' ? 'إخفاء' : 'Disable') : (dir === 'rtl' ? 'تفعيل' : 'Enable')}
                        </button>
                        <button className="d-actions__btn" onClick={() => openEditCategory(c)}>{dir === 'rtl' ? 'تعديل' : 'Edit'}</button>
                        <button className="d-actions__btn d-actions__btn--danger" onClick={() => deleteCategory(c)}>{dir === 'rtl' ? 'حذف' : 'Delete'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && <tr><td colSpan={5} className="d-empty" style={{ textAlign: 'center' }}>{dir === 'rtl' ? 'أضف أول تصنيف' : 'Add your first category'}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  const [settingsForm, setSettingsForm] = useState({ name: 'مَورد', commission: 15, minPayout: 50, supportEmail: 'support@mawrid.com' });

  const renderSettings = () => (
    <div className="d-card">
      <h3 className="d-card__title">{dir === 'rtl' ? 'إعدادات المنصة' : 'Platform Settings'}</h3>
      <form className="d-form" onSubmit={(e) => { e.preventDefault(); notify(dir === 'rtl' ? 'تم حفظ الإعدادات' : 'Settings saved'); }}>
        <div className="d-form__row">
          <div className="d-form__group">
            <label>{dir === 'rtl' ? 'اسم المنصة' : 'Platform Name'}</label>
            <input type="text" value={settingsForm.name} onChange={e => setSettingsForm(f => ({ ...f, name: e.target.value }))} className="d-form__input" />
          </div>
          <div className="d-form__group">
            <label>{dir === 'rtl' ? 'نسبة العمولة (%)' : 'Commission Rate (%)'}</label>
            <input type="number" value={settingsForm.commission} onChange={e => setSettingsForm(f => ({ ...f, commission: e.target.value }))} className="d-form__input" />
          </div>
        </div>
        <div className="d-form__row">
          <div className="d-form__group">
            <label>{dir === 'rtl' ? 'الحد الأدنى للسحب' : 'Minimum Payout'}</label>
            <input type="number" value={settingsForm.minPayout} onChange={e => setSettingsForm(f => ({ ...f, minPayout: e.target.value }))} className="d-form__input" />
          </div>
          <div className="d-form__group">
            <label>{dir === 'rtl' ? 'بريد الدعم' : 'Support Email'}</label>
            <input type="email" value={settingsForm.supportEmail} onChange={e => setSettingsForm(f => ({ ...f, supportEmail: e.target.value }))} className="d-form__input" />
          </div>
        </div>
        <button type="submit" className="btn btn--primary" style={{ alignSelf: 'flex-start' }}>{dir === 'rtl' ? 'حفظ الإعدادات' : 'Save Settings'}</button>
      </form>
    </div>
  );

  const renderOrders = () => (
    <div className="d-card">
      <h3 className="d-card__title">{dir === 'rtl' ? 'إدارة الطلبات' : 'Order Management'}</h3>
      <p className="d-empty">{dir === 'rtl' ? 'لا توجد طلبات بعد — ستظهر الطلبات هنا فور تفعيل نظام الشراء' : 'No orders yet — orders will appear here once purchasing is enabled'}</p>
    </div>
  );

  const renderPayouts = () => (
    <div className="d-card">
      <h3 className="d-card__title">{dir === 'rtl' ? 'إدارة المدفوعات' : 'Payout Management'}</h3>
      <p className="d-empty">{dir === 'rtl' ? 'لا توجد مدفوعات بعد — ستظهر هنا عند تفعيل المدفوعات' : 'No payouts yet — payouts will appear here once payments are enabled'}</p>
    </div>
  );

  const renderReviews = () => (
    <div className="d-card">
      <h3 className="d-card__title">{dir === 'rtl' ? 'إدارة التقييمات' : 'Review Management'}</h3>
      <p className="d-empty">{dir === 'rtl' ? 'لا توجد تقييمات بعد' : 'No reviews yet'}</p>
    </div>
  );

  const renderReports = () => (
    <div className="d-card">
      <h3 className="d-card__title">{dir === 'rtl' ? 'التقارير' : 'Reports'}</h3>
      <div className="d-grid d-grid--sm">
        <div className="d-balance"><span className="d-balance__label">{dir === 'rtl' ? 'إيرادات المحفظة' : 'Total Revenue'}</span><span className="d-balance__amount">{formatMoney(products.reduce((s, p) => s + ((Number(p.sales) || 0) * (Number(p.sale_price != null ? p.sale_price : p.price) || 0)), 0))}</span></div>
        <div className="d-balance"><span className="d-balance__label">{dir === 'rtl' ? 'إجمالي المبيعات' : 'Total Sales'}</span><span className="d-balance__amount">{products.reduce((s, p) => s + (Number(p.sales) || 0), 0)}</span></div>
        <div className="d-balance"><span className="d-balance__label">{dir === 'rtl' ? 'المنتجات النشطة' : 'Active Products'}</span><span className="d-balance__amount">{activeProducts.length}</span></div>
        <div className="d-balance"><span className="d-balance__label">{dir === 'rtl' ? 'المنتجات المعلقة' : 'Pending Products'}</span><span className="d-balance__amount">{pendingProducts.length}</span></div>
      </div>
      <p className="d-empty" style={{ padding: '24px 0 0' }}>{dir === 'rtl' ? 'تفصيل كامل للتقارير قريباً' : 'Detailed reports coming soon'}</p>
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
      <div className="d-content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <span style={{ color: 'var(--color-secondary)', fontSize: '0.9375rem' }}>{dir === 'rtl' ? 'جارٍ التحميل...' : 'Loading...'}</span>
          </div>
        ) : dbError ? (
          <div className="d-card">
            <h3 className="d-card__title">{dir === 'rtl' ? 'قاعدة البيانات غير متصلة' : 'Database not connected'}</h3>
            <p className="d-empty">{dir === 'rtl'
              ? 'متغيرات البيئة (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) غير مضبوطة في هذا البناء.'
              : 'Environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) are not configured in this build.'}</p>
          </div>
        ) : renderContent()}
      </div>
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