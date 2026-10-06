import { useLanguage } from '../../contexts/LanguageContext';
import SectionHeading from '../ui/SectionHeading';
import './WhyMawrid.css';

const FEATURES = [
  {
    key: 'whymawrid.step1',
    descKey: 'whymawrid.step1desc',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    tone: 'brand',
  },
  {
    key: 'whymawrid.step2',
    descKey: 'whymawrid.step2desc',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
    tone: 'indigo',
  },
  {
    key: 'whymawrid.step3',
    descKey: 'whymawrid.step3desc',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    tone: 'green',
  },
];

export default function WhyMawrid() {
  const { t } = useLanguage();

  return (
    <section className="mw-section" id="howitworks">
      <div className="mw-container">
        <SectionHeading
          eyebrow={t('whymawrid.eyebrow')}
          title={t('whymawrid.howTitle')}
          subtitle={t('whymawrid.subtitle')}
        />
        <div className="mw-why__grid">
          {FEATURES.map((f) => (
            <article key={f.key} className="mw-why__card">
              <span className={`mw-why__icon mw-why__icon--${f.tone}`} aria-hidden="true">
                {f.icon}
              </span>
              <h3 className="mw-why__title">{t(f.key)}</h3>
              <p className="mw-why__desc">{t(f.descKey)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
