import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DEMO_LOOKS, DEMO_ABOUT_BULLETS, DEMO_TESTIMONIALS, DEMO_FAQ, DEMO_STATS } from '../../lib/demoCatalog';
import { saveStorefront, slugify, isSlugAvailable, PALETTES, FONT_PRESETS, DEFAULT_THEME, getPalette } from '../../lib/storefront';
import { SECTION_TYPES, sectionLabel, makeSection } from './sectionSchema';
import './StoreStudio.css';

const TEMPLATES = [
  {
    id: 'ember', icon: '🔥', label_ar: 'جمر', label_en: 'Ember', desc_ar: 'كلاسيكي دافئ بلمسة برتقالية', desc_en: 'Warm classic, orange pop',
    theme: { palette: 'ember', font: 'modern', radius: 18, density: 'comfy', custom: {} },
    sections: [
      { type: 'hero', props: { layout: 'full', align: 'center', height: 'tall', title_ar: 'طيف', title_en: 'Taif', subtitle_ar: 'قطع مختارة بعناية', subtitle_en: 'Handpicked pieces', cta1Label_ar: 'تسوّق الآن', cta1Label_en: 'Shop now', cta1Href: '#products', cta2Label_ar: '', cta2Label_en: '' } },
      { type: 'featured', props: { title_ar: 'منتجاتنا', title_en: 'Our products', subtitle_ar: '', subtitle_en: '', source: 'featured', limit: 8, layout: 'grid', showPrice: true, cartBtn: 'overlay' } },
      { type: 'categories', props: { title_ar: 'تسوّق حسب القسم', title_en: 'Shop by category', layout: 'cards', limit: 8 } },
      { type: 'contact', props: { title_ar: 'تواصل معنا', title_en: 'Get in touch', showWhatsapp: true, showEmail: true, showPhone: true, showAddress: true } },
    ],
  },
  {
    id: 'editorial', icon: '📰', label_ar: 'تحريري فاخر', label_en: 'Editorial Luxe', desc_ar: 'مجلة فاخرة بخط سيريف وأناقة', desc_en: 'Luxury magazine serif',
    theme: { palette: 'sand', font: 'editorial', radius: 8, density: 'comfy', custom: {} },
    sections: [
      { type: 'hero', props: { layout: 'split', align: 'start', height: 'tall', eyebrow_ar: 'خريف ٢٠٢٦', eyebrow_en: 'Autumn 2026', title_ar: 'طيف', title_en: 'Taif', subtitle_ar: 'قصص تُروى بخيط واحد', subtitle_en: 'Stories told in one thread', cta1Label_ar: 'المجموعة الجديدة', cta1Label_en: 'New collection', cta1Href: '#products', cta2Label_ar: '', cta2Label_en: '' } },
      { type: 'featured', props: { title_ar: 'القطع المميزة', title_en: 'Featured pieces', subtitle_ar: 'أيقونات لا تُنسى', subtitle_en: 'Timeless icons', source: 'featured', limit: 6, layout: 'editorial', showPrice: true, cartBtn: 'inline' } },
      { type: 'lookbook', props: { title_ar: 'من أعمالنا', title_en: 'Lookbook', subtitle_ar: '', subtitle_en: '', columns: 3, images: [] } },
      { type: 'about', props: { title_ar: 'قصتنا', title_en: 'Our story', text_ar: '', text_en: '', bullets: [] } },
      { type: 'testimonials', props: { title_ar: 'قالوا عنا', title_en: 'Kind words', items: [] } },
      { type: 'contact', props: { title_ar: 'تواصل معنا', title_en: 'Get in touch', showWhatsapp: true, showEmail: true, showPhone: false, showAddress: true } },
    ],
  },
  {
    id: 'noir', icon: '🌙', label_ar: 'ليلي', label_en: 'Noir', desc_ar: 'داكن وجريء بأسلوب شارعي', desc_en: 'Dark & bold street style',
    theme: { palette: 'noir', font: 'display', radius: 12, density: 'airy', custom: {} },
    sections: [
      { type: 'hero', props: { layout: 'full', align: 'center', height: 'tall', title_ar: 'طيف', title_en: 'Taif', subtitle_ar: 'لا تتبع الموضة — أمليها', subtitle_en: 'Don\'t follow trends — set them', overlay: 62, cta1Label_ar: 'اكتشف', cta1Label_en: 'Discover', cta1Href: '#products', cta2Label_ar: '', cta2Label_en: '' } },
      { type: 'marquee', props: { text_ar: 'شحن مجاني 🚚 جميع أنحاء السعودية', text_en: 'Free shipping 🚚 all across KSA', speed: 22 } },
      { type: 'featured', props: { title_ar: 'الأحدث', title_en: 'Fresh drops', subtitle_ar: '', subtitle_en: '', source: 'all', limit: 10, layout: 'carousel', showPrice: true, cartBtn: 'overlay' } },
      { type: 'lookbook', props: { title_ar: 'إطلالات', title_en: 'Looks', subtitle_ar: '', subtitle_en: '', columns: 4, images: [] } },
      { type: 'cta', props: { title_ar: 'لا تفوّت الاقتناص', title_en: 'Never miss a drop', button_ar: 'انضم للقائمة', button_en: 'Join the list', href: '#contact' } },
      { type: 'contact', props: { title_ar: 'تواصل معنا', title_en: 'Get in touch', showWhatsapp: true, showEmail: true, showPhone: true, showAddress: false } },
    ],
  },
  {
    id: 'boutique', icon: '🌸', label_ar: 'بوتيك', label_en: 'Boutique', desc_ar: 'وردي أنيق لمتاجر الأزياء', desc_en: 'Graceful pink boutique',
    theme: { palette: 'rose', font: 'editorial', radius: 24, density: 'airy', custom: {} },
    sections: [
      { type: 'hero', props: { layout: 'center', align: 'center', height: 'tall', title_ar: 'طيف بوتيك', title_en: 'Taif Boutique', subtitle_ar: 'لمسة ناعمة لكل يوم', subtitle_en: 'A soft touch for every day', cta1Label_ar: 'تسوّق', cta1Label_en: 'Shop', cta1Href: '#products', cta2Label_ar: 'مواعيدنا', cta2Label_en: 'Book us', cta2Href: '#contact' } },
      { type: 'featured', props: { title_ar: 'وصل حديثاً', title_en: 'New arrivals', subtitle_ar: '', subtitle_en: '', source: 'all', limit: 8, layout: 'grid', showPrice: true, cartBtn: 'inline' } },
      { type: 'about', props: { title_ar: 'فلسفتنا', title_en: 'Our philosophy', text_ar: '', text_en: '', bullets: [] } },
      { type: 'testimonials', props: { title_ar: 'آراء عميلاتنا', title_en: 'Client love', items: [] } },
      { type: 'contact', props: { title_ar: 'احجزي موعدك', title_en: 'Book an appointment', showWhatsapp: true, showEmail: true, showPhone: true, showAddress: true } },
    ],
  },
  {
    id: 'minimal', icon: '▫', label_ar: 'مينيمال', label_en: 'Minimal', desc_ar: 'نظيف وبلا تشتيت', desc_en: 'Clean, distraction-free',
    theme: { palette: 'ink', font: 'modern', radius: 10, density: 'compact', custom: {} },
    sections: [
      { type: 'hero', props: { layout: 'full', align: 'center', height: 'medium', title_ar: 'طيف', title_en: 'Taif', subtitle_ar: 'أقل هو أكثر', subtitle_en: 'Less is more', cta1Label_ar: 'تسوّق', cta1Label_en: 'Shop', cta1Href: '#products', cta2Label_ar: '', cta2Label_en: '' } },
      { type: 'featured', props: { title_ar: 'تشكيلتنا', title_en: 'The Edit', subtitle_ar: '', subtitle_en: '', source: 'featured', limit: 6, layout: 'grid', showPrice: true, cartBtn: 'hidden' } },
      { type: 'contact', props: { title_ar: 'تواصل معنا', title_en: 'Get in touch', showWhatsapp: true, showEmail: true, showPhone: false, showAddress: false } },
    ],
  },
  {
    id: 'organic', icon: '🌿', label_ar: 'طبيعي', label_en: 'Organic', desc_ar: 'أخضر هادئ يبني الثقة', desc_en: 'Calm green trust builder',
    theme: { palette: 'sage', font: 'classic', radius: 20, density: 'comfy', custom: {} },
    sections: [
      { type: 'hero', props: { layout: 'full', align: 'center', height: 'tall', title_ar: 'طيف', title_en: 'Taif', subtitle_ar: 'طبيعي أصيل من الأرض', subtitle_en: 'Honest, from the earth', cta1Label_ar: 'اكتشف', cta1Label_en: 'Explore', cta1Href: '#products', cta2Label_ar: '', cta2Label_en: '' } },
      { type: 'featured', props: { title_ar: 'منتجاتنا', title_en: 'Our products', subtitle_ar: '', subtitle_en: '', source: 'all', limit: 8, layout: 'grid', showPrice: true, cartBtn: 'inline' } },
      { type: 'about', props: { title_ar: 'من نحن', title_en: 'Who we are', text_ar: '', text_en: '', bullets: [] } },
      { type: 'faq', props: { title_ar: 'أسئلة شائعة', title_en: 'FAQ', items: [] } },
      { type: 'testimonials', props: { title_ar: 'قالوا عنا', title_en: 'Kind words', items: [] } },
      { type: 'contact', props: { title_ar: 'تواصل معنا', title_en: 'Get in touch', showWhatsapp: true, showEmail: true, showPhone: true, showAddress: true } },
    ],
  },
];

function Field({ field, value, onChange, dir, onPickImage, sectionId }) {
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
    const options = field.options || [];
    const isSegmented = options.length <= 4 && options.every((o) => o.label_ar.length < 16);
    if (isSegmented) {
      return (
        <div className="ss-f">
          <label>{label}</label>
          <div className="ss-seg">
            {options.map((o) => (
              <button key={o.value} type="button" className={String(value ?? '') === o.value ? 'is-active' : ''} onClick={() => onChange(o.value)}>
                {dir === 'rtl' ? o.label_ar : o.label_en}
              </button>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="ss-f">
        <label>{label}</label>
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
          {(options || []).map((o) => (
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
        <MediaThumb value={String(value ?? '')} onChange={onChange} onPick={() => onPickImage(sectionId, field.k)} dir={dir} />
      </div>
    );
  }
  if (field.type === 'list') {
    return (
      <div className="ss-f">
        <label>{label}</label>
        <ListEditor field={field} value={Array.isArray(value) ? value : []} onChange={onChange} dir={dir} onPickImage={onPickImage} sectionId={sectionId} />
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

function MediaThumb({ value, onChange, onPick, dir }) {
  return (
    <div className={`ss-img${value ? ' has-img' : ''}`} onClick={onPick}>
      {value ? <img src={value} alt="" /> : <span className="ss-img__empty">🖼 {dir === 'rtl' ? 'اضغط لإضافة صورة' : 'Tap to add an image'}</span>}
      {value && (
        <div className="ss-img__over" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="ss-img__act" onClick={onPick}>{dir === 'rtl' ? 'تغيير' : 'Change'}</button>
          <button type="button" className="ss-img__act ss-img__act--del" onClick={() => onChange('')}>{dir === 'rtl' ? 'إزالة' : 'Remove'}</button>
        </div>
      )}
    </div>
  );
}

function ListEditor({ field, value, onChange, dir, onPickImage, sectionId }) {
  const add = () => onChange([...value, field.blank ? field.blank() : {}]);
  const setItem = (i, k, v) => {
    const next = value.map((it, j) => (j === i ? { ...it, [k]: v } : it));
    onChange(next);
  };
  const remove = (i) => onChange(value.filter((_, j) => j !== i));
  return (
    <div className="ss-list">
      {value.length === 0 && <p className="ss-list__empty">{dir === 'rtl' ? 'لا عناصر بعد — اضغط "إضافة"' : 'No items yet — tap Add'}</p>}
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
              <Field key={j} field={sub} value={item[sub.k]} onChange={(v) => setItem(i, sub.k, v)} dir={dir} onPickImage={onPickImage} sectionId={sectionId} />
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

export default function StoreStudio({
  uid, store, onChange, seller, dir, isPending, onExit,
  selectedId, onSelectSection,
  onPickImage,
  savedHint,
  panel, setPanel,
  onAddAt,
}) {
  const { dir: langDir } = useLanguage();
  const rtl = (dir == null ? langDir : dir) === 'rtl';
  const L = (ar, en) => (rtl ? ar : en);

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [slugState, setSlugState] = useState('idle');

  const theme = store?.theme || DEFAULT_THEME;
  const slug = slugify(store?.slug || '');
  const isPublished = store?.status === 'published';

  const editingSection = selectedId ? store.sections.find((s) => s.id === selectedId) || null : null;
  const sheetTitle = editingSection
    ? sectionLabel(editingSection.type, rtl ? 'rtl' : 'ltr')
    : panel === 'add' ? L('إضافة قسم', 'Add section')
    : panel === 'design' ? L('تصميم المتجر', 'Design')
    : panel === 'settings' ? L('إعدادات المتجر', 'Settings')
    : L('أقسام المتجر', 'Sections');

  const sheetOpen = !!editingSection || !!panel;

  const patchTheme = (p) => onChange({ ...store, theme: { ...store.theme, ...p } });
  const patchCustom = (p) => onChange({ ...store, theme: { ...store.theme, custom: { ...(store.theme?.custom || {}), ...p } } });
  const patchSettings = (p) => onChange({ ...store, settings: { ...store.settings, ...p } });
  const patchSeo = (p) => onChange({ ...store, seo: { ...(store.seo || {}), ...p } });

  const patchSection = (id, p) => onChange({
    ...store,
    sections: store.sections.map((sec) => (sec.id === id ? { ...sec, props: { ...(sec.props || {}), ...p } } : sec)),
  });

  const toggleSection = (id) => onChange({
    ...store,
    sections: store.sections.map((sec) => (sec.id === id ? { ...sec, visible: sec.visible !== false ? false : true } : sec)),
  });

  const removeSection = (id) => {
    onChange({ ...store, sections: store.sections.filter((sec) => sec.id !== id) });
    if (selectedId === id) onSelectSection(null);
  };

  const addSection = (type) => {
    if (onAddAt) { onAddAt(type); return; }
    const sec = makeSection(type, rtl ? 'rtl' : 'ltr');
    if (!sec) return;
    onChange({ ...store, sections: [...store.sections, sec] });
    onSelectSection(sec.id);
    setPanel(null);
  };

  const seedSectionLists = (section) => {
    const p = section.props || {};
    const list = {
      lookbook: () => (p.images && p.images.length ? null : { images: DEMO_LOOKS }),
      about: () => (p.bullets && p.bullets.length ? null : { bullets: DEMO_ABOUT_BULLETS }),
      testimonials: () => (p.items && p.items.length ? null : { items: DEMO_TESTIMONIALS }),
      faq: () => (p.items && p.items.length ? null : { items: DEMO_FAQ }),
      stats: () => (p.items && p.items.length ? null : { items: DEMO_STATS }),
    }[section.type];
    return list ? { ...section, props: { ...p, ...(list() || {}) } } : section;
  };

  const applyTemplate = (tpl) => {    const dir = rtl ? 'rtl' : 'ltr';
    const built = (tpl.sections || []).map(({ type, props }) => {
      const sec = makeSection(type, dir);
      if (!sec) return null;
      return { ...sec, props: { ...sec.props, ...props } };
    }).filter(Boolean).map(seedSectionLists);
    onChange({
      ...store,
      theme: { ...tpl.theme, custom: {} },
      sections: built.length ? built : store.sections,
    });
    setPanel('design');
  };

  const publish = async (targetStatus) => {
    const next = { ...store, status: targetStatus };
    onChange(next);
    setSaving(true);
    let localOnly = true;
    try {
      if (next.seller_id) {
        const res = await saveStorefront(next);
        localOnly = res.localOnly || !res.ok;
      }
    } catch {}
    if (localOnly && uid) {
      try { localStorage.setItem(`mawrid_storefront_${uid}`, JSON.stringify(next)); } catch {}
    }
    setSaving(false);
    setSavedMsg(localOnly ? L('حُفظ محلياً ✓', 'Saved locally ✓') : (targetStatus === 'published' ? L('تم النشر ✓', 'Published ✓') : L('تم الحفظ ✓', 'Saved ✓')));
    setTimeout(() => setSavedMsg(''), 2600);
  };

  const checkSlug = async () => {
    if (!slug || !store.seller_id) { setSlugState('ok'); return; }
    setSlugState('checking');
    const ok = await isSlugAvailable(slug, store.seller_id);
    setSlugState(ok ? 'ok' : 'taken');
  };

  useEffect(() => {
    let alive = true;
    if (slugState !== 'idle' || !slug || !store.seller_id) return;
    setSlugState('checking');
    isSlugAvailable(slug, store.seller_id).then((ok) => {
      if (alive) setSlugState(ok ? 'ok' : 'taken');
    });
    return () => { alive = false; };
  }, [slug, slugState, store.seller_id]);

  const closeSheet = () => {
    onSelectSection(null);
    setPanel(null);
  };

  return (
    <>
      {/* Sheet (contextual) */}
      {sheetOpen && (
        <div className={`ss-sheet${rtl ? '' : ' ss-sheet--ltr'}`}>
          <div className="ss-sheet__head">
            <b>{sheetTitle}</b>
            {editingSection && (
              <div className="ss-sheet__mini">
                <button type="button" onClick={() => toggleSection(editingSection.id)} title={L('إظهار/إخفاء', 'Show/Hide')}>{editingSection.visible === false ? '◐' : '👁'}</button>
              </div>
            )}
            <button type="button" className="ss-sheet__close" onClick={closeSheet}>✕</button>
          </div>
          <div className="ss-sheet__body">
            {editingSection ? (
              <>
                <div className="ss-livetip">
                  <b>✱</b>
                  <span>{L('التعديلات تظهر على الصفحة مباشرة', 'Changes apply to your page instantly')}</span>
                </div>
                {(SECTION_TYPES[editingSection.type]?.fields || []).map((field, j) => (
                  <Field
                    key={j}
                    field={field}
                    value={editingSection.props?.[field.k]}
                    onChange={(v) => patchSection(editingSection.id, { [field.k]: v })}
                    dir={rtl ? 'rtl' : 'ltr'}
                    onPickImage={onPickImage}
                    sectionId={editingSection.id}
                  />
                ))}
                <button type="button" className="ss-sheet__delete" onClick={() => removeSection(editingSection.id)}>
                  🗑 {L('حذف هذا القسم', 'Delete this section')}
                </button>
              </>
            ) : panel === 'add' ? (
              <>
                <p className="ss-sheet__sub">{L('اختر نوع القسم — يُضاف في الموضع الذي ضغطت فيه على ＋', 'Pick a section type — added where you tapped ＋')}</p>
                <div className="ss-grid">
                  {Object.entries(SECTION_TYPES).map(([type, def]) => (
                    <button key={type} type="button" className="ss-tile" onClick={() => addSection(type)}>
                      <i>{def.icon}</i>
                      <span>{rtl ? def.label_ar : def.label_en}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : panel === 'design' ? (
              <>
                <div className="ss__block">
                  <h4>{L('قوالب جاهزة', 'Ready templates')}</h4>
                  <div className="ss__templates">
                    {TEMPLATES.map((tpl) => (
                      <button key={tpl.id} type="button" className={theme.palette === tpl.theme.palette && theme.font === tpl.theme.font ? 'is-active' : ''} onClick={() => applyTemplate(tpl)}>
                        <i style={{ background: getPalette(tpl.theme.palette).bg, color: getPalette(tpl.theme.palette).ink }}><em style={{ background: getPalette(tpl.theme.palette).primary }} /></i>
                        <span><b>{tpl.icon} {rtl ? tpl.label_ar : tpl.label_en}</b><small>{rtl ? tpl.desc_ar : tpl.desc_en}</small></span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="ss__block">
                  <h4>{L('الألوان', 'Colours')}</h4>
                  <div className="ss__palettes">
                    {PALETTES.map((p) => (
                      <button key={p.id} type="button" className={theme.palette === p.id ? 'is-active' : ''} onClick={() => patchTheme({ palette: p.id })}>
                        <i style={{ background: `linear-gradient(135deg, ${p.bg} 0%, ${p.surface} 60%)`, color: p.ink }}><b style={{ background: p.primary }} /></i>
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
                        <b style={{ fontFamily: f.head }}>ع</b>
                        <span>{rtl ? f.label_ar : f.label_en}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="ss__block">
                  <h4>{L('ألوان مخصصة', 'Custom colours')}</h4>
                  <div className="ss__colors">
                    {[['primary', L('الرئيسي', 'Primary')], ['accent', L('الثانوي', 'Accent')], ['bg', L('الخلفية', 'Background')], ['surface', L('البطاقات', 'Cards')], ['ink', L('النص', 'Text')]].map(([k, label]) => (
                      <ColorRow key={k} label={label} value={theme.custom?.[k] || getPalette(theme.palette)[k]} onChange={(v) => patchCustom({ [k]: v })} />
                    ))}
                  </div>
                </div>
                <div className="ss__block">
                  <h4>{L('المقاس والكثافة', 'Shape')}</h4>
                  <div className="ss-f">
                    <label>{L('انحناء الحواف', 'Corner radius')} — {theme.radius}px</label>
                    <input type="range" min={4} max={32} value={theme.radius ?? 18} onChange={(e) => patchTheme({ radius: Number(e.target.value) })} />
                  </div>
                  <div className="ss-f">
                    <label>{L('الكثافة', 'Density')}</label>
                    <div className="ss-seg">
                      {[['compact', L('مضغوط', 'Tight')], ['comfy', L('مريح', 'Comfy')], ['airy', L('واسع', 'Airy')]].map(([v, label]) => (
                        <button key={v} type="button" className={theme.density === v ? 'is-active' : ''} onClick={() => patchTheme({ density: v })}>{label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="ss__block">
                  <h4>{L('رابط المتجر', 'Store link')}</h4>
                  <div className="ss-slug">
                    <span>/store/</span>
                    <input type="text" value={store.slug || ''} dir="ltr" onChange={(e) => onChange({ ...store, slug: slugify(e.target.value) })} onBlur={checkSlug} />
                  </div>
                  <div className="ss-slug-state">
                    {slugState === 'checking' && <span className="is-check">{L('جارٍ التحقق…', 'Checking…')}</span>}
                    {slugState === 'ok' && <span className="is-ok">✓ {L('متاح', 'Available')}</span>}
                    {slugState === 'taken' && <span className="is-bad">✕ {L('مستخدم', 'Taken')}</span>}
                  </div>
                </div>
                <div className="ss__block">
                  <h4>{L('عن المتجر', 'Identity')}</h4>
                  <div className="ss-f"><label>{L('الشعار المختصر (عربي)', 'Tagline (AR)')}</label><input type="text" value={store.settings?.tagline_ar || ''} onChange={(e) => patchSettings({ tagline_ar: e.target.value })} /></div>
                  <div className="ss-f"><label>{L('الشعار المختصر (إنجليزي)', 'Tagline (EN)')}</label><input type="text" value={store.settings?.tagline_en || ''} onChange={(e) => patchSettings({ tagline_en: e.target.value })} /></div>
                  <div className="ss-f ss-f--toggle">
                    <span>{L('شريط الإعلان', 'Announcement bar')}</span>
                    <button type="button" className={`ss-switch${store.settings?.announcementOn ? ' is-on' : ''}`} onClick={() => patchSettings({ announcementOn: !store.settings?.announcementOn })} aria-pressed={!!store.settings?.announcementOn}><i /></button>
                  </div>
                  {store.settings?.announcementOn && (<>
                    <div className="ss-f"><label>{L('الإعلان (عربي)', 'Announcement (AR)')}</label><input type="text" value={store.settings?.announcement_ar || ''} onChange={(e) => patchSettings({ announcement_ar: e.target.value })} /></div>
                    <div className="ss-f"><label>{L('الإعلان (إنجليزي)', 'Announcement (EN)')}</label><input type="text" value={store.settings?.announcement_en || ''} onChange={(e) => patchSettings({ announcement_en: e.target.value })} /></div>
                    <div className="ss-f"><label>{L('رابط الإعلان', 'Announcement link')}</label><input type="text" dir="ltr" value={store.settings?.announcementHref || ''} onChange={(e) => patchSettings({ announcementHref: e.target.value })} /></div>
                  </>)}
                </div>
                <div className="ss__block">
                  <h4>{L('التواصل', 'Contact')}</h4>
                  {[['whatsapp', L('واتساب', 'WhatsApp')], ['email', L('البريد', 'Email')], ['phone', L('الهاتف', 'Phone')], ['address', L('العنوان', 'Address')], ['hours', L('ساعات العمل', 'Hours')]].map(([k, label]) => (
                    <div className="ss-f" key={k}><label>{label}</label><input type="text" dir="ltr" value={store.settings?.[k] || ''} onChange={(e) => patchSettings({ [k]: e.target.value })} /></div>
                  ))}
                </div>
                <div className="ss__block">
                  <h4>{L('الشحن والإرجاع', 'Policies')}</h4>
                  <div className="ss-f"><label>{L('الشحن (عربي)', 'Shipping (AR)')}</label><textarea rows={2} value={store.settings?.shipping_ar || ''} onChange={(e) => patchSettings({ shipping_ar: e.target.value })} /></div>
                  <div className="ss-f"><label>{L('الشحن (إنجليزي)', 'Shipping (EN)')}</label><textarea rows={2} value={store.settings?.shipping_en || ''} onChange={(e) => patchSettings({ shipping_en: e.target.value })} /></div>
                  <div className="ss-f"><label>{L('الإرجاع (عربي)', 'Returns (AR)')}</label><textarea rows={2} value={store.settings?.return_ar || ''} onChange={(e) => patchSettings({ return_ar: e.target.value })} /></div>
                  <div className="ss-f"><label>{L('الإرجاع (إنجليزي)', 'Returns (EN)')}</label><textarea rows={2} value={store.settings?.return_en || ''} onChange={(e) => patchSettings({ return_en: e.target.value })} /></div>
                </div>
                <div className="ss__block">
                  <h4>{L('السوشيال ميديا', 'Social')}</h4>
                  <button type="button" className="ss__linkbtn" onClick={() => patchSettings({ socials: [...(store.settings?.socials || []), { label: 'instagram', url: '' }] })}>+ {L('إضافة شبكة', 'Add network')}</button>
                  {(store.settings?.socials || []).map((s, i) => (
                    <div className="ss__social" key={i}>
                      <input type="text" dir="ltr" placeholder={L('الشبكة', 'Network')} value={s.label || ''} onChange={(e) => { const arr = [...(store.settings?.socials || [])]; arr[i] = { ...arr[i], label: e.target.value }; patchSettings({ socials: arr }); }} />
                      <input type="text" dir="ltr" placeholder="https://" value={s.url || ''} onChange={(e) => { const arr = [...(store.settings?.socials || [])]; arr[i] = { ...arr[i], url: e.target.value }; patchSettings({ socials: arr }); }} />
                      <button type="button" className="ss__mini ss__mini--danger" onClick={() => patchSettings({ socials: (store.settings?.socials || []).filter((_, j) => j !== i) })}>🗑</button>
                    </div>
                  ))}
                </div>
                <div className="ss__block">
                  <h4>SEO</h4>
                  <div className="ss-f"><label>{L('العنوان', 'Title')}</label><input type="text" value={store.seo?.title || ''} onChange={(e) => patchSeo({ title: e.target.value })} /></div>
                  <div className="ss-f"><label>{L('الوصف', 'Description')}</label><textarea rows={2} value={store.seo?.description || ''} onChange={(e) => patchSeo({ description: e.target.value })} /></div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Dock */}
      <div className={`ss${rtl ? '' : ' ss--ltr'}`}>
        <div className="ss__dock">
          <div className="ss__dock-brand">
            <span className="ss__dock-logo">🛍️</span>
            <span className="ss__dock-title">
              <b>{seller?.store_name || 'المتجر'}</b>
              <em className={`ss__pill${isPublished ? ' is-live' : ''}`}>{isPublished ? L('منشور', 'Live') : L('مسودة', 'Draft')}</em>
            </span>
          </div>

          <div className="ss__dock-actions">
            <button type="button" className={panel === 'add' ? 'is-active' : ''} onClick={() => { onSelectSection(null); setPanel(panel === 'add' ? null : 'add'); }}>
              <i>＋</i> {L('قسم', 'Section')}
            </button>
            <button type="button" className={panel === 'design' ? 'is-active' : ''} onClick={() => { onSelectSection(null); setPanel(panel === 'design' ? null : 'design'); }}>
              <i>🎨</i> {L('تصميم', 'Design')}
            </button>
            <button type="button" className={panel === 'settings' ? 'is-active' : ''} onClick={() => { onSelectSection(null); setPanel(panel === 'settings' ? null : 'settings'); }}>
              <i>⚙</i> {L('إعدادات', 'Settings')}
            </button>
          </div>

          <div className="ss__dock-status">
            {savedMsg && <span className="ss__saved">{savedMsg}</span>}
            {savedHint && <span className="ss__saved">{savedHint}</span>}
            {!isPending && (
              isPublished ? (
                <button type="button" className="ss__btn ss__btn--soft" disabled={saving} onClick={() => publish('draft')}>{L('إلغاء النشر', 'Unpublish')}</button>
              ) : (
                <button type="button" className="ss__btn ss__btn--primary" disabled={saving} onClick={() => publish('published')}>{saving ? L('…', '…') : L('نشر المتجر', 'Publish')}</button>
              )
            )}
            <button type="button" className="ss__dock-exit" onClick={onExit} title={L('إنهاء التحرير', 'Exit editor')}>✕ {L('تم', 'Done')}</button>
          </div>
        </div>
      </div>
    </>
  );
}