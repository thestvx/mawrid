import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import SplitText from '../ui/SplitText';
import Stepper, { Step } from '../ui/Stepper';
import './WhyMawrid.css';

const stepContent = [
  {
    key: 'whymawrid.step1',
    descKey: 'whymawrid.step1desc',
    icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></>,
  },
  {
    key: 'whymawrid.step2',
    descKey: 'whymawrid.step2desc',
    icon: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
  },
  {
    key: 'whymawrid.step3',
    descKey: 'whymawrid.step3desc',
    icon: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></>,
  },
];

export default function WhyMawrid() {
  const { t, lang } = useLanguage();
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const completedContent = (
    <div className="stepper__completed-inner">
      <span className="stepper__completed-icon" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <h3 className="stepper__completed-title">{t('whymawrid.done')}</h3>
      <p className="stepper__completed-desc">{t('whymawrid.doneDesc')}</p>
      <Link to="/auth?mode=signup" className="stepper__completed-cta">
        {t('whymawrid.cta')}
      </Link>
    </div>
  );

  return (
    <section className="whymawrid" id="howitworks">
      <div className="container">
        <SplitText
          text={t('whymawrid.howTitle')}
          tag="h2"
          className="whymawrid__title"
          textAlign="center"
          delay={26}
          duration={1}
          threshold={0.15}
          from={{ opacity: 0, y: 30 }}
        />

        <Stepper
          initialStep={1}
          dir={dir}
          backButtonText={t('whymawrid.back')}
          nextButtonText={t('whymawrid.next')}
          completeButtonText={t('whymawrid.finish')}
          completedContent={completedContent}
        >
          {stepContent.map((s) => (
            <Step key={s.key}>
              <span className="stepper__step-icon" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {s.icon}
                </svg>
              </span>
              <h4 className="stepper__step-title">{t(s.key)}</h4>
              <p className="stepper__step-desc">{t(s.descKey)}</p>
            </Step>
          ))}
        </Stepper>
      </div>
    </section>
  );
}