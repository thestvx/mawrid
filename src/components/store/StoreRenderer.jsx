import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { themeToVars } from '../../lib/storefront';
import { SECTIONS, StoreLink } from './StoreSections';
import './StoreRenderer.css';

function buildCategories(products, provided) {
  if (provided && provided.length) return provided;
  const map = new Map();
  (products || []).forEach((p) => {
    const key = p.category_id || p.category_name;
    if (!key) return;
    if (!map.has(key)) map.set(key, { id: p.category_id || key, name: p.category_name || key, name_en: p.category_name_en, count: 0, image: p.thumbnail || (p.images && p.images[0]) });
    map.get(key).count += 1;
  });
  return [...map.values()];
}

const IMG_FIELD = { hero: 'image', about: 'image', cta: 'image', video: 'poster' };

function EditBridge({ index, onAdd }) {
  return (
    <div className="st-bridge" data-i={index}>
      <button type="button" className="st-bridge__btn" onClick={(e) => { e.preventDefault(); onAdd(index); }} aria-label="Add section here">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        <span>أضف قسماً</span>
      </button>
    </div>
  );
}

function EditSlot({ section, index, count, editing, selected, onSelect, onOp, onAdd, onImg, children }) {
  const imgKey = IMG_FIELD[section.type];
  return (
    <div
      className={`st-slot${selected ? ' is-selected' : ''}`}
      data-section-id={section.id}
      onClick={(e) => { if (e.target.closest('button, a')) return; onSelect(section.id); }}
    >
      {editing && <EditBridge index={index} onAdd={onAdd} />}
      <div className={`st-slot__body${section.visible === false ? ' is-hidden' : ''}`}>
        {editing && (
          <div className="st-slot__bar" onClick={(e) => e.stopPropagation()}>
            <span className="st-slot__name">
              {section.visible === false ? '◐' : '●'}
              {' '}
              {section.type === 'featured' ? (section.props?.title_en || section.props?.title_ar || 'Products') : section.type}
            </span>
            <button type="button" className="st-slot__act" disabled={index === 0} onClick={() => onOp(section.id, 'up')} title="Up">↑</button>
            <button type="button" className="st-slot__act" disabled={index === count - 1} onClick={() => onOp(section.id, 'down')} title="Down">↓</button>
            {imgKey && onImg && (
              <button type="button" className="st-slot__act" onClick={() => onImg(section.id, imgKey)} title="Image">🖼</button>
            )}
            <button type="button" className="st-slot__act" onClick={() => onOp(section.id, 'toggle')} title={section.visible === false ? 'Show' : 'Hide'}>
              {section.visible === false ? '◐' : '👁'}
            </button>
            <button type="button" className="st-slot__act st-slot__act--danger" onClick={() => onOp(section.id, 'remove')} title="Delete">✕</button>
          </div>
        )}
        <div className="st-slot__content">
          {children}
          {editing && section.visible === false && <div className="st-slot__veil">{section.type}</div>}
        </div>
      </div>
    </div>
  );
}

export default function StoreRenderer({ store, seller, products = [], categories, dir, mode = 'public', editing, selectedId, onSelectSection, onSectionOp, onAddSection, onPickImage }) {
  const { count } = useCart();
  const [activeCategory, setActiveCategory] = useState(null);

  const theme = store?.theme || {};
  const settings = store?.settings || {};
  const cats = useMemo(() => buildCategories(products, categories), [products, categories]);
  const vars = useMemo(() => themeToVars(theme), [theme]);

  useEffect(() => { setActiveCategory(null); }, [store?.slug]);

  const storeName = seller?.store_name || seller?.storeName || seller?.full_name || 'Mawrid Store';
  const tagline = dir === 'rtl' ? settings.tagline_ar : settings.tagline_en;
  const logo = seller?.logo_url || seller?.avatar_url;

  const navItems = [
    { id: 'products', ar: 'المنتجات', en: 'Products' },
    cats.length ? { id: 'categories', ar: 'الأقسام', en: 'Categories' } : null,
    { id: 'about', ar: 'من نحن', en: 'About' },
    { id: 'contact', ar: 'تواصل', en: 'Contact' },
  ].filter(Boolean);

  const ctx = { dir, mode, theme, products, categories: cats, settings, seller, activeCategory, onSelectCategory: (c) => setActiveCategory((prev) => (prev === c.id || prev === c.name ? null : c.id || c.name)) };

  const visibleSections = (store?.sections || []).filter((s) => editing || s.visible !== false);

  return (
    <div className="st-root" dir={dir} style={vars} data-density={theme.density || 'comfy'}>
      {settings.announcementOn && (settings.announcement_ar || settings.announcement_en) && (
        <div className="st-announce">
          <StoreLink href={settings.announcementHref} mode={mode}>
            {dir === 'rtl' ? (settings.announcement_ar || settings.announcement_en) : (settings.announcement_en || settings.announcement_ar)}
          </StoreLink>
        </div>
      )}

      <header className="st-nav">
        <div className="st-nav__inner">
          <div className="st-nav__brand">
            {logo ? <img src={logo} alt={storeName} /> : <span className="st-nav__mark">{storeName.slice(0, 1)}</span>}
            <div>
              <strong>{storeName}</strong>
              {tagline && <small>{tagline}</small>}
            </div>
          </div>
          <nav className="st-nav__links">
            {navItems.map((n) => (
              <a key={n.id} href={`#${n.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(n.id)?.scrollIntoView({ behavior: 'smooth' }); }}>
                {dir === 'rtl' ? n.ar : n.en}
              </a>
            ))}
          </nav>
          <Link to="/cart" className="st-nav__cart" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {count > 0 && <em>{count}</em>}
          </Link>
        </div>
      </header>

      <main className="st-main">
        {visibleSections.length === 0 && (
          editing ? (
            <div className="st-empty" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: '1rem' }}>المتجر فاضي — أضف أول قسم من الزر أدناه</p>
              <div className="st-bridge" style={{ margin: '18px auto 0', maxWidth: 280 }}>
                <button type="button" className="st-bridge__btn" onClick={() => onAddSection(0)} style={{ justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  <span>أضف أول قسم</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="st-empty">
              <p>{dir === 'rtl' ? 'لا توجد أقسام بعد.' : 'No sections yet.'}</p>
            </div>
          )
        )}
        {visibleSections.map((section, i) => {
          const Comp = SECTIONS[section.type];
          if (!Comp) return null;
          return (
            <EditSlot
              key={section.id}
              section={section}
              index={i}
              count={visibleSections.length}
              editing={editing}
              selected={selectedId === section.id}
              onSelect={onSelectSection}
              onOp={onSectionOp}
              onAdd={onAddSection}
              onImg={onPickImage}
            >
              <Comp key={section.id} props={section.props || {}} {...ctx} />
            </EditSlot>
          );
        })}
        {editing && visibleSections.length > 0 && (
          <EditBridge index={visibleSections.length} onAdd={onAddSection} />
        )}
      </main>

      <footer className="st-footer">
        <div className="st-footer__top">
          <div className="st-footer__brand">
            {logo ? <img src={logo} alt={storeName} /> : <span className="st-nav__mark">{storeName.slice(0, 1)}</span>}
            <strong>{storeName}</strong>
            {tagline && <p>{tagline}</p>}
          </div>
          <nav className="st-footer__links">
            {navItems.map((n) => (
              <a key={n.id} href={`#${n.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(n.id)?.scrollIntoView({ behavior: 'smooth' }); }}>
                {dir === 'rtl' ? n.ar : n.en}
              </a>
            ))}
          </nav>
          <div className="st-footer__contact">
            {settings.whatsapp && <a href={`https://wa.me/${String(settings.whatsapp).replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
            {settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
            {settings.phone && <a href={`tel:${settings.phone}`}>{settings.phone}</a>}
          </div>
        </div>
        <div className="st-footer__bottom">
          <span>© {new Date().getFullYear()} {storeName}</span>
          <span className="st-footer__made">
            {dir === 'rtl' ? 'أُنشئ بواسطة' : 'Made with'}{' '}
            <a href="/" target="_blank" rel="noopener noreferrer">مَورد</a>
          </span>
        </div>
      </footer>
    </div>
  );
}