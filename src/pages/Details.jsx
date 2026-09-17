import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchCategories, fetchProductById, fetchProducts } from '../lib/supabase';
import './Details.css';

export default function Details() {
  const { id } = useParams();
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';

  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [catMap, setCatMap] = useState({});
  const [related, setRelated] = useState([]);
  const [state, setState] = useState('loading');
  const [activeImage, setActiveImage] = useState(0);

  const productId = product ? product.id : null;
  const categoryId = product ? product.category_id : null;

  useEffect(() => {
    let active = true;
    (async () => {
      setState('loading');
      const { data } = await fetchProductById(id);
      if (!active) return;
      if (!data) {
        setState('notfound');
        return;
      }
      setProduct(data);
      setActiveImage(0);
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
      <div className="details" style={{ paddingTop: '100px' }}>
        <div className="container details__state">{isRtl ? 'جارٍ التحميل...' : 'Loading...'}</div>
      </div>
    );
  }

  if (state === 'notfound' || !product) {
    return (
      <div className="details" style={{ paddingTop: '100px' }}>
        <div className="container details__state">
          <span className="material-symbols-outlined details__state-icon">search_off</span>
          <h1>{isRtl ? 'المنتج غير موجود' : 'Product not found'}</h1>
          <p>{isRtl ? 'ربما تم حذف المنتج أو أن الرابط غير صحيح.' : 'This product may have been removed or the link is broken.'}</p>
          <Link to="/marketplace" className="btn btn--primary">{isRtl ? 'العودة إلى السوق' : 'Back to Marketplace'}</Link>
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
  const hasSale = Number(product.sale_price) > 0 && Number(product.sale_price) < Number(product.price);
  const shownPrice = hasSale ? product.sale_price : product.price;

  return (
    <div className="details" style={{ paddingTop: '100px' }}>
      <div className="container">
        <nav className="details__breadcrumb">
          <Link to="/">{isRtl ? 'الرئيسية' : 'Home'}</Link>
          <span className="details__breadcrumb-sep">‹</span>
          <Link to="/marketplace">{isRtl ? 'السوق' : 'Marketplace'}</Link>
          {cat && (
            <>
              <span className="details__breadcrumb-sep">‹</span>
              <Link to={`/marketplace?cat=${encodeURIComponent(cat.slug)}`}>
                {isRtl ? cat.name : cat.name_en || cat.name}
              </Link>
            </>
          )}
          <span className="details__breadcrumb-sep">‹</span>
          <span>{title}</span>
        </nav>

        <div className="details__layout">
          <div className="details__gallery">
            <div className="details__main-image">
              {gallery[0] ? (
                <img src={gallery[activeImage] || gallery[0]} alt={title} />
              ) : (
                <div className="details__main-image--placeholder">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
              )}
              <button className="details__fav-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>
            {gallery.length > 1 && (
              <div className="details__thumbs">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    className={`details__thumb ${i === activeImage ? 'details__thumb--active' : ''}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="details__info">
            <div className="details__card">
              {cat && <span className="details__tag">{isRtl ? cat.name : cat.name_en || cat.name}</span>}
              {product.featured && !cat && <span className="details__tag">{isRtl ? 'مميز' : 'Featured'}</span>}
              <h1 className="details__title">{title}</h1>

              {product.seller_name && (
                <div className="details__seller-row">
                  <span className="details__seller-label">{isRtl ? 'البائع:' : 'Seller:'}</span>
                  <span className="details__seller-value">{product.seller_name}</span>
                </div>
              )}

              <div className="details__price">
                <span className="details__price-current">${Number(shownPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                {hasSale && <span className="details__price-old">${Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>}
              </div>

              <div className="details__actions">
                <button className="btn btn--primary details__buy-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  {isRtl ? 'شراء الآن' : 'Buy Now'}
                </button>
                <button className="details__wishlist-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            </div>

            {(product.description || product.notes) && (
              <div className="details__specs">
                <h3>{isRtl ? 'وصف المنتج' : 'About'}</h3>
                <p className="details__desc-text">{isRtl ? product.description : product.description}</p>
              </div>
            )}

            {Array.isArray(product.tags) && product.tags.length > 0 && (
              <div className="details__tags">
                {product.tags.map((tag, i) => (
                  <span key={i} className="details__tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="details__related">
            <div className="details__related-header">
              <h2>{isRtl ? 'منتجات ذات صلة' : 'Related Products'}</h2>
              <Link to={cat ? `/marketplace?cat=${encodeURIComponent(cat.slug)}` : '/marketplace'}>
                {isRtl ? 'عرض الكل' : 'View All'} →
              </Link>
            </div>
            <div className="details__related-grid">
              {related.map((item) => {
                const rThumb = item.thumbnail || (Array.isArray(item.images) ? item.images[0] : '') || '';
                return (
                  <Link key={item.id} to={`/product/${item.id}`} className="details__related-card">
                    <div className="details__related-image">
                      {rThumb ? <img src={rThumb} alt="" loading="lazy" /> : <span className="material-symbols-outlined">inventory_2</span>}
                    </div>
                    <div className="details__related-body">
                      <h3>{isRtl ? item.name : item.name_en || item.name}</h3>
                      <span className="details__related-price">${Number(item.sale_price > 0 && item.sale_price < item.price ? item.sale_price : item.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}