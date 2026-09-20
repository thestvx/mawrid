import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
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

export default function StoreRenderer({ store, seller, products = [], categories, dir, mode = 'public' }) {
  const { t } = useLanguage();
  const { count } = useCart();
  const [activeCategory, setActiveCategory] = useState(null);

  const theme = store?.theme || {};
  const settings = store?.settings || {};
  const sections = (store?.sections || []).filter((s) => s.visible !== false);
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
        {sections.length === 0 && (
          <div className="st-empty">
            <p>{dir === 'rtl' ? 'لا توجد أقسام بعد.' : 'No sections yet.'}</p>
          </div>
        )}
        {sections.map((section) => {
          const Comp = SECTIONS[section.type];
          if (!Comp) return null;
          return <Comp key={section.id} props={section.props || {}} {...ctx} />;
        })}
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
