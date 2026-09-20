import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useCart } from '../../contexts/CartContext';

function pick(dir, ar, en, fallback = '') {
  const primary = dir === 'rtl' ? ar : en;
  const secondary = dir === 'rtl' ? en : ar;
  return primary || secondary || fallback;
}

function scrollToId(id) {
  if (!id) return;
  const el = document.getElementById(id.replace('#', ''));
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function StoreLink({ href, className, children, onClick, mode = 'public' }) {
  const handle = (e) => {
    if (mode === 'preview') { e.preventDefault(); return; }
    if (href && href.startsWith('#')) {
      e.preventDefault();
      scrollToId(href);
    }
    onClick?.(e);
  };
  if (!href) {
    return <button type="button" className={className} onClick={handle}>{children}</button>;
  }
  if (/^https?:\/\//i.test(href)) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={handle}>{children}</a>;
  }
  if (href.startsWith('#')) {
    return <a href={href} className={className} onClick={handle}>{children}</a>;
  }
  return <Link to={href} className={className} onClick={handle}>{children}</Link>;
}

export function SectionHead({ title, subtitle, align = 'center', dir, action }) {
  if (!title && !subtitle) return null;
  return (
    <div className={`st-head st-head--${align}`}>
      <div>
        {title && <h2 className="st-head__title">{title}</h2>}
        {subtitle && <p className="st-head__sub">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StoreProductCard({ product, dir, showPrice = true, compact = false }) {
  const { add } = useCart();
  const { productPrices, fmtValue } = useCurrency();
  const [added, setAdded] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const name = pick(dir, product.name, product.name_en, product.name);
  const image = product.thumbnail || (Array.isArray(product.images) && product.images[0]) || '';
  const { price, salePrice } = productPrices(product);
  const hasSale = salePrice > 0 && salePrice < price;
  const shown = hasSale ? salePrice : price;

  const handleAdd = (e) => {
    e.preventDefault();
    add(product);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className={`st-card${compact ? ' st-card--compact' : ''}`}>
      <Link to={`/product/${product.id}`} className="st-card__media">
        {image ? (
          <img src={image} alt={name} loading="lazy" />
        ) : (
          <span className="st-card__ph" />
        )}
        {hasSale && <span className="st-card__tag">{dir === 'rtl' ? 'خصم' : 'Sale'}</span>}
        <button
          type="button"
          className={`st-card__add${added ? ' is-added' : ''}`}
          onClick={handleAdd}
          aria-label={dir === 'rtl' ? 'أضف للسلة' : 'Add to cart'}
        >
          {added ? '✓' : '+'}
        </button>
      </Link>
      <div className="st-card__body">
        <Link to={`/product/${product.id}`} className="st-card__name">{name}</Link>
        {showPrice && (
          <div className="st-card__price">
            <span>{fmtValue(shown)}</span>
            {hasSale && <del>{fmtValue(price)}</del>}
          </div>
        )}
      </div>
    </article>
  );
}

function ProductGrid({ products, dir, showPrice, layout }) {
  return (
    <div className={`st-grid st-grid--${layout} st-grid--n${Math.min(products.length, 4)}`}>
      {products.map((p) => <StoreProductCard key={p.id} product={p} dir={dir} showPrice={showPrice} />)}
    </div>
  );
}

export const SECTIONS = {
  hero({ props, dir, mode, theme }) {
    const hasImage = !!props.image;
    const layout = props.layout || 'full';
    const align = props.align || 'center';
    return (
      <section className={`st-hero st-hero--${layout} st-hero--${props.height || 'tall'} st-hero--${align} ${theme.palette === 'noir' ? 'st-hero--dark' : ''}`}>
        {hasImage && layout !== 'split' && (
          <div className="st-hero__bg">
            <img src={props.image} alt="" />
            <span className="st-hero__scrim" style={{ opacity: (props.overlay ?? 48) / 100 }} />
          </div>
        )}
        <div className="st-hero__inner">
          <div className="st-hero__copy">
            {(props.badge_ar || props.badge_en) && (
              <span className="st-hero__badge">{pick(dir, props.badge_ar, props.badge_en)}</span>
            )}
            {(props.eyebrow_ar || props.eyebrow_en) && (
              <span className="st-hero__eyebrow">{pick(dir, props.eyebrow_ar, props.eyebrow_en)}</span>
            )}
            <h1 className="st-hero__title">{pick(dir, props.title_ar, props.title_en)}</h1>
            {(props.subtitle_ar || props.subtitle_en) && (
              <p className="st-hero__sub">{pick(dir, props.subtitle_ar, props.subtitle_en)}</p>
            )}
            <div className="st-hero__actions">
              {pick(dir, props.cta1Label_ar, props.cta1Label_en) && (
                <StoreLink href={props.cta1Href} mode={mode} className="st-btn st-btn--primary">
                  {pick(dir, props.cta1Label_ar, props.cta1Label_en)}
                </StoreLink>
              )}
              {pick(dir, props.cta2Label_ar, props.cta2Label_en) && (
                <StoreLink href={props.cta2Href} mode={mode} className="st-btn st-btn--ghost">
                  {pick(dir, props.cta2Label_ar, props.cta2Label_en)}
                </StoreLink>
              )}
            </div>
          </div>
          {layout === 'split' && (
            <div className="st-hero__media">
              {hasImage ? <img src={props.image} alt="" /> : <span className="st-hero__ph" />}
            </div>
          )}
        </div>
      </section>
    );
  },

  marquee({ props, dir }) {
    const text = pick(dir, props.text_ar, props.text_en) || props.text_en || props.text_ar || '';
    const items = Array.from({ length: 8 });
    return (
      <section className="st-marquee" style={{ '--st-marquee-speed': `${props.speed || 26}s` }}>
        <div className="st-marquee__track">
          {items.map((_, i) => <span key={i}>{text}<i>✦</i></span>)}
        </div>
      </section>
    );
  },

  featured({ props, dir, mode, products, activeCategory }) {
    const source = props.source === 'all' ? products : products.filter((p) => p.featured);
    const base = source.length ? source : products;
    const filtered = activeCategory
      ? base.filter((p) => String(p.category_id) === String(activeCategory) || p.category_name === activeCategory)
      : base;
    const list = filtered.slice(0, props.limit || 8);
    if (!list.length) return null;
    return (
      <section className="st-section" id="products">
        <SectionHead
          title={pick(dir, props.title_ar, props.title_en)}
          subtitle={pick(dir, props.subtitle_ar, props.subtitle_en)}
          align="center"
          dir={dir}
        />
        {props.layout === 'carousel' ? (
          <div className="st-scroller">
            {list.map((p) => <StoreProductCard key={p.id} product={p} dir={dir} showPrice={props.showPrice} compact />)}
          </div>
        ) : (
          <ProductGrid products={list} dir={dir} showPrice={props.showPrice !== false} layout={props.layout === 'editorial' ? 'editorial' : 'grid'} />
        )}
      </section>
    );
  },

  categories({ props, dir, mode, categories, onSelectCategory, activeCategory }) {
    const list = (categories || []).slice(0, props.limit || 8);
    if (!list.length) return null;
    return (
      <section className="st-section st-section--soft" id="categories">
        <SectionHead title={pick(dir, props.title_ar, props.title_en)} dir={dir} align="center" />
        <div className={`st-cats st-cats--${props.layout || 'cards'}`}>
          {list.map((cat) => (
            <button
              key={cat.id || cat.name}
              type="button"
              className={`st-cat${activeCategory && (activeCategory === cat.id || activeCategory === cat.name) ? ' is-active' : ''}`}
              onClick={() => { onSelectCategory?.(cat); scrollToId('products'); }}
            >
              {cat.image && <img src={cat.image} alt="" />}
              <span>{pick(dir, cat.name, cat.name_en, cat.name)}</span>
              {cat.count != null && <em>{cat.count}</em>}
            </button>
          ))}
        </div>
      </section>
    );
  },

  lookbook({ props, dir }) {
    const images = (props.images || []).filter((i) => i.url);
    if (!images.length) return null;
    return (
      <section className="st-section">
        <SectionHead
          title={pick(dir, props.title_ar, props.title_en)}
          subtitle={pick(dir, props.subtitle_ar, props.subtitle_en)}
          dir={dir}
          align="center"
        />
        <div className={`st-look st-look--c${props.columns || 3}`}>
          {images.map((im, i) => (
            <figure key={i} className={`st-look__item${i % 5 === 0 ? ' st-look__item--wide' : ''}`}>
              <img src={im.url} alt={pick(dir, im.caption_ar, im.caption_en)} loading="lazy" />
              {(im.caption_ar || im.caption_en) && (
                <figcaption>{pick(dir, im.caption_ar, im.caption_en)}</figcaption>
              )}
            </figure>
          ))}
        </div>
      </section>
    );
  },

  about({ props, dir }) {
    const bullets = (props.bullets || []).filter((b) => b.text_ar || b.text_en);
    return (
      <section className="st-section st-about" id="about">
        <div className="st-about__media">
          {props.image ? <img src={props.image} alt="" loading="lazy" /> : <span className="st-hero__ph" />}
        </div>
        <div className="st-about__copy">
          <h2 className="st-head__title">{pick(dir, props.title_ar, props.title_en)}</h2>
          {(props.text_ar || props.text_en) && (
            <p className="st-about__text">{pick(dir, props.text_ar, props.text_en)}</p>
          )}
          {bullets.length > 0 && (
            <ul className="st-about__list">
              {bullets.map((b, i) => <li key={i}><i>✓</i>{pick(dir, b.text_ar, b.text_en)}</li>)}
            </ul>
          )}
          {props.signature && <span className="st-about__sign">{props.signature}</span>}
        </div>
      </section>
    );
  },

  stats({ props, dir }) {
    const items = (props.items || []).filter((i) => i.value || i.label_ar || i.label_en);
    if (!items.length) return null;
    return (
      <section className="st-section st-stats">
        {pick(dir, props.title_ar, props.title_en) && (
          <SectionHead title={pick(dir, props.title_ar, props.title_en)} dir={dir} align="center" />
        )}
        <div className="st-stats__grid">
          {items.map((it, i) => (
            <div key={i} className="st-stats__item">
              <strong>{it.value}</strong>
              <span>{pick(dir, it.label_ar, it.label_en)}</span>
            </div>
          ))}
        </div>
      </section>
    );
  },

  testimonials({ props, dir }) {
    const items = (props.items || []).filter((i) => i.text_ar || i.text_en || i.name);
    if (!items.length) return null;
    return (
      <section className="st-section st-section--soft">
        <SectionHead title={pick(dir, props.title_ar, props.title_en)} dir={dir} align="center" />
        <div className="st-quotes">
          {items.map((it, i) => (
            <blockquote key={i} className="st-quote">
              <span className="st-quote__mark">❝</span>
              <p>{pick(dir, it.text_ar, it.text_en)}</p>
              <footer>
                {it.avatar && <img src={it.avatar} alt="" />}
                <div>
                  <strong>{it.name}</strong>
                  {(it.role_ar || it.role_en) && <span>{pick(dir, it.role_ar, it.role_en)}</span>}
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>
    );
  },

  faq({ props, dir }) {
    const items = (props.items || []).filter((i) => i.q_ar || i.q_en);
    if (!items.length) return null;
    return (
      <section className="st-section st-faq">
        <SectionHead title={pick(dir, props.title_ar, props.title_en)} dir={dir} align="center" />
        <div className="st-faq__list">
          {items.map((it, i) => (
            <details key={i} className="st-faq__item">
              <summary>{pick(dir, it.q_ar, it.q_en)}</summary>
              <p>{pick(dir, it.a_ar, it.a_en)}</p>
            </details>
          ))}
        </div>
      </section>
    );
  },

  richtext({ props, dir }) {
    if (!props.text_ar && !props.text_en && !props.title_ar && !props.title_en) return null;
    const paragraphs = pick(dir, props.text_ar, props.text_en).split('\n').filter(Boolean);
    return (
      <section className={`st-section st-rich st-rich--${props.align || 'start'}`}>
        {pick(dir, props.title_ar, props.title_en) && (
          <h2 className="st-head__title">{pick(dir, props.title_ar, props.title_en)}</h2>
        )}
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </section>
    );
  },

  cta({ props, dir, mode }) {
    return (
      <section className={`st-section st-cta${props.tint ? ' st-cta--tint' : ''}`}>
        {props.image && <span className="st-cta__bg" style={{ backgroundImage: `url(${props.image})` }} />}
        <div className="st-cta__inner">
          <h2 className="st-head__title">{pick(dir, props.title_ar, props.title_en)}</h2>
          {(props.text_ar || props.text_en) && <p>{pick(dir, props.text_ar, props.text_en)}</p>}
          {pick(dir, props.button_ar, props.button_en) && (
            <StoreLink href={props.href || '#contact'} mode={mode} className="st-btn st-btn--primary">
              {pick(dir, props.button_ar, props.button_en)}
            </StoreLink>
          )}
        </div>
      </section>
    );
  },

  video({ props, dir }) {
    if (!props.url) return null;
    const isFile = /\.(mp4|webm|ogg)$/i.test(props.url);
    const yt = props.url.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
    return (
      <section className="st-section st-video">
        {pick(dir, props.title_ar, props.title_en) && (
          <SectionHead title={pick(dir, props.title_ar, props.title_en)} dir={dir} align="center" />
        )}
        <div className="st-video__frame">
          {isFile ? (
            <video src={props.url} controls poster={props.poster || undefined} playsInline />
          ) : yt ? (
            <iframe
              src={`https://www.youtube.com/embed/${yt[1]}`}
              title="video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <iframe src={props.url} title="video" allowFullScreen />
          )}
        </div>
        {(props.caption_ar || props.caption_en) && (
          <p className="st-video__cap">{pick(dir, props.caption_ar, props.caption_en)}</p>
        )}
      </section>
    );
  },

  contact({ props, dir, settings }) {
    const rows = [];
    if (props.showWhatsapp !== false && settings.whatsapp) rows.push({ icon: '💬', label: 'WhatsApp', value: settings.whatsapp, href: `https://wa.me/${String(settings.whatsapp).replace(/[^\d]/g, '')}` });
    if (props.showEmail !== false && settings.email) rows.push({ icon: '✉', label: dir === 'rtl' ? 'البريد' : 'Email', value: settings.email, href: `mailto:${settings.email}` });
    if (props.showPhone !== false && settings.phone) rows.push({ icon: '☎', label: dir === 'rtl' ? 'الهاتف' : 'Phone', value: settings.phone, href: `tel:${settings.phone}` });
    if (props.showAddress !== false && settings.address) rows.push({ icon: '⌖', label: dir === 'rtl' ? 'العنوان' : 'Address', value: settings.address });
    if (props.showHours !== false && settings.hours) rows.push({ icon: '⏱', label: dir === 'rtl' ? 'ساعات العمل' : 'Hours', value: settings.hours });
    return (
      <section className="st-section st-contact" id="contact">
        <div className="st-contact__intro">
          <h2 className="st-head__title">{pick(dir, props.title_ar, props.title_en)}</h2>
          {(props.text_ar || props.text_en) && <p>{pick(dir, props.text_ar, props.text_en)}</p>}
        </div>
        {rows.length > 0 && (
          <div className="st-contact__rows">
            {rows.map((r, i) => (
              <div key={i} className="st-contact__row">
                <span className="st-contact__ico">{r.icon}</span>
                <div>
                  <span>{r.label}</span>
                  {r.href ? <a href={r.href} target="_blank" rel="noopener noreferrer">{r.value}</a> : <strong>{r.value}</strong>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  },
};
