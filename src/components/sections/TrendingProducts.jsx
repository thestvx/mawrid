import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { fetchProducts } from '../../lib/supabase';
import ProductCard from '../marketplace/ProductCard';
import './TrendingProducts.css';

const headerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

export default function TrendingProducts() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const { t, dir } = useLanguage();
  const [products, setProducts] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await fetchProducts({ featuredOnly: true, limit: 8 });
      let list = data || [];
      if (!list.length) {
        const recent = await fetchProducts({ limit: 8 });
        list = recent.data || [];
      }
      if (active) {
        setProducts(list);
        setReady(true);
      }
    })();
    return () => { active = false; };
  }, []);

  if (!ready || !products.length) return null;

  return (
    <section ref={ref}>
      <motion.div
        className="trending__header"
        variants={headerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <h2 className="trending__title">{t('trending.title')}</h2>
        <Link to="/marketplace" className="trending__view-all">
          {t('trending.viewAll')} <span className="trending__arrow">{dir === 'rtl' ? '←' : '→'}</span>
        </Link>
      </motion.div>
      <motion.div
        className="trending__grid"
        variants={gridVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </motion.div>
    </section>
  );
}