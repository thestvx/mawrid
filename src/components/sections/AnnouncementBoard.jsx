import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Countdown from '../ui/Countdown';
import { useLanguage } from '../../contexts/LanguageContext';
import './AnnouncementBoard.css';

const EASE = [0.16, 1, 0.3, 1];

const PACKS = [
  { id: 1, key: 'board.pack1', icon: '🚀', hours: 14, featured: false, isNew: true },
  { id: 2, key: 'board.pack2', icon: '⚡', hours: 38, featured: true, isNew: false },
  { id: 3, key: 'board.pack3', icon: '💼', hours: 26, featured: false, isNew: false },
];

function PackCard({ pack, t }) {
  const label = (suffix) => t(`${pack.key}.${suffix}`);
  const features = [1, 2, 3].map((i) => label(`f${i}`));

  return (
    <motion.article
      className={`board__card ${pack.featured ? 'board__card--featured' : ''}`}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
      {pack.featured && (
        <span className="board__card-ribbon">🔥 {t('board.popular')}</span>
      )}
      {pack.isNew && !pack.featured && (
        <span className="board__card-new">✨ {label('new')}</span>
      )}

      <div className="board__card-glow" />

      <header className="board__card-head">
        <span className="board__card-icon">{pack.icon}</span>
        <span className="board__card-tag">{label('tag')}</span>
      </header>

      <h3 className="board__card-name">{label('name')}</h3>
      <p className="board__card-desc">{label('desc')}</p>

      <div className="board__card-price">
        <span className="board__card-price-cur">
          {label('price')} <small>{t('board.currency')}</small>
        </span>
        <span className="board__card-price-old">
          {label('old')} {t('board.currency')}
        </span>
        <span className="board__card-price-per">{t('board.per')}</span>
      </div>

      <ul className="board__card-features">
        {features.map((feature, i) => (
          <li key={i}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <div className="board__card-foot">
        <span className="board__card-count-label">{t('board.endsIn')}</span>
        <Countdown
          size="sm"
          dark
          labels={{
            days: t('board.days'),
            hours: t('board.hours'),
            minutes: t('board.mins'),
            seconds: t('board.secs'),
          }}
        />
        <span className="board__card-limited">⏳ {t('board.limited')}</span>
        <Link
          to="/marketplace"
          className={`board__card-cta ${pack.featured ? 'board__card-cta--solid' : ''}`}
        >
          {t('board.cta')}
        </Link>
      </div>
    </motion.article>
  );
}

export default function AnnouncementBoard() {
  const { t } = useLanguage();

  return (
    <section className="board">
      <div className="board__bg-grid" />
      <div className="board__orb board__orb--1" />
      <div className="board__orb board__orb--2" />

      <div className="container board__inner">
        <motion.header
          className="board__head"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="board__badge">{t('board.badge')}</span>
          <h2 className="board__title">{t('board.title')}</h2>
          <p className="board__subtitle">{t('board.subtitle')}</p>
        </motion.header>

        <div className="board__grid">
          {PACKS.map((pack, i) => (
            <motion.div
              key={pack.id}
              className="board__card-wrap"
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.15 + i * 0.12 }}
            >
              <PackCard pack={pack} t={t} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}