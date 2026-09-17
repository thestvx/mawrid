import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchCategories, fetchProducts } from '../lib/supabase';
import ProductCard from '../components/marketplace/ProductCard';
import AnimatedContent from '../components/ui/AnimatedContent';
import './Marketplace.css';

const PAGE_SIZE = 12;

export default function Marketplace() {
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const [searchParams] = useSearchParams();
  const activeSlug = searchParams.get('cat') || '';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    fetchCategories().then(({ data }) => setCategories(data || []));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setVisibleCount(PAGE_SIZE);
    fetchProducts({ categorySlug: activeSlug || undefined }).then(({ data }) => {
      if (active) {
        setProducts(data || []);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [activeSlug]);

  const filtered = useMemo(() => {
    let list = products;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.name_en || '').toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    else if (sort === 'price-desc') sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    return sorted;
  }, [products, search, sort]);

  const activeCat = categories.find((c) => c.slug === activeSlug);
  const title = activeCat
    ? (isRtl ? activeCat.name : activeCat.name_en || activeCat.name)
    : (isRtl ? 'سوق المنتجات' : 'Marketplace');

  return (
    <div className="marketplace" style={{ paddingTop: '100px' }}>
      <div className="container">
        <div className="marketplace__layout">
          <aside className="marketplace__sidebar">
            <div className="marketplace__sidebar-header">
              <h3>{isRtl ? 'الأقسام' : 'Categories'}</h3>
              <p>{isRtl ? 'تصفح حسب التصنيف' : 'Browse by category'}</p>
            </div>
            <nav className="marketplace__filter-nav">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setVisibleCount(PAGE_SIZE); return true; }}
                className={`marketplace__filter-link ${!activeSlug ? 'marketplace__filter-link--active' : ''}`}
              >
                {isRtl ? 'كل المنتجات' : 'All Categories'}
              </a>
              {categories.map((c) => (
                <a
                  key={c.id}
                  href={`/marketplace?cat=${encodeURIComponent(c.slug)}`}
                  onClick={(e) => { if (c.slug === activeSlug) e.preventDefault(); }}
                  className={`marketplace__filter-link ${c.slug === activeSlug ? 'marketplace__filter-link--active' : ''}`}
                >
                  {isRtl ? c.name : c.name_en || c.name}
                </a>
              ))}
            </nav>

            <div className="marketplace__sidebar-controls">
              <input
                type="search"
                className="marketplace__search"
                placeholder={isRtl ? 'ابحث عن منتج...' : 'Search products...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select className="marketplace__sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">{isRtl ? 'الأحدث' : 'Newest'}</option>
                <option value="price-asc">{isRtl ? 'السعر: الأقل أولاً' : 'Price: Low to High'}</option>
                <option value="price-desc">{isRtl ? 'السعر: الأعلى أولاً' : 'Price: High to Low'}</option>
              </select>
            </div>
          </aside>

          <main className="marketplace__main">
            <div className="marketplace__title-row">
              <h1 className="marketplace__heading">{title}</h1>
              <span className="marketplace__count">
                {loading ? '' : `${filtered.length} ${isRtl ? 'منتج' : 'items'}`}
              </span>
            </div>

            <div className="marketplace__chips">
              {[{ id: 'all', slug: '', name: 'All', name_en: 'All' }, ...categories].map((cat) => {
                const isActive = cat.slug === activeSlug;
                return (
                  <a
                    key={cat.id}
                    href={cat.slug ? `/marketplace?cat=${encodeURIComponent(cat.slug)}` : '/marketplace'}
                    onClick={(e) => { if (isActive) e.preventDefault(); }}
                    className={`marketplace__chip ${isActive ? 'marketplace__chip--active' : ''}`}
                  >
                    {isRtl ? cat.name : cat.name_en || cat.name}
                  </a>
                );
              })}
            </div>

            {loading ? (
              <div className="marketplace__empty">
                {isRtl ? 'جارٍ التحميل...' : 'Loading...'}
              </div>
            ) : filtered.length === 0 ? (
              <div className="marketplace__empty">
                <span className="material-symbols-outlined marketplace__empty-icon">inventory_2</span>
                <p>{isRtl ? 'لا توجد منتجات بعد في هذا القسم' : 'No products here yet.'}</p>
                <a href="/marketplace" className="marketplace__empty-link">
                  {isRtl ? 'عرض كل المنتجات' : 'View all products'}
                </a>
              </div>
            ) : (
              <div className="marketplace__grid">
                {filtered.slice(0, visibleCount).map((product, i) => (
                  <AnimatedContent
                    key={product.id}
                    distance={40}
                    direction="vertical"
                    duration={0.7}
                    threshold={0.1}
                    delay={i * 0.06}
                    className="marketplace__card-wrap"
                  >
                    <ProductCard product={product} index={i} />
                  </AnimatedContent>
                ))}
              </div>
            )}

            {filtered.length > visibleCount && (
              <div className="marketplace__pagination">
                <button
                  className="marketplace__page-btn"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                >
                  {isRtl ? 'عرض المزيد' : 'Load more'}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}