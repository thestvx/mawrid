import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { findGroup } from '../data/subscriptions';
import { fetchProducts } from '../lib/supabase';
import ProductCard from '../components/marketplace/ProductCard';
import './SubscriptionPages.css';

export default function SubscriptionGroupPage() {
  const { groupKey } = useParams();
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const group = findGroup(groupKey);
  const categorySlug = group ? group.categorySlug : null;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categorySlug) return;
    let active = true;
    setLoading(true);
    fetchProducts({ categorySlug }).then(({ data }) => {
      if (active) {
        setProducts(data || []);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [categorySlug]);

  if (!group) {
    return (
      <div className="sub-page" style={{ paddingTop: '110px' }}>
        <div className="container sub-page__state">
          <span className="material-symbols-outlined sub-page__state-icon">search_off</span>
          <h1>{isRtl ? 'القسم غير موجود' : 'Section not found'}</h1>
          <Link to="/" className="btn btn--primary">{isRtl ? 'العودة إلى الرئيسية' : 'Back to Home'}</Link>
        </div>
      </div>
    );
  }

  const title = isRtl ? group.title_ar : group.title_en;
  const subtitle = isRtl ? group.subtitle_ar : group.subtitle_en;

  return (
    <div className="sub-page" style={{ paddingTop: '110px' }}>
      <div className="container">
        <nav className="sub-page__breadcrumb">
          <Link to="/">{isRtl ? 'الصفحة الرئيسية' : 'Home'}</Link>
          <span className="sub-page__crumb-sep">‹</span>
          <span>{title}</span>
        </nav>

        <header className="sub-page__hero"
          style={{ ['--card']: `url(${group.card})` }}
        >
          <div className="sub-page__hero-overlay" />
          <div className="sub-page__hero-content">
            <span className="sub-page__hero-tag">{isRtl ? 'قسم الاشتراكات' : 'Subscription section'}</span>
            <h1 className="sub-page__hero-title">{title}</h1>
            <p className="sub-page__hero-sub">{subtitle}</p>
            <div className="sub-page__hero-meta">
              <span className="sub-page__hero-count">
                {group.subs.length} {isRtl ? 'قسم فرعي' : 'sub-sections'}
              </span>
            </div>
          </div>
        </header>

        <section className="sub-page__block">
          <div className="sub-page__block-header">
            <h2>{isRtl ? 'الأقسام الفرعية' : 'Sub-sections'}</h2>
            <p>{isRtl ? 'اختر المنصة وابدأ التصفح' : 'Pick a platform to start browsing'}</p>
          </div>
          <div className="sub-page__icons">
            {group.subs.map((sub, i) => (
              <Link to={`/subscription/${sub.key}`} className="sub-icon" key={sub.key} style={{ animationDelay: `${i * 60}ms` }}>
                <span className="sub-icon__img-wrap">
                  <img src={sub.icon} alt="" loading="lazy" />
                </span>
                <span className="sub-icon__name">{isRtl ? sub.title_ar : sub.title_en}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="sub-page__block">
          <div className="sub-page__block-header">
            <h2>{isRtl ? 'منتجات القسم' : 'Products in this section'}</h2>
            <p>{isRtl ? title : title}</p>
          </div>
          {loading ? (
            <div className="sub-page__empty">{isRtl ? 'جارٍ التحميل...' : 'Loading...'}</div>
          ) : products.length === 0 ? (
            <div className="sub-page__empty">
              <span className="material-symbols-outlined sub-page__empty-icon">inventory_2</span>
              <p>{isRtl ? 'لا توجد منتجات بعد في هذا القسم.' : 'No products in this section yet.'}</p>
              <Link to="/marketplace" className="btn btn--outline">{isRtl ? 'استكشف السوق' : 'Explore marketplace'}</Link>
            </div>
          ) : (
            <div className="sub-page__grid">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}