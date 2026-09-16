import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import WhyMawrid from '../components/sections/WhyMawrid';
import Testimonials from '../components/sections/Testimonials';
import TrendingProducts from '../components/sections/TrendingProducts';
import Categories from '../components/sections/Categories';
import './Home.css';

const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

function SectionReveal({ children, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={sectionVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  return (
    <>
      <Hero />

      <motion.div
        className="hero-divider-fullwidth"
        initial={{ opacity: 0, scaleX: 0.8 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <img
          src="/images/backgrounds/line01.png"
          alt=""
          className="hero-divider-fullwidth__img"
          aria-hidden="true"
        />
      </motion.div>

      <SectionReveal>
        <Features />
      </SectionReveal>

      <SectionReveal>
        <WhyMawrid />
      </SectionReveal>

      <SectionReveal>
        <Testimonials />
      </SectionReveal>

      <SectionReveal>
        <div className="container" style={{ paddingTop: 0, paddingBottom: 64 }}>
          <Categories />
          <TrendingProducts />
        </div>
      </SectionReveal>
    </>
  );
}
