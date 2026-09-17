import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { subscriptionGroups } from '../../data/subscriptions';
import SplitText from '../ui/SplitText';
import './SubscriptionCards.css';

const groups = subscriptionGroups;

const allIcons = groups.flatMap((g) => g.subs);
const mid = Math.ceil(allIcons.length / 2);
const iconRows = [allIcons.slice(0, mid), allIcons.slice(mid)];

export default function SubscriptionCards() {
  const ref = useRef(null);
  const trackRef = useRef(null);
  const scrollerRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';

  useEffect(() => {
    const track = trackRef.current;
    const scroller = scrollerRef.current;
    if (!track || !scroller) return;

    const ensureCopies = () => {
      const base = track.querySelector('.sub-cards__group');
      if (!base) return 0;
      const viewportW = scroller.clientWidth;
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
    const speed = 40;

    const tick = (now) => {
      if (last == null) last = now;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      offset += speed * dt;
      if (groupW > 0) {
        const position = offset % groupW;
        track.style.transform = `translate3d(${-position}px, 0, 0)`;
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

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    const states = Array.from(section.querySelectorAll('.sub-icons__row')).map((row) => {
      const track = row.querySelector('.sub-icons__track');
      const base = track?.querySelector('.sub-icons__group');
      if (!track || !base) return null;

      const ensureCopies = () => {
        const viewportW = row.clientWidth;
        while (track.scrollWidth - viewportW < base.offsetWidth) {
          const clone = base.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          track.appendChild(clone);
        }
        return base.offsetWidth;
      };

      return { track, groupW: ensureCopies(), offset: 0, ensureCopies, row };
    }).filter(Boolean);

    let raf = null;
    let last = null;

    const tick = (now) => {
      if (last == null) last = now;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      for (const s of states) {
        s.offset += 32 * dt;
        if (s.groupW > 0) {
          s.track.style.transform = `translate3d(${-(s.offset % s.groupW)}px, 0, 0)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      for (const s of states) s.groupW = s.ensureCopies();
    });
    for (const s of states) ro.observe(s.row);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

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
            <SplitText
              text={isRtl ? 'أقسام الاشتراكات' : 'Subscription Categories'}
              tag="h2"
              className="sub-cards__title"
              textAlign={isRtl ? 'right' : 'left'}
              delay={24}
              duration={0.9}
              splitType="chars"
              threshold={0.2}
              from={{ opacity: 0, y: 34 }}
            />
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

      <div className="sub-cards" ref={scrollerRef} aria-label={isRtl ? 'أقسام الاشتراكات' : 'Subscription categories'}>
        <div className="sub-cards__track" ref={trackRef}>
          {[0, 1].map((half) => (
            <div className="sub-cards__group" key={half} aria-hidden={half === 1}>
              {groups.map((g) => (
                <Link to={`/category/${g.key}`} className="sub-card" key={`${half}-${g.key}`}>
                  <img src={g.card} alt={g.title_ar} className="sub-card__img" loading="lazy" />
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="sub-icons" aria-label={isRtl ? 'أيقونات الأقسام الفرعية' : 'Subcategory icons'}>
        {iconRows.map((row, ri) => (
          <div className="sub-icons__row" key={ri}>
            <div className="sub-icons__track">
              {[0, 1].map((half) => (
                <div className="sub-icons__group" key={half} aria-hidden={half === 1}>
                  {row.map((sub) => (
                    <Link
                      to={`/category/${sub.categorySlug}`}
                      className="sub-icon"
                      key={`${ri}-${half}-${sub.key}`}
                    >
                      <img src={sub.icon} alt={sub.title_ar} className="sub-icon__img" loading="lazy" />
                      <span>{isRtl ? sub.title_ar : sub.title_en}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}