import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { findGroup } from '../data/subscriptions';
import { fetchProducts } from '../lib/supabase';
import ProductCard from '../components/marketplace/ProductCard';
import PlanCard from '../components/ui/PlanCard';
import './SubscriptionPages.css';

export default function SubscriptionGroupPage() {
  const { groupKey } = useParams();
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const group = findGroup(groupKey);

  const [productsBySub, setProductsBySub] = useState({});
  const [groupProducts, setGroupProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentGroup = findGroup(groupKey);
    if (!currentGroup) return;
    let active = true;
    setLoading(true);
    const subs = currentGroup.subs || [];
    const tasks = [];
    if (currentGroup.categorySlug) {
      tasks.push(
        fetchProducts({ categorySlug: currentGroup.categorySlug })
          .then(({ data }) => ({ kind: 'group', data: data || [] }))
          .catch(() => ({ kind: 'group', data: [] }))
      );
    }
    subs.forEach((s) => {
      if (!s.categorySlug) return;
      tasks.push(
        fetchProducts({ categorySlug: s.categorySlug })
          .then(({ data }) => ({ kind: 'sub', key: s.key, data: data || [] }))
          .catch(() => ({ kind: 'sub', key: s.key, data: [] }))
      );
    });
    Promise.all(tasks).then((results) => {
      if (!active) return;
      const map = {};
      let groupData = [];
      results.forEach((r) => {
        if (r.kind === 'group') groupData = r.data;
        else map[r.key] = r.data;
      });
      setGroupProducts(groupData);
      setProductsBySub(map);
      setLoading(false);
    });
    return () => { active = false; };
  }, [groupKey]);

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

  return (
    <div className="sub-page" style={{ paddingTop: '110px' }}>
      <div className="container">
        <nav className="sub-page__breadcrumb">
          <Link to="/">{isRtl ? 'الصفحة الرئيسية' : 'Home'}</Link>
          <span className="sub-page__crumb-sep">‹</span>
          <span>{title}</span>
        </nav>

        <img src={group.line} alt="" className="sub-page__line" loading="lazy" />

        <section className="sub-page__icons-block">
          <div className="sub-page__icons">
            {group.subs.map((sub, i) => (
              <Link to={`/subscription/${sub.key}`} className="sub-icon" key={sub.key} style={{ animationDelay: `${i * 70}ms` }}>
                <span className="sub-icon__img">
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
            <p>{title}</p>
          </div>

          {loading ? (
            <div className="sub-page__empty">{isRtl ? 'جارٍ التحميل...' : 'Loading...'}</div>
          ) : groupProducts.length === 0 && group.subs.every((s) => !s.plans?.length && !(productsBySub[s.key] || []).length) ? (
            <div className="sub-page__empty">
              <span className="material-symbols-outlined sub-page__empty-icon">inventory_2</span>
              <p>{isRtl ? 'لا توجد عروض أو منتجات بعد في هذا القسم.' : 'No offers or products in this section yet.'}</p>
              <Link to="/marketplace" className="btn btn--outline">{isRtl ? 'استكشف السوق' : 'Explore marketplace'}</Link>
            </div>
          ) : (
            <div className="sub-page__group">
              {groupProducts.length > 0 && (
                <div className="sub-page__group-block">
                  <div className="sub-page__grid">
                    {groupProducts.map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} />
                    ))}
                  </div>
                </div>
              )}
              {group.subs.map((sub) => {
                const products = productsBySub[sub.key] || [];
                const hasPlans = sub.plans && sub.plans.length > 0;
                if (!hasPlans && products.length === 0) return null;
                return (
                  <div className="sub-page__group-block" key={sub.key}>
                    <div className="sub-page__group-head">
                      <Link to={`/subscription/${sub.key}`} className="sub-page__group-title">
                        <span className="sub-page__group-icon">
                          <img src={sub.icon} alt="" loading="lazy" />
                        </span>
                        <span>{isRtl ? sub.title_ar : sub.title_en}</span>
                      </Link>
                      {hasPlans && (
                        <Link to={`/subscription/${sub.key}`} className="sub-page__group-link">
                          {isRtl ? 'كل العروض' : 'All offers'}
                        </Link>
                      )}
                    </div>

                    {hasPlans && (
                      <div className="sub-page__plans">
                        {sub.plans.map((src, i) => (
                          <PlanCard key={src} sub={sub} src={src} index={i} products={products} />
                        ))}
                      </div>
                    )}

                    {products.length > 0 && (
                      <div className="sub-page__grid">
                        {products.map((product, i) => (
                          <ProductCard key={product.id} product={product} index={i} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}