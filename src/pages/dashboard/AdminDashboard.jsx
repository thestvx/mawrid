import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import DashIcon from '../../components/dashboard/DashIcon';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { subscriptionGroups } from '../../data/subscriptions';
import { matchPlanProduct } from '../../lib/plans';

const EMPTY_PRODUCT = {
  name: '',
  name_en: '',
  description: '',
  price: '',
  sale_price: '',
  price_eur: '',
  sale_price_eur: '',
  price_dzd: '',
  sale_price_dzd: '',
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

const PRICING_MIGRATION_SQL = `ALTER TABLE products
  ADD COLUMN IF NOT EXISTS price_eur numeric,
  ADD COLUMN IF NOT EXISTS sale_price_eur numeric,
  ADD COLUMN IF NOT EXISTS price_dzd numeric,
  ADD COLUMN IF NOT EXISTS sale_price_dzd numeric;`;

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
      const formatted = Number.isInteger(target) ? Math.floor(current).toLocaleString('en-US') : current.toFixed(2);
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

function useSparklineId() {
  const id = useMemo(() => 'spark-' + Math.random().toString(36).slice(2, 8), []);
  return id;
}

function Sparkline({ data = [], color = '#22C55E', width = 96, height = 32 }) {
  const gid = useSparklineId();
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = (i * step).toFixed(1);
    const y = (height - 4 - ((v - min) / range) * (height - 8)).toFixed(1);
    return `${x},${y}`;
  });
  const area = `0,${height} ${pts.join(' ')} ${width},${height}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" aria-hidden="true" className="d-stat__spark">
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline points={pts.join(' ')} stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function StatCard({ label, value, suffix, prefix, trend, trendLabel, trendColor, spark, sparkColor = '#22C55E', icon, iconBg, glowColor, delay }) {
  const displayValue = useAnimatedNumber(value, 2500, prefix || '', suffix || '');
  return (
    <div className="d-stat" style={{ animation: `dStatIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms both` }}>
      <div className="stat-glow" style={{ background: glowColor || 'rgba(255, 98, 1, 0.14)' }} />
      <div className="d-stat__top">
        <div>
          <span className="d-stat__label">{label}</span>
          <span className="d-stat__value">{displayValue}</span>
        </div>
        <div className="d-stat__icon" style={{ background: iconBg || 'rgba(255, 98, 1, 0.12)', color: trendColor || 'var(--color-primary)' }}>
          <DashIcon name={icon} size={22} />
        </div>
      </div>
      <div className="d-stat__foot">
        {spark ? <Sparkline data={spark} color={sparkColor} /> : null}
        {trend ? <span className="d-stat__trend" style={trendColor ? { color: trendColor, borderColor: trendColor } : undefined}>{trend}</span> : null}
        {trendLabel ? <span className="d-stat__trend-label">{trendLabel}</span> : null}
      </div>
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

function HoverPreview({ src, name, size = 38 }) {
  const [pos, setPos] = useState(null);
  const preview = pos && src ? createPortal(
    (() => {
      const pw = 330;
      const ph = 420;
      const gap = 18;
      const left = pos.x + gap + pw <= window.innerWidth - 8 ? pos.x + gap : Math.max(8, pos.x - gap - pw);
      const top = pos.y + gap + ph <= window.innerHeight - 8 ? pos.y + gap : Math.max(8, pos.y - gap - ph);
      return (
        <span
          className="d-img-hover__preview"
          style={{
            position: 'fixed',
            left,
            top,
            maxWidth: pw,
            maxHeight: ph,
            zIndex: 2147480000,
          }}
        >
          <img src={src} alt={name} />
        </span>
      );
    })(),
    document.body
  ) : null;
  return (
    <span
      className="d-img-hover"
      style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}
      onMouseEnter={(e) => setPos({ x: e.clientX, y: e.clientY })}
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
      onMouseLeave={() => setPos(null)}
    >
      <ProductImage src={src} name={name} size={size} />
      {preview}
    </span>
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
  const [pricingColumnsReady, setPricingColumnsReady] = useState(true);
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

  // ── Subscription sections & branches state ──
  const [openBranches, setOpenBranches] = useState(() => new Set());
  const [priceDraft, setPriceDraft] = useState({});
  const [syncing, setSyncing] = useState(false);

  const categoriesBySlug = useMemo(() => {
    const m = {};
    categories.forEach(c => { if (!m[c.slug]) m[c.slug] = c; });
    return m;
  }, [categories]);

  const sectionsData = useMemo(() => {
    return subscriptionGroups.map(group => ({
      ...group,
      branches: group.subs.map(sub => {
        const category = categoriesBySlug[sub.categorySlug] || null;
        const branchProducts = category
          ? products.filter(p => p.category_id === category.id)
          : [];
        return { ...sub, category, products: branchProducts };
      }),
    }));
  }, [categoriesBySlug, products]);

  const subscriptionCatIds = useMemo(() => {
    const ids = new Set();
    sectionsData.forEach(g => g.branches.forEach(b => { if (b.category) ids.add(b.category.id); }));
    return ids;
  }, [sectionsData]);
  const subProducts = useMemo(
    () => products.filter(p => subscriptionCatIds.has(p.category_id)),
    [products, subscriptionCatIds]
  );
  const totalBranches = sectionsData.reduce((s, g) => s + g.branches.length, 0);

  const planImgByProduct = useMemo(() => {
    const map = {};
    sectionsData.forEach((g) => g.branches.forEach((b) => {
      (b.plans || []).forEach((src) => {
        const m = matchPlanProduct(src, b.products);
        if (m) map[m.id] = src;
      });
    }));
    return map;
  }, [sectionsData]);

  const toggleBranch = (key) => {
    setOpenBranches(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const setDraftPrice = (id, field, value) => {
    setPriceDraft(d => ({ ...d, [id]: { ...(d[id] || {}), [field]: value } }));
  };

  const draftOr = (p, field, draftVal) => {
    const raw = draftVal;
    if (raw === undefined) return p[field] != null ? p[field] : null;
    if (raw === '') return null;
    const n = parseFloat(raw);
    return isFinite(n) ? n : null;
  };

  const saveQuickPrice = async (p) => {
    const d = priceDraft[p.id] || {};
    const price = d.price !== undefined && d.price !== '' ? parseFloat(d.price) : (Number(p.price) || 0);
    const hasSale = d.sale_price !== undefined;
    const sale = hasSale && d.sale_price !== '' ? parseFloat(d.sale_price) : (p.sale_price != null ? p.sale_price : null);
    const nameChanged = d.name !== undefined && d.name.trim() !== (p.name || '');
    const nameEnChanged = d.name_en !== undefined && d.name_en.trim() !== (p.name_en || '');
    const payload = {
      price,
      sale_price: sale,
      ...(nameChanged ? { name: d.name.trim() } : {}),
      ...(nameEnChanged ? { name_en: d.name_en.trim() } : {}),
      ...(pricingColumnsReady ? {
        price_eur: draftOr(p, 'price_eur', d.price_eur),
        sale_price_eur: draftOr(p, 'sale_price_eur', d.sale_price_eur),
        price_dzd: draftOr(p, 'price_dzd', d.price_dzd),
        sale_price_dzd: draftOr(p, 'sale_price_dzd', d.sale_price_dzd),
      } : {}),
    };
    const res = await supabase.from('products').update(payload).eq('id', p.id);
    if (res.error) { notify(dir === 'rtl' ? 'فشل الحفظ' : 'Failed to save'); return; }
    const next = { ...priceDraft };
    delete next[p.id];
    setPriceDraft(next);
    notify(nameChanged
      ? (dir === 'rtl' ? 'تم حفظ اسم العرض والسعر' : 'Offer name & price saved')
      : (dir === 'rtl' ? 'تم تحديث السعر' : 'Price updated'));
    loadAll();
  };

  const ensureBranchCategory = useCallback(async () => {
    const rows = [];
    subscriptionGroups.forEach((g, gi) => {
      rows.push({ name: g.title_ar, name_en: g.title_en, slug: g.categorySlug, icon: 'category', enabled: true, sort_order: gi * 100 + 1 });
      g.subs.forEach((s, si) => {
        rows.push({ name: s.title_ar, name_en: s.title_en, slug: s.categorySlug, icon: 'subscriptions', enabled: true, sort_order: gi * 100 + si + 2 });
      });
    });
    const missing = rows.filter(r => !categoriesBySlug[r.slug]);
    if (missing.length === 0) {
      notify(dir === 'rtl' ? 'جميع الأقسام والفروع مرتبطة مسبقاً' : 'All sections & branches are already synced');
      return;
    }
    setSyncing(true);
    let ok = 0;
    for (const row of missing) {
      const res = await supabase.from('categories').insert(row);
      if (res.error) { notify(dir === 'rtl' ? 'فشل المزامنة: ' + res.error.message : 'Sync failed: ' + res.error.message); break; }
      ok += 1;
    }
    setSyncing(false);
    notify(dir === 'rtl' ? `تمت مزامنة ${ok} تصنيف` : `Synced ${ok} categories`);
    loadAll();
    // loadAll is defined below and is stable ([] deps); keep it out of deps to avoid TDZ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesBySlug, dir, notify]);

  const openAddForBranch = (sub, group) => {
    const category = categoriesBySlug[sub.categorySlug] || null;
    setEditing(null);
    setForm({
      ...EMPTY_PRODUCT,
      name: sub.title_ar,
      name_en: sub.title_en,
      description: group ? `اشتراك ${sub.title_ar} — ${group.title_ar}` : '',
      category_id: category ? category.id : '',
      seller_name: 'مَورد',
      store_name: 'مَورد',
      stock: 999,
      status: 'active',
    });
    setShowForm(true);
  };

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

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from('products')
      .select('price_eur')
      .limit(1)
      .then((res) => {
        if (res.error && /price_eur/.test(res.error.message || '')) setPricingColumnsReady(false);
      })
      .catch(() => {});
  }, []);

  const copyMigrationSql = async () => {
    try {
      await navigator.clipboard.writeText(PRICING_MIGRATION_SQL);
      notify(dir === 'rtl' ? 'تم نسخ كود SQL — ألصقه في محرر SQL في Supabase' : 'SQL copied — paste it into the Supabase SQL editor');
    } catch {
      notify(dir === 'rtl' ? 'تعذّر النسخ' : 'Copy failed');
    }
  };

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
      price_eur: p.price_eur != null ? String(p.price_eur) : '',
      sale_price_eur: p.sale_price_eur != null ? String(p.sale_price_eur) : '',
      price_dzd: p.price_dzd != null ? String(p.price_dzd) : '',
      sale_price_dzd: p.sale_price_dzd != null ? String(p.sale_price_dzd) : '',
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

  const savePriceNumber = (v) => {
    if (v === '' || v == null) return null;
    const n = parseFloat(v);
    return isFinite(n) ? n : null;
  };

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
      ...(pricingColumnsReady ? {
        price_eur: savePriceNumber(form.price_eur),
        sale_price_eur: savePriceNumber(form.sale_price_eur),
        price_dzd: savePriceNumber(form.price_dzd),
        sale_price_dzd: savePriceNumber(form.sale_price_dzd),
      } : {}),
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
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0 });
  };

  const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString(dir === 'rtl' ? 'ar' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderOverview = () => {
    const totalSales = products.reduce((s, p) => s + (Number(p.sales) || 0), 0);
    const salesSeries = products.map(p => Number(p.sales) || 0).slice(0, 12);
    const cumSales = [];
    let acc = 0;
    salesSeries.forEach(v => { acc += v; cumSales.push(acc); });
    const activeSeries = activeProducts.map(p => Number(p.sales) || 0).slice(0, 12);
    const userSeries = users.map((_, i) => i + 1);
    const sellerSeries = sellers.map((_, i) => i + 1);
    const catSeries = categories.map((_, i) => i + 1);
    return (
      <>
        <div className="d-welcome">
          <h2 className="d-welcome__title">{dir === 'rtl' ? 'نظرة عامة على المنصة' : 'Platform Overview'}</h2>
          <p className="d-welcome__sub">{dir === 'rtl' ? 'التحكم الكامل في منصة مَورد — كل شيء يعمل بالبيانات الحية' : 'Full control of the Mawrid platform — all powered by live data'}</p>
        </div>

        <div className="d-stats">
          <StatCard label={dir === 'rtl' ? 'المنتجات' : 'Products'} value={products.length} spark={salesSeries} sparkColor="#FF8A45" icon="products" iconBg="rgba(255, 98, 1, 0.14)" glowColor="rgba(255, 98, 1, 0.18)" trend={pendingProducts.length > 0 ? `${pendingProducts.length} ${dir === 'rtl' ? 'بانتظار المراجعة' : 'pending'}` : null} trendColor="#FBBF24" delay={100} />
          <StatCard label={dir === 'rtl' ? 'المنتجات النشطة' : 'Active Products'} value={activeProducts.length} spark={activeSeries} sparkColor="#34D399" icon="bag" iconBg="rgba(16, 185, 129, 0.14)" glowColor="rgba(16, 185, 129, 0.18)" trend={activeProducts.length ? `${Math.min(100, Math.round((activeProducts.length / (products.length || 1)) * 100))}% ${dir === 'rtl' ? 'من الإجمالي' : 'of total'}` : null} trendColor="#6EE7B7" delay={200} />
          <StatCard label={dir === 'rtl' ? 'التصنيفات' : 'Categories'} value={categories.filter(c => c.enabled).length} spark={catSeries} sparkColor="#A78BFA" icon="layers" iconBg="rgba(139, 92, 246, 0.14)" glowColor="rgba(139, 92, 246, 0.2)" trend={dir === 'rtl' ? 'مفعّلة' : 'Enabled'} delay={300} />
          <StatCard label={dir === 'rtl' ? 'المستخدمون' : 'Users'} value={users.length} spark={userSeries} sparkColor="#5B7CFA" icon="users" iconBg="rgba(73, 75, 214, 0.16)" glowColor="rgba(73, 75, 214, 0.2)" trend={users.length ? `${sellers.length} ${dir === 'rtl' ? 'بائعين' : 'sellers'}` : null} trendColor="#94A3B8" delay={400} />
          <StatCard label={dir === 'rtl' ? 'البائعون' : 'Sellers'} value={sellers.length} spark={sellerSeries} sparkColor="#B6B9FF" icon="stores" iconBg="rgba(133, 137, 255, 0.16)" glowColor="rgba(133, 137, 255, 0.2)" trend={dir === 'rtl' ? 'نشط' : 'Active'} delay={500} />
          <StatCard label={dir === 'rtl' ? 'إجمالي المبيعات' : 'Total Sales'} value={totalSales} spark={cumSales} sparkColor="#FBBF24" icon="analytics" iconBg="rgba(245, 158, 11, 0.14)" glowColor="rgba(245, 158, 11, 0.2)" trend={dir === 'rtl' ? 'تراكمي' : 'Cumulative'} delay={600} />
        </div>

        <div className="d-grid">
          <a href="?tab=subscriptions" className="d-quick-card" onClick={(e) => { e.preventDefault(); setTab('subscriptions'); }}>
            <span className="d-quick-card__icon" style={{ color: 'var(--color-primary)' }}><DashIcon name="subscription" size={24} /></span>
            <span>{dir === 'rtl' ? 'الاشتراكات والأسعار' : 'Subscriptions & Pricing'}</span>
          </a>
          <a href="?tab=users" className="d-quick-card" onClick={(e) => { e.preventDefault(); setTab('users'); }}>
            <span className="d-quick-card__icon" style={{ color: '#494bd6' }}><DashIcon name="users" size={24} /></span>
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
    </>
  );

  const renderSubscriptions = () => {
    const stdPrice = (v) => {
      const n = Number(v) || 0;
      return n ? '$' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0 }) : '—';
    };
    const priceRange = (prods) => {
      const active = prods.filter(p => p.status !== 'rejected').map(p => Number(p.sale_price != null ? p.sale_price : p.price) || 0);
      if (!active.length) return '—';
      const min = Math.min(...active);
      const max = Math.max(...active);
      return min === max ? stdPrice(min) : `${stdPrice(min)} – ${stdPrice(max)}`;
    };
    const displayImg = (p) => {
      const th = p.thumbnail || (p.images && p.images[0]);
      if (th && th.startsWith('/sub/')) return th;
      return planImgByProduct[p.id] || th;
    };

    return (
      <>
        <div className="d-card d-card--flat">
          <div className="d-card__header">
            <div>
              <h3 className="d-card__title" style={{ marginBottom: 8 }}>
                {dir === 'rtl' ? 'إدارة اشتراكات الأقسام والفروع' : 'Subscription Sections & Branches'}
              </h3>
              <p className="d-card__sub" style={{ margin: 0, color: 'var(--color-secondary)', fontSize: '0.875rem' }}>
                {dir === 'rtl'
                  ? 'اضبط الأسعار وعدد المنتجات لكل قسم وفرع — تعدّل مباشرة وتظهر في الموقع فوراً.'
                  : 'Set prices and manage products for every section & branch — changes appear on the site instantly.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn" onClick={ensureBranchCategory} disabled={syncing} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <DashIcon name="refresh" size={16} />
                {syncing
                  ? (dir === 'rtl' ? 'جارٍ المزامنة...' : 'Syncing...')
                  : (dir === 'rtl' ? 'مزامنة الأقسام والفروع' : 'Sync sections & branches')}
              </button>
            </div>
          </div>

          <div className="d-stats d-stats--compact">
            <StatCard label={dir === 'rtl' ? 'الأقسام' : 'Sections'} value={sectionsData.length} icon="layers" iconBg="rgba(139, 92, 246, 0.14)" glowColor="rgba(139, 92, 246, 0.2)" delay={50} />
            <StatCard label={dir === 'rtl' ? 'الفروع' : 'Branches'} value={totalBranches} icon="subscription" iconBg="rgba(73, 75, 214, 0.16)" glowColor="rgba(73, 75, 214, 0.2)" delay={120} />
            <StatCard label={dir === 'rtl' ? 'المنتجات' : 'Products'} value={subProducts.length} icon="products" iconBg="rgba(255, 98, 1, 0.14)" glowColor="rgba(255, 98, 1, 0.18)" delay={190} />
            <StatCard label={dir === 'rtl' ? 'بانتظار المراجعة' : 'Pending'} value={subProducts.filter(p => p.status === 'pending').length} icon="clock" iconBg="rgba(245, 158, 11, 0.14)" glowColor="rgba(245, 158, 11, 0.2)" trend={subProducts.filter(p => p.status === 'pending').length ? null : (dir === 'rtl' ? 'كلها معتمدة' : 'All approved')} delay={260} />
          </div>
        </div>

        {sectionsData.map(group => {
          const sectionTotal = group.branches.reduce((s, b) => s + b.products.length, 0);
          const sectionPending = group.branches.reduce((s, b) => s + b.products.filter(p => p.status === 'pending').length, 0);
          return (
            <div className="d-card d-sub-section" key={group.key}>
              <div className="d-sub-section__head">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {group.card ? (
                    <img src={group.card} alt="" className="d-sub-section__thumb" loading="lazy" />
                  ) : (
                    <div className="d-sub-section__thumb d-sub-section__thumb--empty">
                      <DashIcon name="layers" size={22} />
                    </div>
                  )}
                  <div>
                    <h3 className="d-card__title" style={{ marginBottom: 4 }}>{dir === 'rtl' ? group.title_ar : group.title_en}</h3>
                    <p className="d-card__sub" style={{ margin: 0, color: 'var(--color-secondary)', fontSize: '0.8125rem' }}>
                      {dir === 'rtl' ? `${group.branches.length} فروع · ${sectionTotal} منتجات` : `${group.branches.length} branches · ${sectionTotal} products`}
                    </p>
                  </div>
                </div>
                {sectionPending > 0 && <span className="d-badge d-badge--pending">{sectionPending} {dir === 'rtl' ? 'بانتظار المراجعة' : 'pending'}</span>}
              </div>

              <div className="d-sub-section__branches">
                {group.branches.map((branch) => {
                  const isOpen = openBranches.has(branch.key);
                  const hasCategory = !!branch.category;
                  return (
                    <div className={`d-sub-branch ${isOpen ? 'd-sub-branch--open' : ''}`} key={branch.key}>
                      <div className="d-sub-branch__head" onClick={() => toggleBranch(branch.key)} role="button" tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleBranch(branch.key); } }}>
                        <span className="d-sub-branch__img">
                          <img src={branch.icon} alt="" loading="lazy" />
                        </span>
                        <div className="d-sub-branch__meta">
                          <strong>{dir === 'rtl' ? branch.title_ar : branch.title_en}</strong>
                          <span>
                            {hasCategory
                              ? (dir === 'rtl' ? (branch.category.name || branch.category.name_en) : (branch.category.name_en || branch.category.name))
                              : (dir === 'rtl' ? 'لا يوجد تصنيف مرتبط — اضغط مزامنة' : 'No linked category — run sync')}
                            {' · '}{branch.products.length} {dir === 'rtl' ? 'منتجات' : 'products'}
                          </span>
                        </div>
                        <div className="d-sub-branch__price" onClick={(e) => e.stopPropagation()}>
                          <span className="d-sub-branch__price-label">{dir === 'rtl' ? 'نطاق السعر' : 'Price range'}</span>
                          <span className="d-sub-branch__price-value">{priceRange(branch.products)}</span>
                        </div>
                        <div className="d-sub-branch__actions" onClick={(e) => e.stopPropagation()}>
                          <button className="d-actions__btn d-actions__btn--approve" onClick={() => openAddForBranch(branch, group)}>
                            <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>+</span> {dir === 'rtl' ? 'منتج' : 'Product'}
                          </button>
                        </div>
                        <span className="d-sub-branch__chevron" aria-hidden="true">{isOpen ? (dir === 'rtl' ? '▴' : '▴') : (dir === 'rtl' ? '▾' : '▾')}</span>
                      </div>

                      {isOpen && (
                        branch.products.length === 0 ? (
                          <div className="d-empty" style={{ padding: '16px 20px' }}>
                            {dir === 'rtl' ? 'لا توجد منتجات لهذا الفرع بعد — اضغط "+ منتج" لإضافة أول منتج وتحديد سعره.' : 'No products for this branch yet — click "+ Product" to add the first one and set its price.'}
                          </div>
                        ) : (
                          <div className="d-table-wrap">
                            <table className="d-table d-table--products">
                              <thead>
                                <tr>
                                  <th>{dir === 'rtl' ? 'المنتج' : 'Product'}</th>
                                  <th>{dir === 'rtl' ? 'السعر ($)' : 'Price ($)'}</th>
                                  <th>{dir === 'rtl' ? 'الخصم ($)' : 'Sale ($)'}</th>
                                  <th>{dir === 'rtl' ? 'السعر (€)' : 'Price (€)'}</th>
                                  <th>{dir === 'rtl' ? 'السعر (دج)' : 'Price (دج)'}</th>
                                  <th>{dir === 'rtl' ? 'المبيعات' : 'Sales'}</th>
                                  <th>{dir === 'rtl' ? 'الحالة' : 'Status'}</th>
                                  <th>{dir === 'rtl' ? 'إجراءات' : 'Actions'}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {branch.products.map((p) => (
                                  <tr key={p.id}>
                                    <td>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 250 }}>
                                        <HoverPreview src={displayImg(p)} name={p.name} size={38} />
                                        <div style={{ overflow: 'hidden', flex: 1 }}>
                                          <input
                                            className="d-form__input d-name-input"
                                            value={priceDraft[p.id]?.name ?? (p.name ?? '')}
                                            onChange={e => setDraftPrice(p.id, 'name', e.target.value)}
                                            placeholder={dir === 'rtl' ? 'اسم العرض...' : 'Offer name...'}
                                            title={dir === 'rtl' ? 'عدّل اسم العرض — يظهر في الموقع فور الحفظ' : 'Edit the offer name — appears on the site after saving'}
                                          />
                                          <input
                                            className="d-form__input d-name-input d-name-input--en"
                                            value={priceDraft[p.id]?.name_en ?? (p.name_en ?? '')}
                                            onChange={e => setDraftPrice(p.id, 'name_en', e.target.value)}
                                            placeholder="EN name..."
                                            dir="ltr"
                                          />
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="d-form__input d-price-input"
                                        value={priceDraft[p.id]?.price ?? (p.price ?? 0)}
                                        onChange={e => setDraftPrice(p.id, 'price', e.target.value)}
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="d-form__input d-price-input"
                                        value={priceDraft[p.id]?.sale_price ?? (p.sale_price ?? '')}
                                        onChange={e => setDraftPrice(p.id, 'sale_price', e.target.value)}
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="d-form__input d-price-input"
                                        value={priceDraft[p.id]?.price_eur ?? (p.price_eur ?? '')}
                                        onChange={e => setDraftPrice(p.id, 'price_eur', e.target.value)}
                                        disabled={!pricingColumnsReady}
                                        title={dir === 'rtl' ? 'السعر باليورو — فارغ = تحويل تلقائي' : 'Price in EUR — empty = auto'}
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        className="d-form__input d-price-input"
                                        value={priceDraft[p.id]?.price_dzd ?? (p.price_dzd ?? '')}
                                        onChange={e => setDraftPrice(p.id, 'price_dzd', e.target.value)}
                                        disabled={!pricingColumnsReady}
                                        title={dir === 'rtl' ? 'السعر بالدينار — فارغ = تحويل تلقائي' : 'Price in DZD — empty = auto'}
                                      />
                                    </td>
                                    <td>{p.sales || 0}</td>
                                    <td><StatusPill status={p.status} dir={dir} /></td>
                                    <td>
                                      <div className="d-actions" style={{ flexWrap: 'wrap' }}>
                                        <button className="d-actions__btn d-actions__btn--approve" onClick={() => saveQuickPrice(p)}>{dir === 'rtl' ? 'حفظ' : 'Save'}</button>
                                        {p.status !== 'active' && (
                                          <button className="d-actions__btn d-actions__btn--approve" onClick={() => setProductStatus(p.id, 'active')}>{dir === 'rtl' ? 'اعتماد' : 'Approve'}</button>
                                        )}
                                        <button className="d-actions__btn" onClick={() => openEdit(p)}>{dir === 'rtl' ? 'تعديل' : 'Edit'}</button>
                                        <button className="d-actions__btn d-actions__btn--danger" onClick={() => removeProduct(p)}>{dir === 'rtl' ? 'حذف' : 'Delete'}</button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </>
    );
  };

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

  const renderTopbar = () => {
    const titles = {
      overview: dir === 'rtl' ? 'نظرة عامة' : 'Overview',
      subscriptions: dir === 'rtl' ? 'الاشتراكات والأسعار' : 'Subscriptions & Pricing',
      users: dir === 'rtl' ? 'إدارة المستخدمين' : 'User Management',
      sellers: dir === 'rtl' ? 'إدارة البائعين' : 'Seller Management',
      products: dir === 'rtl' ? 'مراجعة المنتجات' : 'Product Moderation',
      orders: dir === 'rtl' ? 'إدارة الطلبات' : 'Order Management',
      payouts: dir === 'rtl' ? 'التسويات والارباح' : 'Payouts & Earnings',
      categories: dir === 'rtl' ? 'التصنيفات' : 'Categories',
      reviews: dir === 'rtl' ? 'التقييمات' : 'Reviews',
      reports: dir === 'rtl' ? 'التقارير' : 'Reports',
      settings: dir === 'rtl' ? 'إعدادات المنصة' : 'Platform Settings',
    };
    const subs = {
      overview: dir === 'rtl' ? 'متابعة أداء المنصة لحظياً' : 'Monitor platform performance in real time',
      subscriptions: dir === 'rtl' ? 'اضبط أسعار الأقسام والفروع والمنتجات' : 'Set prices for sections, branches & products',
      users: dir === 'rtl' ? 'إدارة حسابات المشترين والبائعين' : 'Manage buyer & seller accounts',
      sellers: dir === 'rtl' ? 'مراقبة أداء البائعين وأعمالهم' : 'Track seller activity and stores',
      products: dir === 'rtl' ? 'اعتماد المنتجات ومراجعة الجودة' : 'Approve and review products',
      orders: dir === 'rtl' ? 'تتبع الطلبات وحالاتها' : 'Track orders and their status',
      payouts: dir === 'rtl' ? 'تسوية الأرباح والمدفوعات' : 'Settle earnings and payouts',
      categories: dir === 'rtl' ? 'تنظيم تصنيفات المتجر' : 'Organize store categories',
      reviews: dir === 'rtl' ? 'إدارة تقييمات العملاء' : 'Manage customer reviews',
      reports: dir === 'rtl' ? 'تحليلات وأداء متقدم' : 'Advanced analytics & performance',
      settings: dir === 'rtl' ? 'ضبط إعدادات المنصة العامة' : 'Configure platform-wide settings',
    };
    const roleName = dir === 'rtl' ? 'مدير المنصة' : 'Platform Admin';
    return (
      <div className="d-topbar">
        <div>
          <h2 className="d-topbar__title">{titles[tab] || titles.overview}</h2>
          <p className="d-topbar__sub">{subs[tab] || subs.overview}</p>
        </div>
        <div className="d-topbar__right">
          <span className="d-live-badge">LIVE · {dir === 'rtl' ? 'بيانات حية' : 'Live data'}</span>
          <div className="d-user-chip">
            <InitialsAvatar name={user?.email || user?.username || 'A'} bg="linear-gradient(135deg, #FF6201, #B24300)" size={32} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="d-user-chip__name">{user?.username || user?.email?.split('@')[0] || 'Admin'}</span>
              <span className="d-user-chip__role">{roleName}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (tab) {
      case 'subscriptions': return renderSubscriptions();
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
        .d-stat:hover .stat-icon, .d-stat:hover .d-stat__icon { transform: scale(1.1); }
        .d-stat:hover .stat-glow { transform: scale(1.25); }
        .d-stat .stat-icon, .d-stat .d-stat__icon, .d-stat .stat-glow { transition: transform 0.35s ease; }
        .d-quick-card__icon { display: inline-flex; }
      `}</style>
      <div className="d-content">
        {!loading && !dbError && !pricingColumnsReady && (
          <div className="d-card d-card--notice">
            <h3 className="d-card__title">{dir === 'rtl' ? 'أعمدة أسعار العملات غير مضبوطة بعد' : 'Currency price columns not set up yet'}</h3>
            <p style={{ color: 'var(--color-secondary)', fontSize: '0.875rem', margin: '0 0 12px' }}>
              {dir === 'rtl'
                ? 'حقول اليورو والدينار ستتحول تلقائياً من السعر بالدولار لغاية ما تضيف الأعمدة. شغّل كود SQL التالي مرة واحدة في محرر SQL في Supabase لتفعيل أسعار مخصصة لكل عملة:'
                : 'EUR & DZD prices auto-convert from the USD price until you add the columns. Run this SQL once in the Supabase SQL editor to enable per-currency prices:'}
            </p>
            <pre className="d-migrate-sql" style={{ background: '#0f172a', color: '#cbd5e1', borderRadius: 12, padding: 14, fontSize: '0.8125rem', overflowX: 'auto', margin: '0 0 12px' }}>{PRICING_MIGRATION_SQL}</pre>
            <button className="d-actions__btn d-actions__btn--approve" onClick={copyMigrationSql}>
              {dir === 'rtl' ? 'نسخ كود SQL' : 'Copy SQL'}
            </button>
          </div>
        )}
        {!loading && !dbError && renderTopbar()}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <span style={{ color: '#94A3B8', fontSize: '0.9375rem' }}>{dir === 'rtl' ? 'جارٍ التحميل...' : 'Loading...'}</span>
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
                  <input value={form.name} onChange={e => setField('name', e.target.value)} className="d-form__input" required placeholder={dir === 'rtl' ? 'مثال: اشتراك نتفليكس شهري' : 'e.g. Netflix monthly subscription'} />
                </div>
                <div className="d-form__group">
                  <label>{dir === 'rtl' ? 'اسم المنتج (إنجليزي)' : 'Product Name (English)'}</label>
                  <input value={form.name_en} onChange={e => setField('name_en', e.target.value)} className="d-form__input" placeholder="e.g. Netflix Monthly" />
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
                  <label>{dir === 'rtl' ? 'السعر باليورو (€) (اختياري)' : 'Price in EUR (€) (optional)'}</label>
                  <input value={form.price_eur} onChange={e => setField('price_eur', e.target.value)} type="number" step="0.01" min="0" className="d-form__input" disabled={!pricingColumnsReady} placeholder={dir === 'rtl' ? 'فارغ = تحويل تلقائي' : 'empty = auto converted'} />
                </div>
                <div className="d-form__group">
                  <label>{dir === 'rtl' ? 'سعر الخصم باليورو (€)' : 'Sale Price in EUR (€)'}</label>
                  <input value={form.sale_price_eur} onChange={e => setField('sale_price_eur', e.target.value)} type="number" step="0.01" min="0" className="d-form__input" disabled={!pricingColumnsReady} placeholder={dir === 'rtl' ? 'فارغ = تلقائي' : 'empty = auto'} />
                </div>
              </div>

              <div className="d-form__row">
                <div className="d-form__group">
                  <label>{dir === 'rtl' ? 'السعر بالدينار (دج) (اختياري)' : 'Price in DZD (دج) (optional)'}</label>
                  <input value={form.price_dzd} onChange={e => setField('price_dzd', e.target.value)} type="number" step="any" min="0" className="d-form__input" disabled={!pricingColumnsReady} placeholder={dir === 'rtl' ? 'فارغ = تحويل تلقائي' : 'empty = auto converted'} />
                </div>
                <div className="d-form__group">
                  <label>{dir === 'rtl' ? 'سعر الخصم بالدينار (دج)' : 'Sale Price in DZD (دج)'}</label>
                  <input value={form.sale_price_dzd} onChange={e => setField('sale_price_dzd', e.target.value)} type="number" step="any" min="0" className="d-form__input" disabled={!pricingColumnsReady} placeholder={dir === 'rtl' ? 'فارغ = تلقائي' : 'empty = auto'} />
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
                <input value={form.tags} onChange={e => setField('tags', e.target.value)} className="d-form__input" placeholder="netflix, streaming, monthly" />
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