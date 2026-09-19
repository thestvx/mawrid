import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import DashIcon from '../../components/dashboard/DashIcon';
import { ImageField } from '../../components/dashboard/MediaUploader';
import { supabase, isSupabaseConfigured, hasSellerColumns, hasUserColumn } from '../../lib/supabase';
import { SELLER_SPECIALTIES } from '../../data/sellers';
import './Dashboard.css';

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

const SEED_PRODUCTS = [
  { id: 1, name: 'Nitec Pro UI Kit', desc: 'Premium ready components kit for product teams', price: 129, status: 'active', color: '#ff6201', initials: 'NP', image: '' },
  { id: 2, name: 'Dashboard Template Pro', desc: 'Complete admin dashboard with 40+ blocks', price: 49, status: 'active', color: '#494bd6', initials: 'DT', image: '' },
  { id: 3, name: 'Abstract 3D Shape Pack', desc: '200 high-res abstract 3D renders', price: 29, status: 'active', color: '#10b981', initials: '3D', image: '' },
];

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

export default function SellerDashboard() {
  const { t, dir } = useLanguage();
  const { user, role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';
  const sellerStatus = user?.seller_status;
  const isPending = role === 'seller' && !!sellerStatus && sellerStatus !== 'verified';

  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [saveErr, setSaveErr] = useState('');
  const [products, setProducts] = useState([]);
  const [prdFormOpen, setPrdFormOpen] = useState(false);
  const [prdForm, setPrdForm] = useState(null);

  const uid = user?.uid;
  const uidRef = useRef(uid);
  useEffect(() => {
    uidRef.current = uid;
    if (uid) {
      try {
        const raw = localStorage.getItem('mawrid_seller_profile_' + uid);
        if (raw) setProfile((p) => ({ ...p, ...JSON.parse(raw) }));
      } catch {}
      try {
        const raw = localStorage.getItem('mawrid_seller_products_' + uid);
        setProducts(raw ? JSON.parse(raw) : SEED_PRODUCTS);
      } catch {
        setProducts(SEED_PRODUCTS);
      }
    } else {
      setProducts(SEED_PRODUCTS);
    }
  }, [uid]);

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

  const persistProducts = (list) => {
    setProducts(list);
    if (uidRef.current) {
      try {
        localStorage.setItem('mawrid_seller_products_' + uidRef.current, JSON.stringify(list));
      } catch {}
    }
  };

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
    setPrdForm(p || { id: null, name: '', desc: '', price: '', status: 'active', image: '', initials: 'NW', color: '#ff6201' });
    setPrdFormOpen(true);
  };

  const submitPrdForm = (e) => {
    e.preventDefault();
    if (!prdForm?.name?.trim() || prdForm.price === '' || prdForm.price == null) return;
    const entry = {
      ...prdForm,
      id: prdForm.id || Date.now(),
      name: prdForm.name.trim(),
      desc: (prdForm.desc || '').trim(),
      price: Math.max(0, Number(prdForm.price) || 0),
      initials: (prdForm.name || '').slice(0, 2).toUpperCase(),
    };
    if (prdForm.id) {
      persistProducts(products.map((p) => (p.id === prdForm.id ? entry : p)));
    } else {
      persistProducts([entry, ...products]);
    }
    setPrdFormOpen(false);
  };

  const removePrd = (id) => {
    if (isPending) return;
    const ok = window.confirm(dir === 'rtl' ? 'حذف هذا المنتج نهائياً؟' : 'Delete this product permanently?');
    if (ok) persistProducts(products.filter((p) => p.id !== id));
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

  const handleTab = (t) => {
    setSearchParams({ tab: t });
  };

  const renderProducts = () => {
    const activeCount = products.filter((p) => p.status === 'active').length;
    const estRevenue = products
      .filter((p) => p.status === 'active')
      .reduce((sum, p) => sum + Number(p.price) * 40, 0);

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
            <b>${estRevenue.toLocaleString('en-US')}</b>
            <span>{dir === 'rtl' ? 'متوسط إيراد متوقع/شهر' : 'Est. monthly revenue'}</span>
          </div>
        </div>

        <div className="d-card" style={{ borderRadius: 20 }}>
          <div className="d-card__header">
            <h3 className="d-card__title">{t('dashboard.products')}</h3>
            <button className="btn btn--primary" disabled={isPending} onClick={() => openPrdForm(null)}>
              {dir === 'rtl' ? '+ إضافة منتج' : '+ Add Product'}
            </button>
          </div>

          {products.length === 0 ? (
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
                      <button className="danger" onClick={() => removePrd(p.id)} disabled={isPending}>
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
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--color-outline-variant)', paddingTop: 16 }}>
                  <button type="button" className="d-actions__btn" onClick={() => setPrdFormOpen(false)}>
                    {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button type="submit" className="btn btn--primary">
                    {prdForm.id ? (dir === 'rtl' ? 'حفظ التعديلات' : 'Save changes') : (dir === 'rtl' ? 'إضافة المنتج' : 'Add product')}
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
            <h3 className="sel-header__title">{profile.store_name || profile.name || (dir === 'rtl' ? 'متجرك' : 'Your store')}</h3>
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
                      <td>${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td><span className="d-badge d-badge--completed">{dir === 'rtl' ? 'مكتمل' : 'Completed'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'settings':
        return renderSettings();

      default:
        return (
          <>
            <div className="sell-line" aria-hidden="true" />
            <div className="d-welcome">
              <h2 className="d-welcome__title">{t('dashboard.welcome')}</h2>
              <p className="d-welcome__sub">{dir === 'rtl' ? 'إدارة متجرك ومنتجاتك بكل سهولة' : 'Manage your store and products with ease'}</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btn--primary" onClick={() => handleTab('products')}>{t('dashboard.manageStore')}</button>
                <button className="d-actions__btn" onClick={() => handleTab('settings')}>
                  {dir === 'rtl' ? 'إعدادات المتجر' : 'Store settings'}
                </button>
              </div>
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

            <div className="d-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              <div className="d-card" style={{ borderRadius: 20, marginBottom: 0 }}>
                <div className="d-card__header">
                  <h3 className="d-card__title" style={{ marginBottom: 0 }}>{t('dashboard.topProducts')}</h3>
                  <button onClick={() => handleTab('products')} style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>{t('dashboard.viewAll')}</button>
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
                      {products.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={avatarStyle(p.color || '#ff6201', p.initials, 34)}>{p.initials}</div>
                              <strong style={{ fontSize: 13 }}>{p.name}</strong>
                            </div>
                          </td>
                          <td>{Number(p.price) * 3}</td>
                          <td style={{ fontWeight: 700, color: 'var(--color-primary-container)' }}>${(Number(p.price) * 120).toLocaleString('en-US')}</td>
                          <td><span className={`d-badge d-badge--${p.status}`}>{productStatusLabel(p.status)}</span></td>
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
                      <div style={{ display: 'inline-flex', color: a.type === 'warning' ? 'var(--color-error)' : 'var(--color-secondary)', marginTop: 1 }}>
                        {a.type === 'warning' ? <DashIcon name="warn" size={20} /> : <DashIcon name="message" size={20} />}
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
                <button onClick={() => handleTab('orders')} style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>{t('dashboard.viewAll')}</button>
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
    return <div className="d-content">{topBanner}<p className="d-empty" style={{ padding: '60px 0', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-secondary)' }}>{dir === 'rtl' ? 'جارٍ التحميل…' : 'Loading…'}</p></div>;
  }

  return <div className="d-content">{topBanner}{renderContent()}</div>;
}