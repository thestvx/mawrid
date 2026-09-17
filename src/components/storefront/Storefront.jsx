import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { fetchCategories, fetchProducts } from '../../lib/supabase';
import AnimatedContent from '../ui/AnimatedContent';
import './Storefront.css';

export default function Storefront() {
  const { dir } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState(new Set());

  const isRtl = dir === 'rtl';

  useEffect(() => {
    fetchCategories().then(({ data }) => setCategories(data || []));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchProducts({ categorySlug: activeCategory === 'all' ? undefined : activeCategory })
      .then(({ data }) => {
        if (active) {
          setProducts(data || []);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [activeCategory]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      document.querySelectorAll('.interactive-glow').forEach(card => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = products.filter((p) => {
    if (activeTab === 'featured' && !p.featured) return false;
    if (activeTab === 'new') return false;
    return true;
  });

  const visible = [...filtered];
  if (sortBy === 'price-low') visible.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  else if (sortBy === 'price-high') visible.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  else visible.sort((a, b) => Number(b.created_at ? Date.parse(b.created_at) : 0) - Number(a.created_at ? Date.parse(a.created_at) : 0));

  const catLabel = (c) => (isRtl ? c.name : c.name_en || c.name);

  return (
    <div className="storefront">
      {/* Hero Section */}
      <section className="storefront__hero">
        <div className="storefront__banner">
          <img src="/images/stitch/storefront-banner.jpg" alt="" className="storefront__banner-img" />
          <div className="storefront__banner-overlay" />
        </div>

        {/* Profile Card */}
        <div className="storefront__profile-wrap">
          <AnimatedContent distance={40} delay={0.1}>
            <div className="storefront__profile glass-card interactive-glow">
              <div className="shimmer-bg" />
              <div className="storefront__avatar-wrap">
                <img src="/images/stitch/vendor-avatar.jpg" alt="Vendor" className="storefront__avatar" />
                <span className="storefront__verified">✓</span>
              </div>
              <div className="storefront__info">
                <div className="storefront__info-header">
                  <div>
                    <h1 className="storefront__vendor-name">{isRtl ? 'ستوديو إبداع X' : 'Creative Studio X'}</h1>
                    <p className="storefront__vendor-desc">
                      {isRtl ? 'أدوات تصميم واجهات متميزة وأصول رقمية للمصممين والمطورين المحترفين حول العالم.' : 'Premium UI design tools and digital assets for professional designers and developers worldwide.'}
                    </p>
                    <div className="storefront__vendor-meta">
                      <span className="storefront__meta-item">
                        <span className="material-symbols-outlined">location_on</span>
                        {isRtl ? 'الولايات المتحدة' : 'United States'}
                      </span>
                      <span className="storefront__meta-item">
                        <span className="material-symbols-outlined">inventory_2</span>
                        {loading ? '' : `${products.length} ${isRtl ? 'منتج' : 'Products'}`}
                      </span>
                    </div>
                  </div>
                  <div className="storefront__actions">
                    <button className="storefront__btn storefront__btn--follow">
                      <span className="material-symbols-outlined">add</span>
                      {isRtl ? 'متابعة' : 'Follow'}
                    </button>
                    <button className="storefront__btn storefront__btn--contact">
                      <span className="material-symbols-outlined">mail</span>
                      {isRtl ? 'تواصل' : 'Contact'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedContent>
        </div>
      </section>

      {/* Main Content */}
      <div className="storefront__main container">
        {/* Sidebar */}
        <AnimatedContent distance={30} delay={0.2} direction="horizontal" reverse={isRtl}>
          <aside className="storefront__sidebar">
            <div className="storefront__sidebar-inner">
              <h2 className="storefront__sidebar-title">{isRtl ? 'التصنيفات' : 'Categories'}</h2>
              <nav className="storefront__categories">
                <button
                  className={`storefront__category ${activeCategory === 'all' ? 'storefront__category--active' : ''}`}
                  onClick={() => setActiveCategory('all')}
                >
                  <span className="material-symbols-outlined">grid_view</span>
                  {isRtl ? 'كل المنتجات' : 'All Products'}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`storefront__category ${activeCategory === cat.slug ? 'storefront__category--active' : ''}`}
                    onClick={() => setActiveCategory(activeCategory === cat.slug ? 'all' : cat.slug)}
                  >
                    <span className="material-symbols-outlined">{cat.icon || 'category'}</span>
                    {catLabel(cat)}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        </AnimatedContent>

        {/* Product Feed */}
        <div className="storefront__feed">
          {/* Tabs */}
          <AnimatedContent distance={30} delay={0.3}>
            <div className="storefront__feed-header">
              <div className="storefront__tabs">
                {['all', 'featured'].map((tab) => (
                  <button
                    key={tab}
                    className={`storefront__tab ${activeTab === tab ? 'storefront__tab--active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'all' ? (isRtl ? 'كل المنتجات' : 'All products') : (isRtl ? 'المميزة' : 'Featured')}
                  </button>
                ))}
              </div>
              <div className="storefront__sort">
                <span className="storefront__sort-label">{isRtl ? 'ترتيب حسب:' : 'Sort by:'}</span>
                <select className="storefront__sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="popular">{isRtl ? 'الأحدث' : 'Newest'}</option>
                  <option value="price-low">{isRtl ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                  <option value="price-high">{isRtl ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
                </select>
              </div>
            </div>
          </AnimatedContent>

          {/* Product Grid */}
          <div className="storefront__grid">
            {loading ? (
              <div className="storefront__empty">{isRtl ? 'جارٍ التحميل...' : 'Loading...'}</div>
            ) : visible.length === 0 ? (
              <div className="storefront__empty">
                <p>{isRtl ? 'لا توجد منتجات في هذا القسم حالياً' : 'No products in this category yet.'}</p>
              </div>
            ) : (
              visible.map((product, i) => {
                const title = isRtl ? product.name : product.name_en || product.name;
                const image = product.thumbnail || (Array.isArray(product.images) ? product.images[0] : '') || '';
                const price = Number(product.sale_price > 0 && product.sale_price < product.price ? product.sale_price : product.price || 0);
                return (
                  <AnimatedContent key={product.id} distance={50} delay={0.1 * (i + 1)}>
                    <div className="storefront__product-card interactive-glow">
                      {product.featured && (
                        <span className="storefront__product-badge">{isRtl ? 'مميز' : 'Featured'}</span>
                      )}
                      <button
                        className={`storefront__fav-btn ${favorites.has(product.id) ? 'storefront__fav-btn--active' : ''}`}
                        onClick={() => toggleFavorite(product.id)}
                      >
                        <span className="material-symbols-outlined">
                          {favorites.has(product.id) ? 'favorite' : 'favorite_border'}
                        </span>
                      </button>
                      <Link to={`/product/${product.id}`} className="storefront__prod-link">
                        <div className="storefront__product-image">
                          {image ? <img src={image} alt={title} /> : <span className="material-symbols-outlined">inventory_2</span>}
                        </div>
                        <div className="storefront__product-body">
                          <h3 className="storefront__product-title">{title}</h3>
                          <p className="storefront__product-desc">
                            {(isRtl ? product.name : product.name_en || product.name)}
                          </p>
                          <div className="storefront__product-footer">
                            <span className="storefront__product-price">${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            <span className="storefront__cart-btn">
                              <span className="material-symbols-outlined">add_shopping_cart</span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </AnimatedContent>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}