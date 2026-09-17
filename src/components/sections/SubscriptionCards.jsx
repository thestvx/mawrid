import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { subscriptionGroups } from '../../data/subscriptions';
import './SubscriptionCards.css';

const groups = subscriptionGroups;

export default function SubscriptionCards() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';

  return (
    <section className="sub-cards-section" ref={ref}>
      <div className="container">
        <motion.div
          className="sub-cards__header"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <h2 className="sub-cards__title">{isRtl ? 'أقسام الاشتراكات' : 'Subscription Categories'}</h2>
            <p className="sub-cards__sub">
              {isRtl ? 'تصفح اشتراكات أشهر المنصات العالمية في مكان واحد' : 'Browse subscriptions for the world’s most popular platforms in one place'}
            </p>
          </div>
          <Link to="/marketplace" className="sub-cards__view-all">
            {isRtl ? 'كل المنتجات' : 'All products'}
            <span className="sub-cards__arrow">{isRtl ? '←' : '→'}</span>
          </Link>
        </motion.div>
      </div>

      <div className="sub-cards" aria-label={isRtl ? 'أقسام الاشتراكات' : 'Subscription categories'}>
        <div className="sub-cards__track">
          {[0, 1].map((half) => (
            <div className="sub-cards__group" key={half} aria-hidden={half === 1}>
              {groups.map((g) => (
                <Link to={`/category/${g.key}`} className="sub-card" key={`${half}-${g.key}`}>
                  <img src={g.card} alt="" className="sub-card__bg" loading="lazy" />
                  <div className="sub-card__overlay" />
                  <span className="sub-card__badge">{isRtl ? 'اشتراكات' : 'Subscriptions'}</span>
                  <div className="sub-card__content">
                    <h3 className="sub-card__title">{isRtl ? g.title_ar : g.title_en}</h3>
                    <span className="sub-card__cta">
                      {isRtl ? 'تصفح القسم' : 'Browse'}
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={isRtl ? { transform: 'scaleX(-1)' } : undefined}>
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}