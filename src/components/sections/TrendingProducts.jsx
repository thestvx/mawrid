import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { fetchProducts } from '../../lib/supabase';
import ProductCard from '../marketplace/ProductCard';
import SectionHeading from '../ui/SectionHeading';
import './TrendingProducts.css';

export default function TrendingProducts() {
  const { t, dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const [products, setProducts] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await fetchProducts({ featuredOnly: true, limit: 4 });
      let list = data || [];
      if (!list.length) {
        const recent = await fetchProducts({ limit: 4 });
        list = recent.data || [];
      }
      if (active) {
        setProducts(list.slice(0, 4));
        setReady(true);
      }
    })();
    return () => { active = false; };
  }, []);

  if (!ready || !products.length) return null;

  return (
    <section className="mw-section">
      <div className="mw-container">
        <SectionHeading
          eyebrow={t('trending.eyebrow')}
          title={t('trending.title')}
          subtitle={t('trending.subtitle')}
        />
        <div className="mw-trending__grid">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
        <div className="mw-trending__more">
          <Link to="/marketplace" className="mw-btn mw-btn--secondary mw-btn--md">
            {t('trending.viewAll')}
            <svg className="mw-flip" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
