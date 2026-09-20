import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { ImageField } from '../dashboard/MediaUploader';
import StoreRenderer from './StoreRenderer';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  hasStorefrontTable,
  getStorefrontBySeller,
  defaultStorefront,
  saveStorefront,
  slugify,
  defaultSlug,
  isSlugAvailable,
  PALETTES,
  FONT_PRESETS,
  DEFAULT_THEME,
  getPalette,
  extractPalette,
} from '../../lib/storefront';
import { SECTION_TYPES, SECTION_GROUPS, sectionLabel, makeSection } from './sectionSchema';
import './StoreStudio.css';

const TEMPLATES = [
  { id: 'ember', label_ar: 'جمر', label_en: 'Ember', desc_ar: 'كلاسيكي دافئ بلمسة برتقالية', desc_en: 'Warm classic, orange pop', theme: { palette: 'ember', font: 'modern', radius: 18, density: 'comfy', custom: {} }, sections: ['hero', 'featured', 'categories', 'contact'] },
  { id: 'editorial', label_ar: 'تحريري فاخر', label_en: 'Editorial Luxe', desc_ar: 'مجلة فاخرة بخط سيريف وأناقة', desc_en: 'Luxury magazine serif', theme: { palette: 'sand', font: 'editorial', radius: 8, density: 'comfy', custom: {} }, sections: ['hero', 'lookbook', 'about', 'testimonials', 'contact'] },
  { id: 'noir', label_ar: 'ليلي', label_en: 'Noir', desc_ar: 'داكن وجريء بأسلوب شارعي', desc_en: 'Dark & bold street style', theme: { palette: 'noir', font: 'display', radius: 12, density: 'airy', custom: {} }, sections: ['hero', 'marquee', 'featured', 'lookbook', 'cta', 'contact'] },
  { id: 'boutique', label_ar: 'بوتيك', label_en: 'Boutique', desc_ar: 'وردي أنيق لمتاجر الأزياء', desc_en: 'Graceful pink boutique', theme: { palette: 'rose', font: 'editorial', radius: 24, density: 'airy', custom: {} }, sections: ['hero', 'featured', 'about', 'testimonials', 'contact'] },
  { id: 'minimal', label_ar: 'مينيمال', label_en: 'Minimal', desc_ar: 'نظيف وبلا تشتيت', desc_en: 'Clean, distraction-free', theme: { palette: 'ink', font: 'modern', radius: 10, density: 'compact', custom: {} }, sections: ['hero', 'featured', 'contact'] },
  { id: 'organic', label_ar: 'طبيعي', label_en: 'Organic', desc_ar: 'أخضر هادئ يبني الثقة', desc_en: 'Calm green trust builder', theme: { palette: 'sage', font: 'classic', radius: 20, density: 'comfy', custom: {} }, sections: ['hero', 'featured', 'about', 'faq', 'testimonials', 'contact'] },
];

const SETTINGS_KEYS = ['tagline_ar', 'tagline_en', 'announcementOn', 'announcement_ar', 'announcement_en', 'announcementHref', 'whatsapp', 'email', 'phone', 'address', 'mapUrl', 'hours', 'socials', 'shipping_ar', 'shipping_en', 'return_ar', 'return_en'];

function normalizeLocal(base, seller) {
  if (!base) return null;
  return {
    ...base,
    slug: base.slug || defaultSlug(seller),
    status: base.status === 'published' ? 'published' : 'draft',
    theme: { ...DEFAULT_THEME, ...(base.theme || {}), custom: { ...(base.theme?.custom || {}) } },
    settings: Object.fromEntries(SETTINGS_KEYS.map((k) => [k, k === 'socials' ? (Array.isArray(base.settings?.[k]) ? base.settings[k] : []) : (base.settings?.[k] ?? '')])),
    sections: Array.isArray(base.sections) ? base.sections : [],
    seo: base.seo || {},
  };
}

function Field({ field, value, onChange, dir }) {
  const label = dir === 'rtl' ? field.label_ar : field.label_en;
  if (field.type === 'textarea') {
    return (
      <div className="ss-f ss-f--area">
        <label>{label}</label>
        <textarea rows={3} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  if (field.type === 'select') {
    return (
      <div className="ss-f">
        <label>{label}</label>
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
          {(field.options || []).map((o) => (
            <option key={o.value} value={o.value}>{dir === 'rtl' ? o.label_ar : o.label_en}</option>
          ))}
        </select>
      </div>
    );
  }
  if (field.type === 'number') {
    return (
      <div className="ss-f">
        <label>{label}</label>
        <input
          type="number"
          min={field.min}
          max={field.max}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
      </div>
    );
  }
  if (field.type === 'toggle') {
    return (
      <div className="ss-f ss-f--toggle">
        <span>{label}</span>
        <button type="button" className={`ss-switch${value ? ' is-on' : ''}`} onClick={() => onChange(!value)} aria-pressed={!!value}>
          <i />
        </button>
      </div>
    );
  }
  if (field.type === 'image') {
    return (
      <div className="ss-f">
        <label>{label}</label>
        <ImageField label="" value={String(value ?? '')} onChange={onChange} />
      </div>
    );
  }
  if (field.type === 'list') {
    return (
      <div className="ss-f">
        <label>{label}</label>
        <ListEditor field={field} value={Array.isArray(value) ? value : []} onChange={onChange} dir={dir} />
      </div>
    );
  }
  return (
    <div className="ss-f">
      <label>{label}</label>
      <input
        type="text"
        value={String(value ?? '')}
        placeholder={field.placeholder || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ListEditor({ field, value, onChange, dir }) {
  const add = () => onChange([...value, field.blank ? field.blank() : {}]);
  const setItem = (i, k, v) => {
    const next = value.map((it, j) => (j === i ? { ...it, [k]: v } : it));
    onChange(next);
  };
  const remove = (i) => onChange(value.filter((_, j) => j !== i));
  return (
    <div className="ss-list">
      {value.length === 0 && <p className="ss-list__empty">{dir === 'rtl' ? 'لا عناصر بعد' : 'No items yet'}</p>}
      {value.map((item, i) => (
        <div className="ss-list__item" key={i}>
          <div className="ss-list__head">
            <span>
              {field.titleKey && item[field.titleKey]
                ? String(item[field.titleKey]).slice(0, 28)
                : `${dir === 'rtl' ? 'عنصر' : 'Item'} ${i + 1}`}
            </span>
            <button type="button" className="ss-list__del" onClick={() => remove(i)} aria-label={dir === 'rtl' ? 'حذف' : 'Remove'}>✕</button>
          </div>
          <div className="ss-list__body">
            {(field.itemFields || []).map((sub, j) => (
              <Field key={j} field={sub} value={item[sub.k]} onChange={(v) => setItem(i, sub.k, v)} dir={dir} />
            ))}
          </div>
        </div>
      ))}
      <button type="button" className="ss-list__add" onClick={add}>+ {dir === 'rtl' ? 'إضافة' : 'Add'}</button>
    </div>
  );
}

function ColorRow({ label, value, onChange }) {
  return (
    <div className="ss-color">
      <span>{label}</span>
      <div>
        <span className="ss-color__hex">{String(value || '#000000').toUpperCase()}</span>
        <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export default function StoreStudio({ uid, seller, user, products = [], categories = [], dir, isPending }) {
  const { dir: langDir } = useLanguage();
  const rtl = (dir == null ? langDir : dir) === 'rtl';
  const L = (ar, en) => (rtl ? ar : en);

  const KEY = uid ? `mawrid_storefront_${uid}` : null;

  const sellerLike = useMemo(() => ({
    id: uid || seller?.id || '',
    firebase_uid: uid || seller?.firebase_uid || '',
    store_name: seller?.store_name || seller?.storeName || user?.store_name || '',
    full_name: seller?.name || seller?.full_name || user?.name || '',
    specialty: seller?.specialty || user?.specialty || '',
    bio: seller?.bio || '',
    bio_ar: seller?.bio_ar || seller?.bio || '',
    cover: seller?.cover || seller?.cover_url || user?.cover || '',
    cover_url: seller?.cover || seller?.cover_url || user?.cover || '',
    avatar_url: seller?.avatar_url || user?.avatar_url || '',
    email: seller?.email || user?.email || '',
    phone: seller?.phone || user?.phone || '',
    whatsapp: seller?.whatsapp || user?.whatsapp || '',
  }), [uid, seller, user]);

  const previewProducts = useMemo(() => products.map((p) => ({
    ...p,
    thumbnail: p.image || p.thumbnail || '',
    images: p.image ? [p.image] : (Array.isArray(p.images) ? p.images : []),
  })), [products]);

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('sections');
  const [expandedId, setExpandedId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [slugState, setSlugState] = useState('idle');
  const [mode, setMode] = useState('edit');

  const patchTheme = (patch) => setStore((s) => ({ ...s, theme: { ...s.theme, ...patch } }));
  const patchCustom = (patch) => setStore((s) => ({ ...s, theme: { ...s.theme, custom: { ...(s.theme?.custom || {}), ...patch } } }));
  const patchSettings = (patch) => setStore((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  const patchSeo = (patch) => setStore((s) => ({ ...s, seo: { ...(s.seo || {}), ...patch } }));

  const patchSection = (id, patch) => setStore((s) => ({
    ...s,
    sections: s.sections.map((sec) => (sec.id === id ? { ...sec, props: { ...(sec.props || {}), ...patch } } : sec)),
  }));

  const toggleSection = (id) => setStore((s) => ({
    ...s,
    sections: s.sections.map((sec) => (sec.id === id ? { ...sec, visible: sec.visible !== false ? false : true } : sec)),
  }));

  const removeSection = (id) => setStore((s) => ({
    ...s,
    sections: s.sections.filter((sec) => sec.id !== id),
  }));

  const moveSection = (id, dirn) => setStore((s) => {
    const idx = s.sections.findIndex((sec) => sec.id === id);
    const to = idx + dirn;
    if (idx < 0 || to < 0 || to >= s.sections.length) return s;
    const arr = [...s.sections];
    const [item] = arr.splice(idx, 1);
    arr.splice(to, 0, item);
    return { ...s, sections: arr };
  });

  const addSection = (type) => {
    const sec = makeSection(type, rtl ? 'rtl' : 'ltr');
    if (!sec) return;
    setStore((s) => ({ ...s, sections: [...s.sections, sec] }));
    setExpandedId(sec.id);
    setAddOpen(false);
  };

  const applyTemplate = (tpl) => {
    setStore((s) => {
      const existing = new Map(s.sections.map((sec) => [sec.type, sec]));
      const sections = tpl.sections.map((type) => {
        const cur = existing.get(type);
        if (cur) return cur;
        const fresh = makeSection(type, rtl ? 'rtl' : 'ltr');
        return fresh || null;
      }).filter(Boolean);
      return { ...s, theme: { ...tpl.theme, custom: {} }, sections };
    });
    setView('sections');
    setExpandedId(null);
  };

  const load = async () => {
    setLoading(true);
    let found = null;
    try {
      const ok = await hasStorefrontTable();
      if (ok && isSupabaseConfigured) found = await getStorefrontBySeller(uid);
    } catch {}
    if (!found && KEY) {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) found = JSON.parse(raw);
      } catch {}
    }
    let next;
    if (found) {
      next = normalizeLocal(found, sellerLike);
    } else {
      next = defaultStorefront(sellerLike, previewProducts);
    }
    setStore(next);
    setLoading(false);
    persist(next, true);
  };

  const persist = async (next, silent = false) => {
    setSaving(true);
    let localOnly = true;
    try {
      const ok = await hasStorefrontTable();
      if (ok && isSupabaseConfigured && next.seller_id) {
        const res = await saveStorefront(next);
        if (res.ok) {
          localOnly = false;
          setStore((cur) => (res.store && res.store.id ? { ...cur, id: res.store.id } : cur));
        } else if (res.code === 'PGRST205' || String(res.error || '').includes('does not exist')) {
          localOnly = true;
        }
      }
    } catch {}
    if (KEY) {
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    }
    setSaving(false);
    if (!silent) setSavedMsg(localOnly ? L('حُفظ محلياً', 'Saved locally') : L('تم الحفظ', 'Saved'));
    if (!silent) setTimeout(() => setSavedMsg(''), 2600);
  };

  const publish = async (targetStatus) => {
    if (!store) return;
    const next = { ...store, status: targetStatus };
    setStore(next);
    await persist(next);
  };

  const checkSlug = async () => {
    const slug = slugify(store?.slug || '');
    if (!slug || !isSupabaseConfigured) { setSlugState('ok'); return; }
    setSlugState('checking');
    const ok = await isSlugAvailable(slug, uid);
    setSlugState(ok ? 'ok' : 'taken');
  };

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  useEffect(() => {
    if (store && view === 'settings' && slugState === 'idle') checkSlug();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, store?.slug]);

  const extractFromCover = async () => {
    const src = sellerLike.cover_url || (store?.sections?.[0]?.props?.image) || '';
    if (!src) return;
    const colors = await extractPalette(src, 4);
    if (!colors.length) return;
    const [primary, accent, bg] = colors;
    patchCustom({ primary, accent, bg: bg || '#ffffff' });
  };

  if (loading) {
    return <div className="d-empty" style={{ padding: '60px 0', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-secondary)' }}>{L('جارٍ تحميل استوديو متجرك…', 'Loading your store studio…')}</div>;
  }

  if (!store) {
    return <div className="d-empty" style={{ padding: '60px 0', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-secondary)' }}>{L('تعذّر تحميل المتجر', 'Could not load store')}</div>;
  }

  const theme = store.theme || DEFAULT_THEME;
  const slug = slugify(store.slug || '');
  const isPublished = store.status === 'published';

  return (
    <div className="ss" dir={rtl ? 'rtl' : 'ltr'}>
      <div className="ss__top">
        <div className="ss__title">
          <h3>{L('استوديو المتجر', 'Store Studio')}</h3>
          <div className={`ss__pill${isPublished ? ' is-live' : ''}`}>
            <i /> {isPublished ? L('منشور', 'Published') : L('مسودة', 'Draft')}
          </div>
          <span className="ss__save-state">{saving ? L('جارٍ الحفظ…', 'Saving…') : savedMsg}</span>
        </div>
        <div className="ss__actions">
          {isPublished && slug && (
            <Link to={`/store/${slug}`} target="_blank" rel="noopener noreferrer" className="ss__btn ss__btn--ghost">
              {L('عرض المتجر', 'View store')} ↗
            </Link>
          )}
          <button type="button" className="ss__btn ss__btn--ghost" onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}>
            {mode === 'edit' ? L('معاينة منفصلة', 'Wide preview') : L('تحرير', 'Edit')}
          </button>
          <button type="button" className="ss__btn" disabled={saving} onClick={() => persist(store)}>
            {L('حفظ', 'Save')}
          </button>
          {isPending ? (
            <button type="button" className="ss__btn ss__btn--primary" disabled title={L('وثّق حسابك أولاً للنشر', 'Verify your account to publish')}>
              {L('في انتظار التوثيق', 'Pending verification')}
            </button>
          ) : isPublished ? (
            <button type="button" className="ss__btn ss__btn--muted" disabled={saving} onClick={() => publish('draft')}>
              {L('إلغاء النشر', 'Unpublish')}
            </button>
          ) : (
            <button type="button" className="ss__btn ss__btn--primary" disabled={saving} onClick={() => publish('published')}>
              {L('نشر المتجر', 'Publish')}
            </button>
          )}
        </div>
      </div>

      <div className={`ss__body${mode === 'preview' ? ' ss__body--preview' : ''}`}>
        <aside className="ss__editor">
          <div className="ss__tabs">
            {[
              ['sections', L('الأقسام', 'Sections')],
              ['design', L('التصميم', 'Design')],
              ['settings', L('الإعدادات', 'Settings')],
            ].map(([k, label]) => (
              <button key={k} type="button" className={view === k ? 'is-active' : ''} onClick={() => setView(k)}>
                {label}
              </button>
            ))}
          </div>

          {view === 'sections' && (
            <div className="ss__pane">
              <div className="ss__hint">
                <strong>✱</strong>
                {L('الجزء العلوي (الشريط العلوي والمسار) والذيل ثابتان من المنصة ولا يمكن تعديلهما. تتحكم أنت بكل ما بينهما.', 'The top bar, breadcrumb and footer are fixed by the platform. You control everything in between.')}
              </div>

              <button type="button" className="ss__add" onClick={() => setAddOpen(!addOpen)}>
                {addOpen ? '−' : '+'} {L('إضافة قسم', 'Add section')}
              </button>

              {addOpen && (
                <div className="ss__addmenu">
                  {SECTION_GROUPS.map((g) => (
                    <div key={g.id} className="ss__addgroup">
                      <h5>{rtl ? g.label_ar : g.label_en}</h5>
                      <div>
                        {Object.entries(SECTION_TYPES)
                          .filter(([, def]) => def.group === g.id)
                          .map(([type, def]) => (
                            <button key={type} type="button" onClick={() => addSection(type)}>
                              <i>{def.icon}</i> {rtl ? def.label_ar : def.label_en}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {store.sections.length === 0 && (
                <p className="ss__empty">{L('ما من أقسام بعد. أضف أول قسم لبدء بناء متجرك.', 'No sections yet. Add your first section to start building.')}</p>
              )}

              <div className="ss__sections">
                {store.sections.map((sec, i) => {
                  const open = expandedId === sec.id;
                  return (
                    <div key={sec.id} className={`ss__section${open ? ' is-open' : ''}${sec.visible === false ? ' is-hidden' : ''}`}>
                      <div className="ss__section-head">
                        <button type="button" className="ss__section-name" onClick={() => { setExpandedId(open ? null : sec.id); setAddOpen(false); }}>
                          <i>{SECTION_TYPES[sec.type]?.icon || '▪'}</i>
                          <span>
                            <b>{sectionLabel(sec.type, rtl ? 'rtl' : 'ltr')}</b>
                            <em>{sec.props?.title_ar || sec.props?.title_en || L('قسم بدون عنوان', 'Untitled section')}</em>
                          </span>
                        </button>
                        <div className="ss__section-actions">
                          <button type="button" className="ss__mini" onClick={() => toggleSection(sec.id)} title={sec.visible === false ? L('إظهار', 'Show') : L('إخفاء', 'Hide')}>
                            {sec.visible === false ? '👁̶' : '👁'}
                          </button>
                          <button type="button" className="ss__mini" disabled={i === 0} onClick={() => moveSection(sec.id, -1)} title={L('أعلى', 'Up')}>↑</button>
                          <button type="button" className="ss__mini" disabled={i === store.sections.length - 1} onClick={() => moveSection(sec.id, 1)} title={L('أسفل', 'Down')}>↓</button>
                          <button type="button" className="ss__mini ss__mini--danger" onClick={() => removeSection(sec.id)} title={L('حذف', 'Delete')}>🗑</button>
                        </div>
                      </div>
                      {open && (
                        <div className="ss__section-body">
                          {(SECTION_TYPES[sec.type]?.fields || []).map((field, j) => (
                            <Field key={j} field={field} value={sec.props?.[field.k]} onChange={(v) => patchSection(sec.id, { [field.k]: v })} dir={rtl ? 'rtl' : 'ltr'} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === 'design' && (
            <div className="ss__pane">
              <div className="ss__block">
                <h4>{L('قوالب جاهزة', 'Ready templates')}</h4>
                <p className="ss__sub">{L('أشكال متاجر مدروسة من منصات التسوّق العالمية — طبّقها ثم عدّل عليها.', 'Curated storefront looks from the world’s top store platforms — apply, then customize.')}</p>
                <div className="ss__templates">
                  {TEMPLATES.map((tpl) => (
                    <button key={tpl.id} type="button" className={theme.palette === tpl.theme.palette && theme.font === tpl.theme.font ? 'is-active' : ''} onClick={() => applyTemplate(tpl)}>
                      <i style={{ background: getPalette(tpl.theme.palette).bg, color: getPalette(tpl.theme.palette).ink }}>
                        <em style={{ background: getPalette(tpl.theme.palette).primary }} />
                      </i>
                      <span><b>{rtl ? tpl.label_ar : tpl.label_en}</b><small>{rtl ? tpl.desc_ar : tpl.desc_en}</small></span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="ss__block">
                <h4>{L('لوحة الألوان', 'Colour palette')}</h4>
                <div className="ss__palettes">
                  {PALETTES.map((p) => (
                    <button key={p.id} type="button" className={theme.palette === p.id ? 'is-active' : ''} onClick={() => patchTheme({ palette: p.id })}>
                      <i style={{ background: `linear-gradient(135deg, ${p.bg} 0%, ${p.surface} 60%)`, color: p.ink }}>
                        <b style={{ background: p.primary }} />
                      </i>
                      {rtl ? p.label_ar : p.label_en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ss__block">
                <h4>{L('الخطوط', 'Fonts')}</h4>
                <div className="ss__fonts">
                  {FONT_PRESETS.map((f) => (
                    <button key={f.id} type="button" className={theme.font === f.id ? 'is-active' : ''} onClick={() => patchTheme({ font: f.id })}>
                      <b style={{ fontFamily: f.head }}>Aa ع</b>
                      <span>{rtl ? f.label_ar : f.label_en}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="ss__block">
                <h4>{L('الألوان المخصصة', 'Custom colours')}</h4>
                <p className="ss__sub">{L('فاتركها فارغة لاستخدام لوحة الألوان، أو خصّصها كما تحب.', 'Leave empty to use the palette, or take full control.')}</p>
                <div className="ss__colors">
                  {[['primary', L('اللون الرئيسي', 'Primary')], ['accent', L('اللون الثانوي', 'Accent')], ['bg', L('الخلفية', 'Background')], ['surface', L('البطاقات', 'Cards')], ['ink', L('النص', 'Text')]].map(([k, label]) => (
                    <ColorRow key={k} label={label} value={theme.custom?.[k] || getPalette(theme.palette)[k]} onChange={(v) => patchCustom({ [k]: v })} />
                  ))}
                </div>
                <div className="ss__block-actions">
                  <button type="button" className="ss__linkbtn" onClick={extractFromCover}>
                    {L('استخرج الألوان من غلافي', 'Extract colours from my cover')}
                  </button>
                  <button type="button" className="ss__linkbtn" onClick={() => patchTheme({ custom: {} })}>
                    {L('إعادة تعيين الألوان', 'Reset colours')}
                  </button>
                </div>
              </div>

              <div className="ss__block">
                <h4>{L('المقاس والكثافة', 'Shape & density')}</h4>
                <div className="ss-f">
                  <label>{L('انحناء الحواف', 'Corner radius')} — {theme.radius}px</label>
                  <input type="range" min={4} max={32} value={theme.radius ?? 18} onChange={(e) => patchTheme({ radius: Number(e.target.value) })} />
                </div>
                <div className="ss-f">
                  <label>{L('كثافة الفقرات', 'Density')}</label>
                  <select value={theme.density || 'comfy'} onChange={(e) => patchTheme({ density: e.target.value })}>
                    <option value="compact">Compact</option>
                    <option value="comfy">Comfy</option>
                    <option value="airy">Airy</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {view === 'settings' && (
            <div className="ss__pane">
              <div className="ss__block">
                <h4>{L('رابط المتجر', 'Store link')}</h4>
                <div className="ss-slug">
                  <span>/store/</span>
                  <input
                    type="text"
                    value={store.slug || ''}
                    dir="ltr"
                    onChange={(e) => { setStore((s) => ({ ...s, slug: slugify(e.target.value) })); }}
                    onBlur={checkSlug}
                  />
                </div>
                <div className="ss-slug-state">
                  {slugState === 'checking' && <span className="is-check">{L('جارٍ التحقق…', 'Checking…')}</span>}
                  {slugState === 'ok' && <span className="is-ok">✓ {L('الرابط متاح', 'Link available')}</span>}
                  {slugState === 'taken' && <span className="is-bad">✕ {L('الرابط مستخدم بالفعل', 'Link already taken')}</span>}
                </div>
              </div>

              <div className="ss__block">
                <h4>{L('عن المتجر', 'Store identity')}</h4>
                <div className="ss-f">
                  <label>{L('الشعار المختصر (عربي)', 'Tagline (AR)')}</label>
                  <input type="text" value={store.settings?.tagline_ar || ''} onChange={(e) => patchSettings({ tagline_ar: e.target.value })} />
                </div>
                <div className="ss-f">
                  <label>{L('الشعار المختصر (إنجليزي)', 'Tagline (EN)')}</label>
                  <input type="text" value={store.settings?.tagline_en || ''} onChange={(e) => patchSettings({ tagline_en: e.target.value })} />
                </div>
                <div className="ss-f ss-f--toggle">
                  <span>{L('إظهار شريط الإعلان العلوي', 'Show announcement bar')}</span>
                  <button type="button" className={`ss-switch${store.settings?.announcementOn ? ' is-on' : ''}`} onClick={() => patchSettings({ announcementOn: !store.settings?.announcementOn })} aria-pressed={!!store.settings?.announcementOn}><i /></button>
                </div>
                {store.settings?.announcementOn && (
                  <>
                    <div className="ss-f"><label>{L('الإعلان (عربي)', 'Announcement (AR)')}</label><input type="text" value={store.settings?.announcement_ar || ''} onChange={(e) => patchSettings({ announcement_ar: e.target.value })} /></div>
                    <div className="ss-f"><label>{L('الإعلان (إنجليزي)', 'Announcement (EN)')}</label><input type="text" value={store.settings?.announcement_en || ''} onChange={(e) => patchSettings({ announcement_en: e.target.value })} /></div>
                    <div className="ss-f"><label>{L('رابط الإعلان', 'Announcement link')}</label><input type="text" dir="ltr" value={store.settings?.announcementHref || ''} onChange={(e) => patchSettings({ announcementHref: e.target.value })} /></div>
                  </>
                )}
              </div>

              <div className="ss__block">
                <h4>{L('التواصل', 'Contact')}</h4>
                {[['whatsapp', L('واتساب', 'WhatsApp')], ['email', L('البريد الإلكتروني', 'Email')], ['phone', L('الهاتف', 'Phone')], ['address', L('العنوان', 'Address')], ['hours', L('ساعات العمل', 'Working hours')]].map(([k, label]) => (
                  <div className="ss-f" key={k}>
                    <label>{label}</label>
                    <input type="text" dir="ltr" value={store.settings?.[k] || ''} onChange={(e) => patchSettings({ [k]: e.target.value })} />
                  </div>
                ))}
              </div>

              <div className="ss__block">
                <h4>{L('الشحن والإرجاع', 'Shipping & returns')}</h4>
                <div className="ss-f"><label>{L('سياسة الشحن (عربي)', 'Shipping policy (AR)')}</label><textarea rows={2} value={store.settings?.shipping_ar || ''} onChange={(e) => patchSettings({ shipping_ar: e.target.value })} /></div>
                <div className="ss-f"><label>{L('سياسة الشحن (إنجليزي)', 'Shipping policy (EN)')}</label><textarea rows={2} value={store.settings?.shipping_en || ''} onChange={(e) => patchSettings({ shipping_en: e.target.value })} /></div>
                <div className="ss-f"><label>{L('سياسة الإرجاع (عربي)', 'Return policy (AR)')}</label><textarea rows={2} value={store.settings?.return_ar || ''} onChange={(e) => patchSettings({ return_ar: e.target.value })} /></div>
                <div className="ss-f"><label>{L('سياسة الإرجاع (إنجليزي)', 'Return policy (EN)')}</label><textarea rows={2} value={store.settings?.return_en || ''} onChange={(e) => patchSettings({ return_en: e.target.value })} /></div>
              </div>

              <div className="ss__block">
                <h4>{L('السوشال ميديا', 'Social links')}</h4>
                <button type="button" className="ss__linkbtn" onClick={() => patchSettings({ socials: [...(store.settings?.socials || []), { label: 'instagram', url: '' }] })}>
                  + {L('إضافة شبكة', 'Add network')}
                </button>
                {(store.settings?.socials || []).map((s, i) => (
                  <div className="ss__social" key={i}>
                    <input type="text" dir="ltr" placeholder={L('الشبكة', 'Network')} value={s.label || ''} onChange={(e) => {
                      const arr = [...(store.settings?.socials || [])];
                      arr[i] = { ...arr[i], label: e.target.value };
                      patchSettings({ socials: arr });
                    }} />
                    <input type="text" dir="ltr" placeholder="https://" value={s.url || ''} onChange={(e) => {
                      const arr = [...(store.settings?.socials || [])];
                      arr[i] = { ...arr[i], url: e.target.value };
                      patchSettings({ socials: arr });
                    }} />
                    <button type="button" className="ss__mini ss__mini--danger" onClick={() => patchSettings({ socials: (store.settings?.socials || []).filter((_, j) => j !== i) })}>🗑</button>
                  </div>
                ))}
              </div>

              <div className="ss__block">
                <h4>{L('تحسين محركات البحث (SEO)', 'SEO')}</h4>
                <div className="ss-f"><label>{L('العنوان', 'Title')}</label><input type="text" value={store.seo?.title || ''} onChange={(e) => patchSeo({ title: e.target.value })} /></div>
                <div className="ss-f"><label>{L('الوصف', 'Description')}</label><textarea rows={2} value={store.seo?.description || ''} onChange={(e) => patchSeo({ description: e.target.value })} /></div>
              </div>
            </div>
          )}
        </aside>

        <section className="ss__canvas">
          <div className="ss__canvas-bar">
            <span>{L('معاينة مباشرة', 'Live preview')}</span>
            <em>{mode === 'preview' ? L('عرض كامل', 'Full width') : L('جنب المحرر', 'Side by side')}</em>
          </div>
          <div className="ss__canvas-wrap">
            <div className="ss__store">
              <StoreRenderer
                key={mode === 'preview' ? store.slug : `${store.slug}-${expandedId || 'x'}-${view}`}
                store={store}
                seller={sellerLike}
                products={previewProducts}
                categories={categories}
                dir={rtl ? 'rtl' : 'ltr'}
                mode="preview"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}