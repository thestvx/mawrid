import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCart } from '../contexts/CartContext';
import { fetchCategories, fetchProductById, fetchProducts } from '../lib/supabase';
import ProductCard from '../components/marketplace/ProductCard';
import SectionHeading from '../components/ui/SectionHeading';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import './Details.css';

const TABS = [
  { key: 'description', labelKey: 'details.description' },
  { key: 'specs', labelKey: 'details.specs' },
  { key: 'reviews', labelKey: 'details.reviews' },
];

const GUARANTEES = [
  { key: 'details.guarantee1', icon: 'shield' },
  { key: 'details.guarantee2', icon: 'truck' },
  { key: 'details.guarantee3', icon: 'chat' },
];

function GuaranteeIcon({ name }) {
  const paths = {
    shield: <path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z" />,
    truck: <path d="M5 18H3V5h13v13M16 9h4l3 4v5h-3M7 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0ZM16 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0Z" />,
    chat: <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.38 9 9 0 0 1-3.9-.9L3 20l1.02-5.6A8.38 8.38 0 1 1 21 11.5Z" />,
  };
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function Stars({ rating }) {
  return (
    <span className="mw-details__stars" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

export default function Details() {
  const { id } = useParams();
  const { t, dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const { add, updateQty, items } = useCart();
  const { productPrices, fmtValue } = useCurrency();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [catMap, setCatMap] = useState({});
  const [related, setRelated] = useState([]);
  const [state, setState] = useState('loading');
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState('description');
  const [qty, setQty] = useState(1);
  const [following, setFollowing] = useState(false);

  const productId = product ? product.id : null;
  const categoryId = product ? product.category_id : null;

  useEffect(() => {
    let active = true;
    (async () => {
      setState('loading');
      const { data } = await fetchProductById(id);
      if (!active) return;
      if (!data) { setState('notfound'); return; }
      setProduct(data);
      setActiveImage(0);
      setQty(1);
      setTab('description');
      setState('ready');
    })();
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    let active = true;
    fetchCategories().then(({ data }) => {
      if (!active || !data) return;
      const map = {};
      data.forEach((c) => { map[c.id] = c; });
      setCatMap(map);
      if (map[categoryId]) setCategory(map[categoryId]);
    });
    return () => { active = false; };
  }, [categoryId]);

  useEffect(() => {
    if (!productId) return;
    let active = true;
    (async () => {
      const { data } = await fetchProducts({ categoryId: categoryId || undefined, limit: 12 });
      let list = (data || []).filter((p) => p.id !== productId).slice(0, 4);
      if (list.length < 4) {
        const recent = await fetchProducts({ limit: 12 });
        list = [...list, ...(recent.data || []).filter((p) => p.id !== productId && !list.some((x) => x.id === p.id))].slice(0, 4);
      }
      if (active) setRelated(list);
    })();
    return () => { active = false; };
  }, [productId, categoryId]);

  if (state === 'loading') {
    return (
      <div className="mw mw-details">
        <div className="mw-container mw-details__state">{t('marketplace.loading')}</div>
      </div>
    );
  }

  if (state === 'notfound' || !product) {
    return (
      <div className="mw mw-details">
        <div className="mw-container mw-details__state">
          <h1>{t('details.notFound')}</h1>
          <p>{t('details.notFoundDesc')}</p>
          <Button to="/marketplace" variant="primary">{t('details.backToMarket')}</Button>
        </div>
      </div>
    );
  }

  const cat = category || catMap[product.category_id] || null;
  const title = isRtl ? product.name : product.name_en || product.name;
  const thumbnail = product.thumbnail || (Array.isArray(product.images) ? product.images[0] : '') || '';
  const images = [];
  if (thumbnail) images.push(thumbnail);
  if (Array.isArray(product.images)) {
    product.images.forEach((src) => { if (src && !images.includes(src)) images.push(src); });
  }
  const gallery = images.length ? images : [''];
  const { price, salePrice } = productPrices(product);
  const hasSale = salePrice > 0 && salePrice < price;
  const shownPrice = hasSale ? salePrice : price;
  const rating = Number(product.rating) || 0;
  const idStr = String(product.id);

  const applyQty = () => {
    const existing = items.find((i) => i.id === idStr);
    add(product);
    const target = (existing ? existing.qty : 0) + qty;
    updateQty(idStr, target);
  };

  const handleAddToCart = () => { applyQty(); };
  const handleBuyNow = () => { applyQty(); navigate('/cart'); };

  return (
    <div className="mw mw-details">
      <div className="mw-container">
        <nav className="mw-details__crumbs" aria-label="breadcrumb">
          <Link to="/">{t('details.home')}</Link>
          <span aria-hidden="true">‹</span>
          <Link to="/marketplace">{t('marketplace.title')}</Link>
          {cat && (
            <>
              <span aria-hidden="true">‹</span>
              <Link to={`/marketplace?cat=${encodeURIComponent(cat.slug)}`}>
                {isRtl ? cat.name : cat.name_en || cat.name}
              </Link>
            </>
          )}
          <span aria-hidden="true">‹</span>
          <span className="is-current">{title}</span>
        </nav>

        <div className="mw-details__layout">
          <div className="mw-details__gallery">
            <div className="mw-card mw-details__main">
              {gallery[0]
                ? <img src={gallery[activeImage] || gallery[0]} alt={title} />
                : <div className="mw-details__placeholder" aria-hidden="true" />}
              {hasSale && (
                <span className="mw-details__sale">
                  <Badge tone="hot">-{Math.round((1 - salePrice / price) * 100)}%</Badge>
                </span>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="mw-details__thumbs">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`mw-details__thumb${i === activeImage ? ' mw-details__thumb--active' : ''}`}
                    onClick={() => setActiveImage(i)}
                    aria-label={`${t('details.gallery')} ${i + 1}`}
                  >
                    <img src={src} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mw-details__info">
            <div className="mw-card mw-details__card">
              <div className="mw-details__tags">
                {cat && <Badge tone="soft">{isRtl ? cat.name : cat.name_en || cat.name}</Badge>}
                {product.featured && <Badge tone="hot">{t('details.featured')}</Badge>}
              </div>
              <h1 className="mw-details__title">{title}</h1>

              <div className="mw-details__rating-row">
                {rating > 0 ? (
                  <>
                    <Stars rating={rating} />
                    <b>{rating.toFixed(1)}</b>
                    <span className="mw-details__sold">{product.sales ? `${Number(product.sales).toLocaleString('en-US')} ${t('details.sold')}` : ''}</span>
                  </>
                ) : (
                  <span className="mw-details__sold">{t('details.new')}</span>
                )}
              </div>

              <div className="mw-details__price">
                <span className="mw-details__price-now">{fmtValue(shownPrice)}</span>
                {hasSale && <span className="mw-details__price-old">{fmtValue(price)}</span>}
              </div>

              <div className="mw-details__buy-row">
                <div className="mw-details__stepper" role="group" aria-label={t('details.quantity')}>
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="−">−</button>
                  <span aria-live="polite">{qty}</span>
                  <button type="button" onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="+">+</button>
                </div>
                <Button variant="secondary" size="md" onClick={handleAddToCart} className="mw-details__add">
                  {t('details.addToCart')}
                </Button>
              </div>
              <Button variant="primary" size="md" block onClick={handleBuyNow}>
                {t('details.buyNow')}
              </Button>

              {product.seller_name && (
                <div className="mw-details__seller">
                  <span className="mw-details__seller-avatar" aria-hidden="true">
                    {product.seller_name.slice(0, 1)}
                  </span>
                  <div className="mw-details__seller-id">
                    <strong>{product.seller_name}</strong>
                    <span><Badge tone="verified">{t('details.verifiedSeller')}</Badge></span>
                  </div>
                  <button
                    type="button"
                    className={`mw-btn mw-btn--sm ${following ? 'mw-btn--secondary' : 'mw-btn--primary'}`}
                    onClick={() => setFollowing((v) => !v)}
                    aria-pressed={following}
                  >
                    {following ? t('details.following') : t('details.follow')}
                  </button>
                </div>
              )}

              <div className="mw-details__guarantees">
                {GUARANTEES.map((g) => (
                  <div key={g.key} className="mw-details__guarantee">
                    <span className="mw-details__guarantee-ico"><GuaranteeIcon name={g.icon} /></span>
                    <span>{t(g.key)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mw-card mw-details__tabs-card">
          <div className="mw-details__tabs" role="tablist">
            {TABS.map((tb) => (
              <button
                key={tb.key}
                type="button"
                role="tab"
                aria-selected={tab === tb.key}
                className={`mw-details__tab${tab === tb.key ? ' mw-details__tab--active' : ''}`}
                onClick={() => setTab(tb.key)}
              >
                {t(tb.labelKey)}
              </button>
            ))}
          </div>
          <div className="mw-details__panel">
            {tab === 'description' && (
              <p>{product.description || product.description_en || t('details.noDescription')}</p>
            )}
            {tab === 'specs' && (
              <div className="mw-details__specs">
                {Array.isArray(product.tags) && product.tags.length > 0 ? (
                  <div className="mw-details__tags">
                    {product.tags.map((tag, i) => <Badge key={i} tone="muted">{tag}</Badge>)}
                  </div>
                ) : (
                  <p className="mw-details__muted">{t('details.noSpecs')}</p>
                )}
              </div>
            )}
            {tab === 'reviews' && (
              <div className="mw-details__reviews">
                {rating > 0 ? (
                  <div className="mw-details__rating-summary">
                    <span className="mw-details__rating-big">{rating.toFixed(1)}</span>
                    <Stars rating={rating} />
                  </div>
                ) : (
                  <p className="mw-details__muted">{t('details.noReviews')}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mw-details__related">
            <SectionHeading
              align="start"
              title={t('details.related')}
            />
            <div className="mw-details__related-grid">
              {related.map((item, i) => (
                <ProductCard key={item.id} product={item} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
