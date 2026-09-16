import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import ProductCard from '../marketplace/ProductCard';
import './TrendingProducts.css';

const PRODUCTS = [
  {
    id: 1,
    title_ar: 'ساعة ذكية WH22-6 للياقة',
    title_en: 'Smart Watch WH22-6 Fitness',
    price: '454.00',
    badge_ar: 'أفضل بائع',
    badge_en: 'Best Seller',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXrvKmR1dSXcu8Ax3Hfcsks0t4wfM0j5CgHQ0xYdUdqyk3F8fJ3_RsjRiTYu1CEQ57foStABAMcSkKCWPs3cXRBgG0O67eVFj_AHrGxZvTKgWFMjcA2WgqiaOsNTxd6N4ShdqXimTfqfNOGa32nXTmEqTR5aonErrkJg9GsEyauu2yWhse9LXHKLhryQRL908d2PoOTZQg4_KR8ME95w8DgxAqsc39LHW9E8bdz3u7E-TnTJy4UQ',
  },
  {
    id: 2,
    title_ar: 'مضارب تنس للمبتدئين',
    title_en: 'Tennis Rackets for Beginners',
    price: '30.99',
    badge_ar: null,
    badge_en: null,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsI2tUKteVHjY_Mlo9z-0WoFoObbeMR7A9ZI0lVhHrf_CJ0LqMe-jzOrdGxEg0U9q_f839GoX1FW0hPW6ksF0L5xeBF6Idg8-VegGKIfdSV4AOL4ZnTq2E2PLqIWg1E990VUUEpGY7qjk3tQMX5EBCeFub5yWeqUYQWU9tLoLvKfdvIqQohX-uCXjpzIiHfSqTLeZmAcfJczd9sbLszSmyijDHysbFRWvuQzvSoCqyVHErQs57Ag',
  },
  {
    id: 3,
    title_ar: 'هودي تدريب أبيض حراري',
    title_en: 'White Training Hoodie',
    price: '154.99',
    badge_ar: null,
    badge_en: null,
    featured: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA460V_umIuVJMN8Aic4mbtfPKQBTIsg3nXI4Qti7PrxEe4avPrFZtqX2JJ4Wi0meXA42A4gFbkXeqFN5WRM8LmqItn_IBVdrynsle7qx9sMd13vfypd0iHWmcRCN4fOV-KgBgSU_mIsVXrl0TL0Sgd5HbvBumYHC5E7r7xR7MsPrn14HVZeEI1O2MsWZ95bhtq6mWIjmx9XCdHUfd7PiPJLo1pfsIfkQiDbCcc_NJm4uafp0jC6Q',
  },
  {
    id: 4,
    title_ar: 'حذاء رياضي خفيف الوزن',
    title_en: 'Lightweight Running Shoes',
    price: '210.00',
    badge_ar: 'مميز',
    badge_en: 'Featured',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0fONL3jafeS8ZuS9GXHbfbz8lVbUjh0az33sNx-N2KQMU_MqEXu05dSI6EyXMTkzGodgVI2oz0iW1x-uv3b9is7Zf6cvIEJ_oDsrTTBaygTvubVWf6sZrBo7RW_WWK0NfkNBDE1VNlOAwzJ0q_tesTyvwBbj-xWY70FSnwOxHMKrlC-fAq6iSskRkTpSxTsA1IuKjeJRg6Nz4zbSz_JX8RvxV9LE82nGdPPlQL6SGBwH7oWkvoQ',
  },
];

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
        {PRODUCTS.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </motion.div>
    </section>
  );
}