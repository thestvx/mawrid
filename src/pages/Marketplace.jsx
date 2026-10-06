import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchCategories, fetchProducts } from '../lib/supabase';
import ProductCard from '../components/marketplace/ProductCard';
import SectionHeading from '../components/ui/SectionHeading';
import Button from '../components/ui/Button';
import './Marketplace.css';

const PAGE_SIZE = 12;

const RATING_OPTIONS = [
  { value: 0, label: 'marketplace.allRatings' },
  { value: 4, label: 'marketplace.rating4' },
  { value: 3, label: 'marketplace.rating3' },
];

export default function Marketplace() {
  const { t, dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const [searchParams] = useSearchParams();
  const activeSlug = searchParams.get('cat') || '';
  const queryParam = searchParams.get('q') || '';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(queryParam);
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setSearch(queryParam);
  }, [queryParam]);

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
      list = list.filter(
        (p) => (p.name || '').toLowerCase().includes(q) || (p.name_en || '').toLowerCase().includes(q)
      );
    }
    const lo = parseFloat(minPrice);
    const hi = parseFloat(maxPrice);
    if (!Number.isNaN(lo)) list = list.filter((p) => Number(p.sale_price > 0 ? p.sale_price : p.price) >= lo);
    if (!Number.isNaN(hi)) list = list.filter((p) => Number(p.sale_price > 0 ? p.sale_price : p.price) <= hi);
    if (minRating > 0) list = list.filter((p) => (Number(p.rating) || 0) >= minRating);

    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    else if (sort === 'price-desc') sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    else if (sort === 'popular') sorted.sort((a, b) => Number(b.sales || 0) - Number(a.sales || 0));
    return sorted;
  }, [products, search, sort, minPrice, maxPrice, minRating]);

  const activeCat = categories.find((c) => c.slug === activeSlug);
  const title = activeCat
    ? (isRtl ? activeCat.name : activeCat.name_en || activeCat.name)
    : t('marketplace.title');

  const resetFilters = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating(0);
    setSort('newest');
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="mw mw-marketplace">
      <div className="mw-container">
        <div className="mw-marketplace__head">
          <SectionHeading align="start" title={title} subtitle={t('marketplace.subtitle')} />
          {!loading && (
            <span className="mw-marketplace__count">
              {filtered.length} {t('marketplace.items')}
            </span>
          )}
        </div>

        <div className="mw-marketplace__layout">
          <aside className="mw-marketplace__sidebar" aria-label={t('marketplace.filters')}>
            <div className="mw-card mw-marketplace__panel">
              <h3 className="mw-marketplace__panel-title">{t('marketplace.filters')}</h3>

              <div className="mw-marketplace__field">
                <input
                  type="search"
                  className="mw-search"
                  placeholder={t('marketplace.search')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label={t('marketplace.search')}
                />
              </div>

              <div className="mw-marketplace__group">
                <h4>{t('marketplace.allCategories')}</h4>
                <nav className="mw-marketplace__cats">
                  <Link
                    to="/marketplace"
                    className={`mw-marketplace__cat${!activeSlug ? ' mw-marketplace__cat--active' : ''}`}
                  >
                    {t('marketplace.allCategories')}
                  </Link>
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      to={`/marketplace?cat=${encodeURIComponent(c.slug)}`}
                      className={`mw-marketplace__cat${c.slug === activeSlug ? ' mw-marketplace__cat--active' : ''}`}
                    >
                      {isRtl ? c.name : c.name_en || c.name}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="mw-marketplace__group">
                <h4>{t('marketplace.priceRange')}</h4>
                <div className="mw-marketplace__prices">
                  <input
                    type="number"
                    min="0"
                    className="mw-input"
                    placeholder={t('marketplace.minPrice')}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    aria-label={t('marketplace.minPrice')}
                  />
                  <span className="mw-marketplace__dash">–</span>
                  <input
                    type="number"
                    min="0"
                    className="mw-input"
                    placeholder={t('marketplace.maxPrice')}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    aria-label={t('marketplace.maxPrice')}
                  />
                </div>
              </div>

              <div className="mw-marketplace__group">
                <h4>{t('marketplace.ratings')}</h4>
                <div className="mw-marketplace__ratings">
                  {RATING_OPTIONS.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      className={`mw-marketplace__rating${minRating === r.value ? ' mw-marketplace__rating--active' : ''}`}
                      onClick={() => setMinRating(r.value)}
                    >
                      {t(r.label)}
                    </button>
                  ))}
                </div>
              </div>

              <button type="button" className="mw-btn mw-btn--ghost mw-btn--sm" onClick={resetFilters}>
                {t('marketplace.reset')}
              </button>
            </div>

            <div className="mw-marketplace__promo">
              <h4>{t('marketplace.promoTitle')}</h4>
              <p>{t('marketplace.promoText')}</p>
              <Button to="/auth?mode=signup&role=seller" variant="primary" size="sm">
                {t('marketplace.promoCta')}
              </Button>
            </div>
          </aside>

          <div className="mw-marketplace__main">
            <div className="mw-marketplace__toolbar">
              <label className="mw-marketplace__sort">
                <span>{t('marketplace.sortBy')}</span>
                <select className="mw-input mw-marketplace__sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="newest">{t('marketplace.newest')}</option>
                  <option value="popular">{t('marketplace.popular')}</option>
                  <option value="price-asc">{t('marketplace.priceLow')}</option>
                  <option value="price-desc">{t('marketplace.priceHigh')}</option>
                </select>
              </label>
            </div>

            {loading ? (
              <div className="mw-marketplace__state">{t('marketplace.loading')}</div>
            ) : filtered.length === 0 ? (
              <div className="mw-marketplace__state">
                <p>{t('marketplace.empty')}</p>
                <Button to="/marketplace" variant="secondary" size="sm" onClick={resetFilters}>
                  {t('marketplace.reset')}
                </Button>
              </div>
            ) : (
              <>
                <div className="mw-marketplace__grid">
                  {filtered.slice(0, visibleCount).map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
                {filtered.length > visibleCount && (
                  <div className="mw-marketplace__pagination">
                    <Button variant="secondary" size="md" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                      {t('marketplace.loadMore')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
