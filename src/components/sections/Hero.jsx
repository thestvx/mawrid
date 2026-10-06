import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { fetchStoreStats } from '../../lib/supabase';
import Button from '../ui/Button';
import './Hero.css';

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="mw-flip" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function Hero() {
  const { t, lang } = useLanguage();
  const isRtl = lang === 'ar';
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState([
    { value: 0, key: 'hero.stat.products' },
    { value: 0, key: 'hero.stat.sellers' },
    { value: 0, key: 'hero.stat.buyers' },
  ]);

  useEffect(() => {
    let active = true;
    fetchStoreStats().then((counts) => {
      if (!active) return;
      setStats([
        { value: counts.products, key: 'hero.stat.products' },
        { value: counts.sellers, key: 'hero.stat.sellers' },
        { value: counts.users, key: 'hero.stat.buyers' },
      ]);
    });
    return () => { active = false; };
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/marketplace?q=${encodeURIComponent(q)}` : '/marketplace');
  };

  const fmt = (n) => (Number(n) || 0).toLocaleString('en-US');

  return (
    <section className="mw-hero">
      <div className="mw-container mw-hero__grid">
        <div className="mw-hero__copy">
          <span className="mw-section-head__eyebrow">{t('hero.badge')}</span>
          <h1 className="mw-hero__title">
            <span className="mw-hero__title-brand">{t('hero.title.mawrid')}</span>
            <br />
            {t('hero.title.line1')}
            <br />
            {t('hero.title.line2')}
          </h1>
          <p className="mw-hero__subtitle">{t('hero.subtitle')}</p>

          <form className="mw-search-wrap mw-hero__search" onSubmit={submitSearch} role="search">
            <span className="mw-search-wrap__icon"><SearchIcon /></span>
            <input
              type="search"
              className="mw-search"
              placeholder={t('hero.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t('hero.searchPlaceholder')}
            />
            <button type="submit" className="mw-btn mw-btn--primary mw-btn--md mw-hero__search-btn">
              {t('hero.cta.shop')}
            </button>
          </form>

          <div className="mw-hero__ctas">
            <Button to="/sellers" variant="secondary" size="md">
              {t('hero.cta.suppliers')}
              <ArrowIcon />
            </Button>
            <Button to="/auth?mode=signup&role=seller" variant="ghost" size="md">
              {t('hero.cta.store')}
            </Button>
          </div>
        </div>

        <div className="mw-hero__visual" aria-hidden="true">
          <div className="mw-hero__blob mw-hero__blob--a" />
          <div className="mw-hero__blob mw-hero__blob--b" />
          <div className="mw-hero__blob mw-hero__blob--c" />
          <div className="mw-hero__card mw-hero__card--1">
            <span className="mw-hero__card-ico">◈</span>
            <div>
              <strong>{t('hero.card.uiKit')}</strong>
              <span>{t('hero.card.uiKitComp')}</span>
            </div>
          </div>
          <div className="mw-hero__card mw-hero__card--2">
            <span className="mw-hero__card-ico">▣</span>
            <div>
              <strong>{t('hero.card.dashboard')}</strong>
              <span>{t('hero.card.dashboardDesc')}</span>
            </div>
          </div>
          <div className="mw-hero__card mw-hero__card--3">
            <span className="mw-hero__card-ico">✦</span>
            <div>
              <strong>{t('hero.card.chatgpt')}</strong>
              <span>{t('hero.card.monthly')}</span>
            </div>
          </div>
          <div className="mw-hero__ring" />
        </div>
      </div>

      <div className="mw-container">
        <div className="mw-hero__stats">
          {stats.map((s, i) => (
            <div className="mw-stat" key={i}>
              <span className="mw-stat__value mw-stat__value--brand">{fmt(s.value)}+</span>
              <span className="mw-stat__label">{t(s.key)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
