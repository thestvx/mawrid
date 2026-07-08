import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import AnimatedContent from '../ui/AnimatedContent';
import './Storefront.css';

const PRODUCTS = [
  { id: 1, name: 'Nexus Pro Dashboard UI Kit', nameAr: 'قالب لوحة تحكم Nexus Pro', desc: 'قالب لوحة تحكم متطور مع أكثر من 100 مكون مصمم بعناية فائقة.', price: 49, rating: 4.9, reviews: 42, badge: 'الأكثر مبيعاً', image: '/images/stitch/product-1.jpg' },
  { id: 2, name: 'Premium 3D Icon Pack', nameAr: 'مجموعة أيقونات ثلاثية الأبعاد', desc: 'مجموعة من 50 أيقونة ثلاثية الأبعاد عالية الجودة لمشروعك القادم.', price: 24, rating: 4.8, reviews: 18, image: '/images/stitch/product-2.jpg' },
  { id: 3, name: 'Wireflow Master Kit', nameAr: 'أدوات تخطيط Wireflow', desc: 'أدوات تخطيط سريعة واحترافية للتطبيقات والمواقع الإلكترونية.', price: 32, rating: 5.0, reviews: 8, image: '/images/stitch/product-3.jpg' },
];

const CATEGORIES = [
  { key: 'all', icon: 'grid_view', label: 'كل المنتجات' },
  { key: 'templates', icon: 'description', label: 'القوالب' },
  { key: 'ui', icon: 'layers', label: 'أدوات الواجهات' },
  { key: 'icons', icon: 'insert_emoticon', label: 'الأيقونات' },
  { key: 'courses', icon: 'play_circle', label: 'الدورات' },
];

export default function Storefront() {
  const { t, dir } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState(new Set());
  const glowRef = useRef(null);

  const isRtl = dir === 'rtl';

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
                        {isRtl ? '١٥٠ منتج' : '150 Products'}
                      </span>
                      <span className="storefront__meta-item">
                        <span className="material-symbols-outlined">shopping_bag</span>
                        {isRtl ? '+١٢ ألف مبيعات' : '+12K Sales'}
                      </span>
                      <span className="storefront__meta-item storefront__meta-item--rating">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        4.9 ({isRtl ? '١٢٤ تقييم' : '124 reviews'})
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
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    className={`storefront__category ${activeCategory === cat.key ? 'storefront__category--active' : ''}`}
                    onClick={() => setActiveCategory(cat.key)}
                  >
                    <span className="material-symbols-outlined">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </nav>

              <div className="storefront__filter-section">
                <h3 className="storefront__filter-title">{isRtl ? 'نطاق السعر' : 'Price Range'}</h3>
                <div className="storefront__price-range">
                  <div className="storefront__range-track">
                    <div className="storefront__range-fill" />
                    <div className="storefront__range-thumb storefront__range-thumb--min" />
                    <div className="storefront__range-thumb storefront__range-thumb--max" />
                  </div>
                  <div className="storefront__range-labels">
                    <span>$0</span>
                    <span>$1000+</span>
                  </div>
                </div>
              </div>

              <div className="storefront__filter-section">
                <h3 className="storefront__filter-title">{isRtl ? 'التقييم' : 'Rating'}</h3>
                <label className="storefront__rating-option">
                  <input type="checkbox" className="storefront__checkbox" />
                  <div className="storefront__stars">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                </label>
                <label className="storefront__rating-option">
                  <input type="checkbox" className="storefront__checkbox" defaultChecked />
                  <div className="storefront__stars">
                    {[1,2,3,4].map(i => (
                      <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                    <span className="material-symbols-outlined storefront__star--empty" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </div>
                  <span className="storefront__rating-label">{isRtl ? 'وأكثر' : '& up'}</span>
                </label>
              </div>
            </div>
          </aside>
        </AnimatedContent>

        {/* Product Feed */}
        <div className="storefront__feed">
          {/* Tabs */}
          <AnimatedContent distance={30} delay={0.3}>
            <div className="storefront__feed-header">
              <div className="storefront__tabs">
                {['all', 'featured', 'new'].map(tab => (
                  <button
                    key={tab}
                    className={`storefront__tab ${activeTab === tab ? 'storefront__tab--active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'all' ? 'كل المنتجات' : tab === 'featured' ? 'المميزة' : 'الأحدث'}
                  </button>
                ))}
              </div>
              <div className="storefront__sort">
                <span className="storefront__sort-label">{isRtl ? 'ترتيب حسب:' : 'Sort by:'}</span>
                <select className="storefront__sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="popular">{isRtl ? 'الأكثر شعبية' : 'Most Popular'}</option>
                  <option value="newest">{isRtl ? 'الأحدث' : 'Newest'}</option>
                  <option value="price-low">{isRtl ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
                </select>
              </div>
            </div>
          </AnimatedContent>

          {/* Product Grid */}
          <div className="storefront__grid">
            {PRODUCTS.map((product, i) => (
              <AnimatedContent key={product.id} distance={50} delay={0.1 * (i + 1)}>
                <div className="storefront__product-card interactive-glow">
                  {product.badge && (
                    <span className="storefront__product-badge">{product.badge}</span>
                  )}
                  <button
                    className={`storefront__fav-btn ${favorites.has(product.id) ? 'storefront__fav-btn--active' : ''}`}
                    onClick={() => toggleFavorite(product.id)}
                  >
                    <span className="material-symbols-outlined">
                      {favorites.has(product.id) ? 'favorite' : 'favorite_border'}
                    </span>
                  </button>
                  <div className="storefront__product-image">
                    <img src={product.image} alt={isRtl ? product.nameAr : product.name} />
                  </div>
                  <div className="storefront__product-body">
                    <div className="storefront__product-rating">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="storefront__rating-value">{product.rating}</span>
                      <span className="storefront__rating-count">({product.reviews})</span>
                    </div>
                    <h3 className="storefront__product-title">{isRtl ? product.nameAr : product.name}</h3>
                    <p className="storefront__product-desc">{isRtl ? product.desc : product.desc}</p>
                    <div className="storefront__product-footer">
                      <span className="storefront__product-price">${product.price.toFixed(2)}</span>
                      <button className="storefront__cart-btn">
                        <span className="material-symbols-outlined">add_shopping_cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedContent>
            ))}
          </div>

          {/* Pagination */}
          <AnimatedContent distance={20} delay={0.5}>
            <div className="storefront__pagination">
              <button className="storefront__page-btn">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <button className="storefront__page-btn storefront__page-btn--active">1</button>
              <button className="storefront__page-btn">2</button>
              <button className="storefront__page-btn">3</button>
              <span className="storefront__page-dots">...</span>
              <button className="storefront__page-btn">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
            </div>
          </AnimatedContent>
        </div>
      </div>
    </div>
  );
}
