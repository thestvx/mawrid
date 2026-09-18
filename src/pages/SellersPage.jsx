import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import SplitText from '../components/ui/SplitText';
import SellerCard from '../components/sellers/SellerCard';
import WorksModal from '../components/sellers/WorksModal';
import { SELLER_SPECIALTIES, SHOWCASE_SELLERS, SHOWCASE_BRANDS } from '../data/sellers';
import { fetchSellers } from '../lib/supabase';
import './SellersPage.css';

const itemVariants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

export default function SellersPage() {
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const scrollerRef = useRef(null);
  const [realSellers, setRealSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

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
              ? 'مورّدون ومبدعون موثّقون — كل واحد في تخصّصه، بأوقات عمل واضحة ومعرض للأعمال. اطلب منه مباشرة.'
              : 'Verified suppliers and creators — each in their craft, with clear working hours and a live portfolio.'}
          </p>
          <div className="sellers-hero__stat">
            <b>{loading ? '…' : realSellers.length}</b>
            <span>{isRtl ? 'مورّد مسجّل في مَورد' : 'registered suppliers on Mawrid'}</span>
          </div>
        </div>
      </section>

      <div className="s-icons" ref={scrollerRef} aria-label={isRtl ? 'تخصصات المورّدين' : 'Supplier categories'}>
        <div className="s-icons__track">
          <div className="s-icons__group">
            {SELLER_SPECIALTIES.map((t) => (
              <div className="s-icon" key={t.key}>
                <span className="s-icon__bubble">
                  <img src={t.img} alt={isRtl ? t.name_ar : t.name_en} loading="lazy" />
                </span>
                <span className="s-icon__label">{isRtl ? t.name_ar : t.name_en}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="sellers-grid-head">
          <SplitText
            text={isRtl ? 'مورّدونا المميّزون' : 'Featured suppliers'}
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
            {isRtl ? 'اضغط "عرض الأعمال" لمعاينة ملفّ العمل، ولأصحاب البراندات لكي تطلب الموديل واللون' : 'Hit "View works" to preview the portfolio — brand owners accept model & color requests'}
          </p>
        </div>

        <motion.div
          className="sellers-grid"
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {cards.map((p, i) => (
            <motion.div key={p.id} variants={itemVariants} style={{ zIndex: i }}>
              <SellerCard profile={p} onOpen={setActive} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {active && <WorksModal profile={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </main>
  );
}