import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { fetchCategories } from '../../lib/supabase';
import SectionHeading from '../ui/SectionHeading';
import './Categories.css';

const CARD_TONES = [
  'linear-gradient(135deg, #FF6201, #A53C00)',
  'linear-gradient(135deg, #8589FF, #494BD6)',
  'linear-gradient(135deg, #34D399, #1E7E34)',
  'linear-gradient(135deg, #F59E0B, #B45309)',
  'linear-gradient(135deg, #EC4899, #9D174D)',
];

export default function Categories() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  useEffect(() => {
    let activeFlag = true;
    fetchCategories().then(({ data }) => {
      if (!activeFlag) return;
      const list = (data || []).slice(0, 5);
      setItems(list.map((c) => ({ id: c.id, slug: c.slug, name_ar: c.name, name_en: c.name_en || c.name })));
    });
    return () => { activeFlag = false; };
  }, []);

  if (!items.length) return null;

  const handleSelect = (cat) => {
    navigate(cat.slug ? `/marketplace?cat=${encodeURIComponent(cat.slug)}` : '/marketplace');
  };

  return (
    <section className="mw-section mw-categories">
      <div className="mw-container">
        <SectionHeading
          eyebrow={t('categories.eyebrow')}
          title={t('categories.title')}
          subtitle={t('categories.subtitle')}
        />
        <div className="mw-categories__grid">
          {items.map((cat, i) => (
            <button
              key={cat.id || cat.slug || i}
              type="button"
              className="mw-category-card"
              onClick={() => handleSelect(cat)}
            >
              <span className="mw-category-card__art" style={{ background: CARD_TONES[i % CARD_TONES.length] }} aria-hidden="true">
                <span className="mw-category-card__glyph">
                  {(isRtl ? cat.name_ar : cat.name_en).slice(0, 1)}
                </span>
              </span>
              <span className="mw-category-card__name">
                {isRtl ? cat.name_ar : cat.name_en}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
