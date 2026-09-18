import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { findSub } from '../data/subscriptions';
import { fetchProducts } from '../lib/supabase';
import ProductCard from '../components/marketplace/ProductCard';
import PlanCard from '../components/ui/PlanCard';
import './SubscriptionPages.css';

export default function SubscriptionPage() {
  const { subKey } = useParams();
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const found = findSub(subKey);
  const categorySlug = found ? found.sub.categorySlug : null;

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

  if (!found) {
    return (
      <div className="sub-page" style={{ paddingTop: '110px' }}>
        <div className="container sub-page__state">
          <span className="material-symbols-outlined sub-page__state-icon">search_off</span>
          <h1>{isRtl ? 'القسم الفرعي غير موجود' : 'Sub-section not found'}</h1>
          <Link to="/marketplace" className="btn btn--primary">{isRtl ? 'العودة إلى السوق' : 'Back to Marketplace'}</Link>
        </div>
      </div>
    );
  }

  const { group, sub } = found;
  const groupTitle = isRtl ? group.title_ar : group.title_en;
  const title = isRtl ? sub.title_ar : sub.title_en;

  return (
    <div className="sub-page" style={{ paddingTop: '110px' }}>
      <div className="container">
        <nav className="sub-page__breadcrumb">
          <Link to="/">{isRtl ? 'الصفحة الرئيسية' : 'Home'}</Link>
          <span className="sub-page__crumb-sep">‹</span>
          <Link to={`/category/${group.key}`}>{groupTitle}</Link>
          <span className="sub-page__crumb-sep">‹</span>
          <span>{title}</span>
        </nav>

        <header className="sub-page__mini">
          <span className="sub-page__mini-icon">
            <img src={sub.icon} alt="" />
          </span>
          <div className="sub-page__mini-text">
            <span className="sub-page__mini-tag">{isRtl ? 'اشتراك' : 'Subscription'}</span>
            <h1>{title}</h1>
            <p>{isRtl ? `اشتراكات ${isRtl ? sub.title_ar : sub.title_en} الموثوقة بأسعار مميزة.` : `Trusted ${isRtl ? sub.title_ar : sub.title_en} subscriptions at great prices.`}</p>
          </div>
        </header>

        {sub.plans && sub.plans.length > 0 && (
          <section className="sub-page__block">
            <div className="sub-page__block-header">
              <h2>{isRtl ? 'عروض وبطاقات الاشتراك' : 'Offers & Cards'}</h2>
              <p>{title}</p>
            </div>
            <div className="sub-page__plans">
              {sub.plans.map((src, i) => (
                <PlanCard key={src} sub={sub} src={src} index={i} products={products} />
              ))}
            </div>
          </section>
        )}

        <section className="sub-page__block">
          <div className="sub-page__block-header">
            <h2>{isRtl ? 'منتجات الاشتراك' : 'Subscription products'}</h2>
            <p>{title}</p>
          </div>
          {loading ? (
            <div className="sub-page__empty">{isRtl ? 'جارٍ التحميل...' : 'Loading...'}</div>
          ) : products.length === 0 ? (
            <div className="sub-page__empty">
              <span className="material-symbols-outlined sub-page__empty-icon">inventory_2</span>
              <p>{isRtl ? `لا توجد منتجات متاحة لـ ${title} بعد.` : `No products available for ${isRtl ? sub.title_ar : sub.title_en} yet.`}</p>
              <Link to={`/category/${group.key}`} className="btn btn--outline">
                {isRtl ? 'استكشف أقسام أخرى' : 'Explore other sub-sections'}
              </Link>
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