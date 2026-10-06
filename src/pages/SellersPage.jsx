import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import SellerCard from '../components/sellers/SellerCard';
import SectionHeading from '../components/ui/SectionHeading';
import { SELLER_SPECIALTIES, mapRealSeller, buildBrandCards } from '../data/sellers';
import { fetchSellers } from '../lib/supabase';
import './SellersPage.css';

export default function SellersPage() {
  const { t, dir } = useLanguage();
  const { specialty } = useParams();
  const isRtl = dir === 'rtl';
  const [realSellers, setRealSellers] = useState([]);

  const activeSpecialty = SELLER_SPECIALTIES.find((s) => s.key === specialty) || null;

  useEffect(() => {
    let activeFlag = true;
    fetchSellers().then((s) => {
      if (!activeFlag) return;
      setRealSellers(s.data || []);
    });
    return () => { activeFlag = false; };
  }, []);

  const demoCards = buildBrandCards();
  const realCards = realSellers.map((u, i) => mapRealSeller(u, i));

  const cards = [...demoCards, ...realCards];
  const filtered = activeSpecialty ? cards.filter((c) => c.specialtyKey === activeSpecialty.key) : cards;
  const specialtyLabel = activeSpecialty ? (isRtl ? activeSpecialty.name_ar : activeSpecialty.name_en) : null;

  return (
    <main className="mw mw-sellers">
      <div className="mw-container">
        <SectionHeading
          eyebrow={t('sellers.eyebrow')}
          title={specialtyLabel || t('sellers.title')}
          subtitle={t('sellers.subtitle')}
        />

        <div className="mw-sellers__pills" role="navigation" aria-label={t('sellers.specialties')}>
          <Link
            to="/sellers"
            className={`mw-sellers__pill${!activeSpecialty ? ' mw-sellers__pill--active' : ''}`}
          >
            {t('sellers.all')}
          </Link>
          {SELLER_SPECIALTIES.map((sp) => (
            <Link
              key={sp.key}
              to={`/sellers/${sp.key}`}
              className={`mw-sellers__pill${activeSpecialty && activeSpecialty.key === sp.key ? ' mw-sellers__pill--active' : ''}`}
            >
              {sp.img && <img src={sp.img} alt="" loading="lazy" />}
              {isRtl ? sp.name_ar : sp.name_en}
            </Link>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="mw-sellers__grid">
            {filtered.map((p) => (
              <SellerCard key={p.id} profile={p} />
            ))}
          </div>
        ) : (
          <div className="mw-sellers__empty">
            <p>{t('sellers.empty')}</p>
            <Link to="/sellers" className="mw-btn mw-btn--secondary mw-btn--md">
              {t('sellers.all')}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
