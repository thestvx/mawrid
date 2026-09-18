import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import SplitText from '../components/ui/SplitText';
import { fetchSellers, fetchProducts } from '../lib/supabase';
import './SellersPage.css';

const SELLER_TYPES = [
  { key: 'designers', img: '/sellers/icons/designers.png', name_ar: 'مصممين', name_en: 'Designers' },
  { key: 'editors', img: '/sellers/icons/editors.png', name_ar: 'مونتيرين', name_en: 'Video Editors' },
  { key: 'commentators', img: '/sellers/icons/commentators.png', name_ar: 'معلقين صوتي', name_en: 'Commentators' },
  { key: 'creators', img: '/sellers/icons/creators.png', name_ar: 'صنّاع محتوى', name_en: 'Content Creators' },
  { key: 'developers', img: '/sellers/icons/developers.png', name_ar: 'مبرمجين', name_en: 'Developers' },
  { key: 'brands', img: '/sellers/icons/brands.png', name_ar: 'أصحاب براندات', name_en: 'Brand Owners' },
];

const initials = (name) => (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export default function SellersPage() {
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const scrollerRef = useRef(null);
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([fetchSellers(), fetchProducts({ limit: 500 })]).then(([s, p]) => {
      if (!active) return;
      setSellers(s.data || []);
      setProducts(p.data || []);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const track = scroller.querySelector('.sellers-marquee__track');
    const base = track?.querySelector('.sellers-marquee__group');
    if (!track || !base) return;

    const ensureCopies = () => {
      const viewportW = Math.max(scroller.clientWidth, 1);
      while (track.scrollWidth - viewportW < base.offsetWidth) {
        const clone = base.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      }
      return base.offsetWidth;
    };

    let groupW = ensureCopies();
    let raf = null;
    let last = null;
    let offset = 0;
    const speed = 36;

    const tick = (now) => {
      if (last == null) last = now;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      offset += speed * dt;
      if (groupW > 0) {
        track.style.transform = `translate3d(${offset % groupW}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      groupW = ensureCopies();
    });
    ro.observe(scroller);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const countBySeller = (u) => {
    const byId = products.filter((p) => p.seller_id && p.seller_id === u.firebase_uid).length;
    if (byId > 0) return byId;
    const byName = products.filter((p) => p.seller_name && u.name && p.seller_name === u.name).length;
    return byName;
  };

  return (
    <main className="sellers-page">
      <section className="sellers-hero">
        <div className="sellers-hero__glow" />
        <div className="container sellers-hero__inner">
          <SplitText
            text={isRtl ? 'سوق المورّدين' : 'Sellers Marketplace'}
            tag="h1"
            className="sellers-hero__title"
            textAlign={isRtl ? 'right' : 'left'}
            delay={18}
            duration={0.9}
            splitType="chars"
            threshold={0.2}
            from={{ opacity: 0, y: 34 }}
          />
          <p className="sellers-hero__sub">
            {isRtl
              ? 'تعرف على مورّدينا ومبدعينا، من مصممين ومونتيرين ومعلقين ومبرمجين حتى أصحاب البراندات'
              : 'Meet our suppliers and creators — from designers, editors and commentators to developers and brand owners'}
          </p>
          <div className="sellers-hero__stat">
            <b>{loading ? '…' : sellers.length}</b>
            <span>{isRtl ? 'مورّد معتمد في مَورد' : 'verified suppliers on Mawrid'}</span>
          </div>
        </div>
      </section>

      <div className="sellers-marquee" ref={scrollerRef} aria-label={isRtl ? 'تخصصات المورّدين' : 'Supplier categories'}>
        <div className="sellers-marquee__track">
          <div className="sellers-marquee__group">
            {SELLER_TYPES.map((t) => (
              <div className="seller-tag" key={t.key}>
                <span className="seller-tag__img">
                  <img src={t.img} alt={isRtl ? t.name_ar : t.name_en} loading="lazy" />
                </span>
                <span className="seller-tag__label">{isRtl ? t.name_ar : t.name_en}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container sellers-grid-wrap">
        <motion.div
          className="sellers-grid"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <div className="seller-card seller-card--skeleton" key={i} />)
            : sellers.map((u, i) => (
              <div className="seller-card" key={u.id} style={{ animationDelay: `${i * 45}ms` }}>
                <div className="seller-card__top">
                  <span className="seller-card__avatar">{initials(u.name)}</span>
                  <span className="seller-card__badge">{isRtl ? 'مورّد' : 'Supplier'}</span>
                </div>
                <strong className="seller-card__name">{u.name || (isRtl ? 'بائع' : 'Seller')}</strong>
                {u.store_name && <span className="seller-card__store">{u.store_name}</span>}
                <div className="seller-card__footer">
                  <span className="seller-card__count">
                    {countBySeller(u)} {isRtl ? 'منتج' : 'products'}
                  </span>
                </div>
              </div>
            ))}
        </motion.div>

        {!loading && sellers.length === 0 && (
          <div className="sellers-empty">
            <img src="/sellers/icons/creators.png" alt="" />
            <p>{isRtl ? 'ما عندنا مورّدين مسجلين لحاليًا' : 'No registered suppliers yet'}</p>
          </div>
        )}
      </div>
    </main>
  );
}