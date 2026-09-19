import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import DashIcon from '../../components/dashboard/DashIcon';
import ConfirmDialog from '../../components/dashboard/ConfirmDialog';
import VerificationCelebration from '../../components/dashboard/VerificationCelebration';
import VerifiedBadge from '../../components/dashboard/VerifiedBadge';
import { ImageField } from '../../components/dashboard/MediaUploader';
import { supabase, isSupabaseConfigured, hasSellerColumns, hasUserColumn, fetchCategories } from '../../lib/supabase';
import { SELLER_SPECIALTIES } from '../../data/sellers';
import './Dashboard.css';

const AVAILABILITY = [
  { key: 'full', ar: 'دوام كامل', en: 'Full time' },
  { key: 'part', ar: 'دوام جزئي', en: 'Part time' },
  { key: 'weekend', ar: 'نهاية الأسبوع فقط', en: 'Weekends only' },
  { key: 'custom', ar: 'مواعيد محددة', en: 'By appointment' },
];

const HOURS_ZONES = ['GST', 'AST', 'EET/PALESTINE +2', 'CET', 'GMT', 'EST', 'PST'];

const AVATAR_CROP = { aspect: 1, output: { w: 800, h: 800 } };
const COVER_CROP = { aspect: 1920 / 635, output: { w: 1920, h: 635 } };

const EMPTY_PROFILE = {
  name: '',
  store_name: '',
  email: '',
  phone: '',
  website: '',
  specialty: 'designers',
  availability: 'full',
  hours_from: '09:00',
  hours_to: '18:00',
  hours_zone: 'GST',
  bio: '',
  bio_en: '',
  avatar_url: '',
  cover: '',
  seller_status: 'pending',
};

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
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = easeOutCubic(progress);
      setValue(Math.floor(eased * (end - startValue) + startValue));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    }

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration]);

  return <>{value.toLocaleString('en-US')}{suffix}</>;
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

function mapProductRow(p) {
  const name = p.name || p.name_en || '';
  const image = p.thumbnail || (Array.isArray(p.images) && p.images[0]) || '';
  return {
    id: p.id,
    name,
    name_en: p.name_en || '',
    desc: p.description || '',
    price: Number(p.price) || 0,
    status: p.status || 'active',
    image,
    category_id: p.category_id || '',
    sales: Number(p.sales) || 0,
    stock: p.stock != null ? Number(p.stock) : 0,
    color: '#ff6201',
    initials: (name || 'N').slice(0, 2).toUpperCase(),
  };
}

export default function SellerDashboard() {
  const { t, dir } = useLanguage();
  const { user, role, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [saveErr, setSaveErr] = useState('');
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [prdReload, setPrdReload] = useState(0);
  const [prdFormOpen, setPrdFormOpen] = useState(false);
  const [prdForm, setPrdForm] = useState(null);
  const [prdBusy, setPrdBusy] = useState(false);
  const [prdErr, setPrdErr] = useState('');
  const [confirmPrd, setConfirmPrd] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const uid = user?.uid;
  const celebrationKey = uid ? 'mawrid_verified_celebrated_' + uid : '';
  const sellerStatus = profile.seller_status || user?.seller_status;
  const isPending = role === 'seller' && !!sellerStatus && sellerStatus !== 'verified';

  useEffect(() => {
    if (!uid || role !== 'seller') return;
    if (sellerStatus !== 'verified') return;
    try {
      if (localStorage.getItem(celebrationKey)) return;
    } catch {}
    setCelebrate(true);
  }, [uid, role, sellerStatus, celebrationKey]);

  useEffect(() => {
    if (uid && role === 'seller' && refreshUser) refreshUser();
  }, [uid, role, refreshUser]);

  const dismissCelebration = () => {
    try { localStorage.setItem(celebrationKey, '1'); } catch {}
    setCelebrate(false);
  };
  useEffect(() => {
    if (uid) {
      try {
        const raw = localStorage.getItem('mawrid_seller_profile_' + uid);
        if (raw) setProfile((p) => ({ ...p, ...JSON.parse(raw) }));
      } catch {}
    }
  }, [uid]);

  // Real products owned by this seller (products.seller_id = firebase uid)
  useEffect(() => {
    if (!uid || !supabase || !isSupabaseConfigured) {
      setProducts([]);
      setProductsLoading(false);
      return;
    }
    let flag = true;
    (async () => {
      setProductsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', uid)
        .order('created_at', { ascending: false });
      if (!flag) return;
      if (!error && Array.isArray(data)) setProducts(data.map(mapProductRow));
      setProductsLoading(false);
    })();
    return () => { flag = false; };
  }, [uid, prdReload]);

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return;
    let flag = true;
    (async () => {
      const { data } = await fetchCategories();
      if (flag && Array.isArray(data)) setCategories(data);
    })();
    return () => { flag = false; };
  }, []);

  useEffect(() => {
    if (!uid) return;
    let flag = true;
    (async () => {
      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('firebase_uid', uid)
          .maybeSingle();
        if (!flag) return;
        if (!error && data) {
          setProfile((p) => ({ ...p, ...data }));
          try {
            localStorage.setItem('mawrid_seller_profile_' + uid, JSON.stringify({ ...EMPTY_PROFILE, ...data }));
          } catch {}
        }
      }
      setProfileLoading(false);
    })();
    return () => {
      flag = false;
    };
  }, [uid]);

  const setField = (k, v) => setProfile((p) => ({ ...p, [k]: v }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');
    setSaveErr('');
    try {
      if (supabase && isSupabaseConfigured && uid) {
        const payload = {
          name: (profile.name || '').trim(),
          email: (profile.email || '').trim(),
          phone: (profile.phone || '').trim(),
          store_name: (profile.store_name || '').trim(),
        };
        if (await hasSellerColumns()) {
          payload.specialty = profile.specialty;
          payload.availability = profile.availability;
          payload.hours_from = profile.hours_from;
          payload.hours_to = profile.hours_to;
          payload.hours_zone = profile.hours_zone;
          payload.bio = profile.bio;
          payload.bio_en = profile.bio_en;
          payload.avatar_url = profile.avatar_url;
          payload.cover = profile.cover;
        }
        if (await hasUserColumn('website')) {
          payload.website = (profile.website || '').trim();
        }
        const { error } = await supabase.from('users').update(payload).eq('firebase_uid', uid);
        if (error) {
          setSaveErr(error.message);
        } else {
          setSavedMsg(dir === 'rtl' ? 'تم حفظ تغييراتك بنجاح' : 'Your changes were saved');
        }
      } else {
        setSavedMsg(dir === 'rtl' ? 'تم الحفظ محلياً' : 'Saved locally');
      }
      try {
        localStorage.setItem('mawrid_seller_profile_' + uid, JSON.stringify(profile));
      } catch {}
    } catch (err) {
      setSaveErr(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openPrdForm = (p) => {
    if (isPending) return;
    setPrdErr('');
    setPrdForm(p
      ? { id: p.id, name: p.name || '', name_en: p.name_en || '', desc: p.desc || '', price: p.price, status: p.status || 'active', image: p.image || '', category_id: p.category_id || '' }
      : { id: null, name: '', name_en: '', desc: '', price: '', status: 'active', image: '', category_id: '' });
    setPrdFormOpen(true);
  };

  const submitPrdForm = async (e) => {
    e.preventDefault();
    setPrdErr('');
    if (!prdForm?.name?.trim() || prdForm.price === '' || prdForm.price == null) return;
    if (!supabase || !isSupabaseConfigured || !uid) {
      setPrdErr(dir === 'rtl' ? 'تعذّر الاتصال بقاعدة البيانات' : 'Database connection unavailable');
      return;
    }
    setPrdBusy(true);
    const payload = {
      name: prdForm.name.trim(),
      name_en: (prdForm.name_en || prdForm.name).trim(),
      description: (prdForm.desc || '').trim(),
      price: Math.max(0, Number(prdForm.price) || 0),
      thumbnail: prdForm.image || '',
      images: prdForm.image ? [prdForm.image] : [],
      status: prdForm.status || 'active',
      category_id: prdForm.category_id || null,
      seller_id: uid,
      seller_name: (profile.name || '').trim(),
      store_name: (profile.store_name || '').trim(),
      stock: Number(prdForm.stock) || 999,
    };
    const res = prdForm.id
      ? await supabase.from('products').update(payload).eq('id', prdForm.id)
      : await supabase.from('products').insert(payload);
    setPrdBusy(false);
    if (res.error) {
      setPrdErr(res.error.message);
      return;
    }
    setPrdFormOpen(false);
    setPrdReload((k) => k + 1);
  };

  const removePrd = async (id) => {
    if (isPending) return;
    if (!supabase || !isSupabaseConfigured) return;
    setConfirmBusy(true);
    const { error } = await supabase.from('products').delete().eq('id', id);
    setConfirmBusy(false);
    setConfirmPrd(null);
    if (error) return;
    setPrdReload((k) => k + 1);
  };

  const productStatusLabel = (s) => {
    if (s === 'active') return dir === 'rtl' ? 'منشور' : 'Active';
    if (s === 'inactive') return dir === 'rtl' ? 'مخفف' : 'Inactive';
    return dir === 'rtl' ? 'مسودة' : 'Draft';
  };

  const specialtyLabel = (key) => {
    const s = SELLER_SPECIALTIES.find((x) => x.key === key);
    return s ? (dir === 'rtl' ? s.name_ar : s.name_en) : dir === 'rtl' ? 'غير محدد' : 'Not set';
  };

  const availabilityLabel = (key) => {
    const s = AVAILABILITY.find((x) => x.key === key);
    return s ? (dir === 'rtl' ? s.ar : s.en) : '';
  };

  const initials = (profile.name || profile.store_name || 'M').slice(0, 2).toUpperCase();

  const revenueTotal = products.reduce((s, p) => s + Number(p.price) * (Number(p.sales) || 0), 0);
  const salesTotal = products.reduce((s, p) => s + (Number(p.sales) || 0), 0);
  const ratingValue = Number(profile.rating) || 0;

  const handleTab = (t) => {
    setSearchParams({ tab: t });
  };

  const renderProducts = () => {
    const activeCount = products.filter((p) => p.status === 'active').length;
    const revenue = products.reduce((sum, p) => sum + Number(p.price) * (Number(p.sales) || 0), 0);
    const totalSales = products.reduce((sum, p) => sum + (Number(p.sales) || 0), 0);

    return (
      <div className="prod-wrap">
        <div className="prod-stats">
          <div className="prod-stat">
            <b>{products.length}</b>
            <span>{dir === 'rtl' ? 'إجمالي المنتجات' : 'Total products'}</span>
          </div>
          <div className="prod-stat">
            <b>{activeCount}</b>
            <span>{dir === 'rtl' ? 'منشور الآن' : 'Currently live'}</span>
          </div>
          <div className="prod-stat">
            <b>${revenue.toLocaleString('en-US')}</b>
            <span>{dir === 'rtl' ? `الإيراد (${totalSales} مبيعة)` : `Revenue (${totalSales} sales)`}</span>
          </div>
        </div>

        <div className="d-card" style={{ borderRadius: 20 }}>
          <div className="d-card__header">
            <h3 className="d-card__title">{t('dashboard.products')}</h3>
            <button className="btn btn--primary" disabled={isPending} onClick={() => openPrdForm(null)}>
              {dir === 'rtl' ? '+ إضافة منتج' : '+ Add Product'}
            </button>
          </div>

          {productsLoading ? (
            <p className="prod-empty">{dir === 'rtl' ? 'جارٍ تحميل منتجاتك…' : 'Loading your products…'}</p>
          ) : products.length === 0 ? (
            <p className="prod-empty">
              {dir === 'rtl'
                ? 'ما زال متجرك بلا منتجات. أضف أول منتج وابدأ العرض على "مَورد".'
                : 'No products yet. Add your first product to start selling on Mawrid.'}
            </p>
          ) : (
            <div className="prod-grid" style={{ marginTop: 18 }}>
              {products.map((p) => (
                <article className="prod-card" key={p.id}>
                  <div className="prod-thumb" style={p.image ? undefined : { background: `linear-gradient(135deg, ${p.color}, ${p.color}99)` }}>
                    {p.image ? <img src={p.image} alt={p.name} /> : <span>{p.initials}</span>}
                  </div>
                  <div className="prod-body">
                    <h4>{p.name}</h4>
                    {p.desc && <p className="prod-desc">{p.desc}</p>}
                    <div className="prod-meta">
                      <span className="prod-price">${Number(p.price).toLocaleString('en-US')}</span>
                      <span className={`d-badge d-badge--${p.status}`}>{productStatusLabel(p.status)}</span>
                    </div>
                    <div className="prod-actions">
                      <button onClick={() => openPrdForm(p)} disabled={isPending}>
                        {dir === 'rtl' ? 'تعديل' : 'Edit'}
                      </button>
                      <button className="danger" onClick={() => setConfirmPrd(p)} disabled={isPending}>
                        {dir === 'rtl' ? 'حذف' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {prdFormOpen && prdForm && (
          <div className="d-modal">
            <div className="d-modal__card">
              <div className="d-modal__header">
                <h4>{prdForm.id ? (dir === 'rtl' ? 'تعديل المنتج' : 'Edit Product') : (dir === 'rtl' ? 'منتج جديد' : 'New Product')}</h4>
                <button className="d-modal__close" onClick={() => setPrdFormOpen(false)}>✕</button>
              </div>
              <form onSubmit={submitPrdForm}>
                <div className="d-form__group" style={{ marginBottom: 16 }}>
                  <label>{dir === 'rtl' ? 'صورة المنتج' : 'Product image'}</label>
                  <ImageField value={prdForm.image} onChange={(v) => setPrdForm((f) => ({ ...f, image: v }))} />
                </div>
                <div className="d-form__group" style={{ marginBottom: 16 }}>
                  <label>{dir === 'rtl' ? 'اسم المنتج *' : 'Product name *'}</label>
                  <input
                    type="text"
                    className="d-form__input"
                    value={prdForm.name}
                    onChange={(e) => setPrdForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    placeholder={dir === 'rtl' ? 'مثال: هوية بصرية متكاملة' : 'e.g. Complete brand identity'}
                  />
                </div>
                <div className="d-form__group" style={{ marginBottom: 16 }}>
                  <label>{dir === 'rtl' ? 'الوصف المختصر' : 'Short description'}</label>
                  <textarea
                    className="d-form__input d-form__textarea"
                    rows={3}
                    value={prdForm.desc}
                    onChange={(e) => setPrdForm((f) => ({ ...f, desc: e.target.value }))}
                    placeholder={dir === 'rtl' ? 'اشرح للعميل ما سيتسلمه بالضبط' : 'Tell buyers exactly what they will receive'}
                  />
                </div>
                <div className="d-form__row" style={{ marginBottom: 16 }}>
                  <div className="d-form__group">
                    <label>{dir === 'rtl' ? 'السعر ($) *' : 'Price ($) *'}</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="d-form__input"
                      value={prdForm.price}
                      onChange={(e) => setPrdForm((f) => ({ ...f, price: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="d-form__group">
                    <label>{dir === 'rtl' ? 'الحالة' : 'Status'}</label>
                    <select
                      className="d-form__input"
                      value={prdForm.status}
                      onChange={(e) => setPrdForm((f) => ({ ...f, status: e.target.value }))}
                    >
                      <option value="active">{dir === 'rtl' ? 'منشور' : 'Active'}</option>
                      <option value="draft">{dir === 'rtl' ? 'مسودة' : 'Draft'}</option>
                      <option value="inactive">{dir === 'rtl' ? 'مخفف' : 'Inactive'}</option>
                    </select>
                  </div>
                </div>
                <div className="d-form__group" style={{ marginBottom: 16 }}>
                  <label>{dir === 'rtl' ? 'التصنيف' : 'Category'}</label>
                  <select
                    className="d-form__input"
                    value={prdForm.category_id}
                    onChange={(e) => setPrdForm((f) => ({ ...f, category_id: e.target.value }))}
                  >
                    <option value="">{dir === 'rtl' ? 'بدون تصنيف' : 'No category'}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name || c.name_en || c.slug}</option>
                    ))}
                  </select>
                </div>
                {prdErr && (
                  <p style={{ margin: '0 0 12px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-error)' }}>{prdErr}</p>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--color-outline-variant)', paddingTop: 16 }}>
                  <button type="button" className="d-actions__btn" onClick={() => setPrdFormOpen(false)} disabled={prdBusy}>
                    {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="submit" className="btn btn--primary" disabled={prdBusy}>
                    {prdBusy
                      ? (dir === 'rtl' ? 'جارٍ الحفظ…' : 'Saving…')
                      : prdForm.id ? (dir === 'rtl' ? 'حفظ التعديلات' : 'Save changes') : (dir === 'rtl' ? 'إضافة المنتج' : 'Add product')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => (
    <form className="sel-form" onSubmit={saveProfile}>
      <div className="sel-header">
        <div className="sel-cover" style={profile.cover ? { backgroundImage: `url(${profile.cover})` } : undefined} />
        <div className="sel-header__row">
          <span className="sel-header__avatar">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : initials}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 className="sel-header__title">
              {profile.store_name || profile.name || (dir === 'rtl' ? 'متجرك' : 'Your store')}
              {sellerStatus === 'verified' && <VerifiedBadge size={17} title={dir === 'rtl' ? 'بائع موثّق' : 'Verified seller'} />}
            </h3>
            <p className="sel-header__meta">
              {specialtyLabel(profile.specialty)} · {availabilityLabel(profile.availability)}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {savedMsg && <span className="sel-saved">✓ {savedMsg}</span>}
            <button type="submit" className="btn btn--primary" disabled={saving || isPending}>
              {saving ? (dir === 'rtl' ? 'جارٍ الحفظ…' : 'Saving…') : (dir === 'rtl' ? 'حفظ التغييرات' : 'Save Changes')}
            </button>
          </div>
        </div>
      </div>
      {saveErr && (
        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-error)' }}>{saveErr}</p>
      )}

      <div className="sel-grid">
        <div className="sel-col">
          <div className="sel-media">
            <h4>{dir === 'rtl' ? 'الصورة الشخصية' : 'Profile photo'}</h4>
            <ImageField crop={AVATAR_CROP} value={profile.avatar_url} onChange={(v) => setField('avatar_url', v)} />
            <p className="sel-note">{dir === 'rtl' ? 'تُعرض بشكل دائري في ملفك — قصّها وضبّط التقريب قبل الرفع.' : 'Shown as a circle on your profile — crop and zoom before uploading.'}</p>
          </div>
          <div className="sel-media">
            <h4>{dir === 'rtl' ? 'صورة الغلاف' : 'Cover image'}</h4>
            <ImageField crop={COVER_CROP} value={profile.cover} onChange={(v) => setField('cover', v)} />
            <p className="sel-note">{dir === 'rtl' ? 'تظهر كبانر في أعلى المتجر — الابعاد المثالية 1920×635.' : 'Shown as a banner atop your store. Ideal size 1920×635.'}</p>
          </div>
        </div>

        <div className="sel-col">
          <div className="sel-fields">
            <h4>{dir === 'rtl' ? 'معلومات المتجر' : 'Store details'}</h4>
            <div className="d-form__row">
              <div className="d-form__group">
                <label>{t('auth.storeName')}</label>
                <input type="text" className="d-form__input" value={profile.store_name} onChange={(e) => setField('store_name', e.target.value)} placeholder={dir === 'rtl' ? 'اسم متجرك' : 'Your store name'} />
              </div>
              <div className="d-form__group">
                <label>{dir === 'rtl' ? 'الاسم الكامل' : 'Full name'}</label>
                <input type="text" className="d-form__input" value={profile.name} onChange={(e) => setField('name', e.target.value)} />
              </div>
            </div>
            <div className="d-form__row">
              <div className="d-form__group">
                <label>{t('auth.email')}</label>
                <input type="email" className="d-form__input" value={profile.email} onChange={(e) => setField('email', e.target.value)} />
              </div>
              <div className="d-form__group">
                <label>{t('auth.phone')}</label>
                <input type="tel" className="d-form__input" value={profile.phone} onChange={(e) => setField('phone', e.target.value)} />
              </div>
            </div>
            <div className="d-form__row">
              <div className="d-form__group">
                <label>{dir === 'rtl' ? 'مجال العمل' : 'Field of work'}</label>
                <select className="d-form__input" value={profile.specialty} onChange={(e) => setField('specialty', e.target.value)}>
                  {SELLER_SPECIALTIES.map((s) => (
                    <option key={s.key} value={s.key}>{dir === 'rtl' ? s.name_ar : s.name_en}</option>
                  ))}
                </select>
              </div>
              <div className="d-form__group">
                <label>{dir === 'rtl' ? 'رابط صفحتك / موقعك' : 'Website / portfolio link'}</label>
                <input type="url" className="d-form__input" value={profile.website} onChange={(e) => setField('website', e.target.value)} placeholder="https://…" dir="ltr" />
              </div>
            </div>
          </div>

          <div className="sel-fields">
            <h4>{dir === 'rtl' ? 'نبذة عنك' : 'About you'}</h4>
            <div className="d-form__group">
              <label>{dir === 'rtl' ? 'النبذة (عربي)' : 'Bio (Arabic)'}</label>
              <textarea className="d-form__input d-form__textarea" rows={3} value={profile.bio} onChange={(e) => setField('bio', e.target.value)} placeholder={dir === 'rtl' ? 'أخبر العملاء عن خبرتك وأعمالك…' : 'Tell buyers about your experience…'} />
            </div>
            <div className="d-form__group" style={{ marginBottom: 0 }}>
              <label>{dir === 'rtl' ? 'النبذة (إنجليزي)' : 'Bio (English)'}</label>
              <textarea className="d-form__input d-form__textarea" rows={3} value={profile.bio_en} onChange={(e) => setField('bio_en', e.target.value)} placeholder="About you in English…" dir="ltr" />
            </div>
          </div>

          <div className="sel-fields">
            <h4>{dir === 'rtl' ? 'التوفر وساعات العمل' : 'Availability & working hours'}</h4>
            <div className="d-form__row">
              <div className="d-form__group">
                <label>{dir === 'rtl' ? 'التوفر' : 'Availability'}</label>
                <select className="d-form__input" value={profile.availability} onChange={(e) => setField('availability', e.target.value)}>
                  {AVAILABILITY.map((a) => (
                    <option key={a.key} value={a.key}>{dir === 'rtl' ? a.ar : a.en}</option>
                  ))}
                </select>
              </div>
              <div className="d-form__group">
                <label>{dir === 'rtl' ? 'المنطقة الزمنية' : 'Time zone'}</label>
                <select className="d-form__input" value={profile.hours_zone} onChange={(e) => setField('hours_zone', e.target.value)} dir="ltr">
                  {HOURS_ZONES.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="d-form__row">
              <div className="d-form__group">
                <label>{dir === 'rtl' ? 'ساعة البداية' : 'Start time'}</label>
                <input type="time" className="d-form__input" value={profile.hours_from} onChange={(e) => setField('hours_from', e.target.value)} dir="ltr" />
              </div>
              <div className="d-form__group">
                <label>{dir === 'rtl' ? 'ساعة النهاية' : 'End time'}</label>
                <input type="time" className="d-form__input" value={profile.hours_to} onChange={(e) => setField('hours_to', e.target.value)} dir="ltr" />
              </div>
            </div>
            <p className="sel-note">
              {dir === 'rtl'
                ? 'هذه المعلومات تظهر في متجرك العام على مَورد وتسهّل على العملاء التواصل معك.'
                : 'This information is shown on your public store page and helps buyers reach you.'}
            </p>
          </div>
        </div>
      </div>
    </form>
  );

  const renderContent = () => {
    switch (tab) {
      case 'products':
        return renderProducts();

      case 'orders':
        return (
          <div className="d-card" style={{ borderRadius: 20 }}>
            <h3 className="d-card__title">{t('dashboard.orders')}</h3>
            <p className="d-empty" style={{ padding: '48px 0', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-secondary)' }}>
              {dir === 'rtl'
                ? 'لا توجد طلبات بعد. ستظهر طلبات عملائك هنا بمجرد أول عملية شراء.'
                : 'No orders yet. Your customers’ orders will appear here after the first purchase.'}
            </p>
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
              <span className="d-balance__amount" style={{ fontSize: '2.5rem' }}>$<AnimatedCounter end={revenueTotal} />.00</span>
            </div>
            <p className="d-empty" style={{ padding: '36px 0', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-secondary)' }}>
              {dir === 'rtl'
                ? 'لا توجد مدفوعات أو أرصدة بعد. يظهر رصيدك بعد تأكيد الطلبات.'
                : 'No payouts yet. Your balance appears after orders are confirmed.'}
            </p>
          </div>
        );

      case 'settings':
        return renderSettings();

      default:
        return (
          <>
            <div className="sell-hero">
              <div className="sell-line" aria-hidden="true" />
              <div className="sell-welcome">
                <div className="sell-welcome__text">
                  <h2 className="sell-welcome__title">{t('dashboard.welcome')}</h2>
                  <p className="sell-welcome__sub">{dir === 'rtl' ? 'إدارة متجرك ومنتجاتك بكل سهولة' : 'Manage your store and products with ease'}</p>
                </div>
                <div className="sell-welcome__actions">
                  <button className="btn btn--primary" onClick={() => handleTab('products')}>{t('dashboard.manageStore')}</button>
                  <button className="d-actions__btn" onClick={() => handleTab('settings')}>
                    {dir === 'rtl' ? 'إعدادات المتجر' : 'Store settings'}
                  </button>
                </div>
              </div>
            </div>

            <div className="d-stats">
              <div className="d-stat">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,98,1,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--color-primary)' }}>$</div>
                <span className="d-stat__value" style={{ fontSize: '1.75rem' }}>$<AnimatedCounter end={revenueTotal} /></span>
                <span className="d-stat__label">{t('dashboard.totalRevenue')}</span>
              </div>
              <div className="d-stat">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(73,75,214,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#494bd6' }}>S</div>
                <span className="d-stat__value" style={{ fontSize: '1.75rem', color: '#494bd6' }}><AnimatedCounter end={salesTotal} /></span>
                <span className="d-stat__label">{t('dashboard.totalSales')}</span>
              </div>
              <div className="d-stat">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#10b981' }}>P</div>
                <span className="d-stat__value" style={{ fontSize: '1.75rem' }}>{products.length}</span>
                <span className="d-stat__label">{t('dashboard.products')}</span>
              </div>
              <div className="d-stat">
                <div style={{ position: 'absolute', right: -16, top: -16, opacity: 0.05, fontSize: 100, color: 'var(--color-primary)' }}>★</div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,98,1,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--color-primary)' }}>★</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                  <span className="d-stat__value" style={{ fontSize: '1.75rem', color: 'var(--color-primary-container)' }}>{ratingValue ? ratingValue.toFixed(1) : '—'}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-secondary)', marginBottom: 6 }}>/ 5.0</span>
                </div>
                <span className="d-stat__label">{dir === 'rtl' ? 'تقييم المتجر' : 'Store Rating'}</span>
              </div>
            </div>

            <div className="d-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <div className="d-card" style={{ borderRadius: 20, marginBottom: 0 }}>
                <div className="d-card__header">
                  <h3 className="d-card__title" style={{ marginBottom: 0 }}>{t('dashboard.topProducts')}</h3>
                  <button onClick={() => handleTab('products')} style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>{t('dashboard.viewAll')}</button>
                </div>
                {products.length === 0 ? (
                  <p className="prod-empty" style={{ marginTop: 8 }}>
                    {dir === 'rtl' ? 'لا منتجات بعد — أضف منتجك الأول ليظهر هنا.' : 'No products yet — add your first product to see it here.'}
                  </p>
                ) : (
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
                        {products.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={avatarStyle(p.color || '#ff6201', p.initials, 34)}>{p.initials}</div>
                                <strong style={{ fontSize: 13 }}>{p.name}</strong>
                              </div>
                            </td>
                            <td>{p.sales || 0}</td>
                            <td style={{ fontWeight: 700, color: 'var(--color-primary-container)' }}>${(Number(p.price) * (Number(p.sales) || 0)).toLocaleString('en-US')}</td>
                            <td><span className={`d-badge d-badge--${p.status}`}>{productStatusLabel(p.status)}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="d-card" style={{ borderRadius: 20, marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                <h3 className="d-card__title">{dir === 'rtl' ? 'إجراءات مقترحة' : 'Suggested actions'}</h3>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {isPending && (
                    <div style={{ display: 'flex', gap: 14, padding: 16, borderRadius: 14, background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)' }}>
                      <div style={{ display: 'inline-flex', color: 'var(--color-secondary)', marginTop: 1 }}><DashIcon name="warn" size={20} /></div>
                      <div>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-on-surface)', margin: 0 }}>
                          {dir === 'rtl' ? 'أكمل بيانات متجرك' : 'Complete your store profile'}
                        </h4>
                        <p style={{ fontSize: 12, color: 'var(--color-secondary)', margin: '4px 0 0' }}>
                          {dir === 'rtl' ? 'أضف صورة الغلاف والنبذة لتظهر بأفضل شكل بعد التوثيق.' : 'Add a cover and bio to look your best once verified.'}
                        </p>
                        <button onClick={() => handleTab('settings')} style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', background: 'none', border: 'none', padding: 0, marginTop: 8, cursor: 'pointer' }}>
                          {dir === 'rtl' ? 'فتح الإعدادات' : 'Open settings'}
                        </button>
                      </div>
                    </div>
                  )}
                  {!productsLoading && products.length === 0 && (
                    <div style={{ display: 'flex', gap: 14, padding: 16, borderRadius: 14, background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)' }}>
                      <div style={{ display: 'inline-flex', color: 'var(--color-secondary)', marginTop: 1 }}><DashIcon name="message" size={20} /></div>
                      <div>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-on-surface)', margin: 0 }}>
                          {dir === 'rtl' ? 'أضف أول منتج' : 'Add your first product'}
                        </h4>
                        <p style={{ fontSize: 12, color: 'var(--color-secondary)', margin: '4px 0 0' }}>
                          {dir === 'rtl' ? 'المتجر بلا منتجات — أضف منتجاً ليظهر للعملاء.' : 'Your store is empty — add a product to appear to buyers.'}
                        </p>
                        <button onClick={() => handleTab('products')} style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', background: 'none', border: 'none', padding: 0, marginTop: 8, cursor: 'pointer' }}>
                          {dir === 'rtl' ? 'إضافة منتج' : 'Add product'}
                        </button>
                      </div>
                    </div>
                  )}
                  {!isPending && (productsLoading || products.length > 0) && (
                    <p style={{ fontSize: 12, color: 'var(--color-secondary)', margin: 0 }}>
                      {dir === 'rtl' ? 'لا توجد إجراءات مطلوبة حالياً.' : 'Nothing needs your attention right now.'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="d-card" style={{ borderRadius: 20 }}>
              <div className="d-card__header">
                <h3 className="d-card__title" style={{ marginBottom: 0 }}>{t('dashboard.recentOrders')}</h3>
                <button onClick={() => handleTab('orders')} style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>{t('dashboard.viewAll')}</button>
              </div>
              <p className="d-empty" style={{ padding: '36px 0', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-secondary)' }}>
                {dir === 'rtl' ? 'لا توجد طلبات بعد. ستظهر طلبات عملائك هنا.' : 'No orders yet. Your customers’ orders will appear here.'}
              </p>
            </div>
          </>
        );
    }
  };

  const pendingBanner = isPending ? (
    <div className="d-card" style={{ marginBottom: 20, border: '1px solid #FCD34D', background: 'linear-gradient(135deg,#fffbeb,#ffffff)', borderRadius: 20 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.14)', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <DashIcon name="warn" size={22} />
        </div>
        <div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>
            {dir === 'rtl' ? 'حسابك قيد المراجعة' : 'Your account is pending review'}
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-secondary)' }}>
            {dir === 'rtl'
              ? 'تم استلام طلب انتسابك كمورّد. يمكنك تصفّح الأقسام والطلب كالمعتاد، لكن تعديل المتجر والمنتجات يُفتح بعد توثيق حسابك من الإدارة.'
              : 'Your supplier application was received. You can browse and order as usual, but store & product editing unlocks once an admin verifies your account.'}
          </p>
        </div>
      </div>
    </div>
  ) : null;

  const syncBanner = user?.supabaseStatus === 'syncing' ? (
    <div className="d-card" style={{ marginBottom: 20, border: '1px solid #93C5FD', background: 'linear-gradient(135deg,#eff6ff,#ffffff)', borderRadius: 20 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.14)', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <DashIcon name="warn" size={22} />
        </div>
        <div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>
            {dir === 'rtl' ? 'جارٍ مزامنة طلب انتسابك مع الإدارة' : 'Syncing your supplier application with the admin'}
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-secondary)' }}>
            {dir === 'rtl'
              ? 'تم إنشاء حسابك بنجاح وتعمل المزامنة الآن تلقائياً. إذا لم تصل للإدارة خلال دقيقة، افتح الإعدادات واحفظ بياناتك مجدداً.'
              : 'Your account was created and we are syncing it automatically. If it does not reach the admin within a minute, open Settings and re-save your data.'}
          </p>
        </div>
      </div>
    </div>
  ) : null;

  const topBanner = pendingBanner || syncBanner;

  if (profileLoading) {
    return <div className="d-content">{topBanner}<p className="d-empty" style={{ padding: '60px 0', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-secondary)' }}>{dir === 'rtl' ? 'جارٍ التحميل…' : 'Loading…'}</p>
      <VerificationCelebration open={celebrate} storeName={profile.store_name || profile.name} dir={dir} onClose={dismissCelebration} />
    </div>;
  }

  return (
    <div className="d-content">
      {topBanner}
      {renderContent()}
      <VerificationCelebration open={celebrate} storeName={profile.store_name || profile.name} dir={dir} onClose={dismissCelebration} />
      <ConfirmDialog
        open={!!confirmPrd}
        title={dir === 'rtl' ? 'حذف المنتج نهائياً؟' : 'Delete this product?'}
        message={confirmPrd ? (dir === 'rtl' ? `سيتم حذف "${confirmPrd.name}" نهائياً ولا يمكن التراجع.` : `"${confirmPrd.name}" will be permanently deleted. This cannot be undone.`) : ''}
        confirmLabel={dir === 'rtl' ? 'حذف' : 'Delete'}
        tone="danger"
        busy={confirmBusy}
        onConfirm={() => removePrd(confirmPrd?.id)}
        onCancel={() => setConfirmPrd(null)}
      />
    </div>
  );
}