import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import SplitText from '../components/ui/SplitText';
import SellerCard from '../components/sellers/SellerCard';
import WorksModal from '../components/sellers/WorksModal';
import { SELLER_SPECIALTIES, SHOWCASE_SELLERS, SHOWCASE_BRANDS } from '../data/sellers';
import { fetchSellers } from '../lib/supabase';
import './SellersPage.css';

const EASE = [0.16, 1, 0.3, 1];

const itemVariants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

function Chevron({ isRtl }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isRtl ? 'scaleX(-1)' : undefined }}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function SellersPage() {
  const { dir } = useLanguage();
  const { specialty } = useParams();
  const isRtl = dir === 'rtl';
  const scrollerRef = useRef(null);
  const [realSellers, setRealSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  const activeSpecialty = SELLER_SPECIALTIES.find((s) => s.key === specialty) || null;

  useEffect(() => {
    let activeFlag = true;
    fetchSellers().then((s) => {
      if (!activeFlag) return;
      setRealSellers(s.data || []);
      setLoading(false);
    });
    return () => { activeFlag = false; };
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const track = scroller.querySelector('.s-icons__track');
    const base = track?.querySelector('.s-icons__group');
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
    const speed = 30;

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

  const realCards = realSellers.map((u, i) => {
    const key = SELLER_SPECIALTIES[i % SELLER_SPECIALTIES.length].key;
    const name = u.name || (isRtl ? 'بائع مَورد' : 'Mawrid seller');
    return {
      id: `real-${u.id}`,
      kind: 'seller',
      specialtyKey: key,
      name,
      name_en: name,
      role_ar: u.store_name ? `متجر ${u.store_name}` : 'مورّد على مَورد',
      role_en: u.store_name || 'Supplier on Mawrid',
      cover: 'linear-gradient(135deg,#ffb199,#a53c00)',
      avatarGradient: 'linear-gradient(135deg,#ff8a3d,#7e2c00)',
      verified: false,
      bio_ar: u.email || '',
      bio_en: u.email || '',
      availability: 'full',
      hours: { from: '09:00', to: '18:00', zone: 'GST' },
      stats: { projects: 0, products: 0, rating: 0 },
      works: [],
    };
  });

  const cards = [...realCards, ...SHOWCASE_SELLERS, ...SHOWCASE_BRANDS];
  const filtered = activeSpecialty ? cards.filter((c) => c.specialtyKey === activeSpecialty.key) : cards;
  const specialtyLabel = activeSpecialty ? (isRtl ? activeSpecialty.name_ar : activeSpecialty.name_en) : null;

  return (
    <main className="sellers-page">
      <section className="hero sellers-hero2">
        <div className="hero__media">
          <img src="/images/backgrounds/herobackground02.png" alt="" className="hero__img" loading="eager" />
          <div className="hero__overlay" />
          <div className="container hero__content">
            <motion.div
              className="sellers-hero__content"
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: EASE }}
            >
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
                  ? 'مورّدون ومبدعون موثّقون — كل واحد في تخصّصه، بأوقات عمل واضحة ومعرض للأعمال. اطلب منه مباشرة.'
                  : 'Verified suppliers and creators — each in their craft, with clear working hours and a live portfolio.'}
              </p>
              <div className="sellers-hero__chips">
                <span className="sellers-hero__chip">
                  <b>{loading ? '…' : realSellers.length}</b>
                  {isRtl ? 'مورّد مسجّل' : 'registered suppliers'}
                </span>
                <span className="sellers-hero__chip">
                  <b>{SELLER_SPECIALTIES.length}</b>
                  {isRtl ? 'تخصّص متاح' : 'specialties'}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="s-icons" ref={scrollerRef} aria-label={isRtl ? 'تخصصات المورّدين' : 'Supplier categories'}>
        <div className="s-icons__track">
          <div className="s-icons__group">
            {SELLER_SPECIALTIES.map((t) => (
              <Link
                to={`/sellers/${t.key}`}
                className={`s-icon${activeSpecialty && activeSpecialty.key === t.key ? ' is-active' : ''}`}
                key={t.key}
              >
                <span className="s-icon__bubble">
                  <img src={t.img} alt={isRtl ? t.name_ar : t.name_en} loading="lazy" />
                </span>
                <span className="s-icon__label">{isRtl ? t.name_ar : t.name_en}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <nav className="sellers-crumbs" aria-label="breadcrumb">
          <Link to="/">{isRtl ? 'الرئيسية' : 'Home'}</Link>
          <Chevron isRtl={isRtl} />
          <Link to="/sellers">{isRtl ? 'سوق المورّدين' : 'Sellers'}</Link>
          {activeSpecialty && (
            <>
              <Chevron isRtl={isRtl} />
              <span className="is-current">{specialtyLabel}</span>
            </>
          )}
        </nav>

        <div className="sellers-grid-head">
          <SplitText
            text={specialtyLabel || (isRtl ? 'مورّدونا المميّزون' : 'Featured suppliers')}
            tag="h2"
            className="sellers-grid__title"
            textAlign={isRtl ? 'right' : 'left'}
            delay={16}
            duration={0.9}
            splitType="chars"
            threshold={0.2}
            from={{ opacity: 0, y: 28 }}
          />
          <p className="sellers-grid__sub">
            {activeSpecialty
              ? (isRtl ? 'تصفح ملفّات العمل واضغط "عرض الأعمال" لمعاينة أعمالهم' : 'Browse profiles and hit "View works" to preview their portfolio')
              : (isRtl ? 'اضغط "عرض الأعمال" لمعاينة ملفّ العمل، ولأصحاب البراندات لكي تطلب الموديل واللون' : 'Hit "View works" to preview the portfolio — brand owners accept model & color requests')}
          </p>
        </div>

        {filtered.length > 0 ? (
          <motion.div
            key={activeSpecialty ? activeSpecialty.key : 'all'}
            className="sellers-grid"
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
            initial="hidden"
            animate="show"
          >
            {filtered.map((p, i) => (
              <motion.div key={p.id} variants={itemVariants} style={{ zIndex: i }}>
                <SellerCard profile={p} onOpen={setActive} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="sellers-empty">
            <img src="/sellers/icons/creators.png" alt="" />
            <p>{isRtl ? 'ما فيه مورّدين في هذا التخصّص حاليًا' : 'No suppliers in this specialty yet'}</p>
            <Link to="/sellers" className="sellers-empty__back">{isRtl ? 'عرض كل المورّدين' : 'View all suppliers'}</Link>
          </div>
        )}
      </div>

      <AnimatePresence>
        {active && <WorksModal profile={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </main>
  );
}