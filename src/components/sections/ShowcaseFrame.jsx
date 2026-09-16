import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import './ShowcaseFrame.css';

const EASE = [0.16, 1, 0.3, 1];

export default function ShowcaseFrame() {
  const { t } = useLanguage();

  return (
    <section className="showcase">
      <div className="container">
        <motion.div
          className="showcase__frame"
          initial={{ opacity: 0, y: 36, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div className="showcase__mat">
            <img
              src="/images/backgrounds/herobackground01.png"
              alt="Mawrid - مَورد"
              className="showcase__img"
              loading="lazy"
            />
            <div className="showcase__shade" aria-hidden="true" />
            <div className="showcase__caption">
              <span className="showcase__caption-line" aria-hidden="true" />
              <span className="showcase__caption-text">{t('showcase.caption')}</span>
              <span className="showcase__caption-line" aria-hidden="true" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}