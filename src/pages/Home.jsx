import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import WhyMawrid from '../components/sections/WhyMawrid';
import Testimonials from '../components/sections/Testimonials';
import TrendingProducts from '../components/sections/TrendingProducts';
import Categories from '../components/sections/Categories';
import './Home.css';

export default function Home() {
  return (
    <>
      <Hero />
      <div className="hero-divider-wrap">
        <img
          src="/images/backgrounds/line01.png"
          alt=""
          className="hero-divider-img"
          aria-hidden="true"
        />
      </div>
      <Features />
      <WhyMawrid />
      <Testimonials />
      <div className="container" style={{ paddingTop: 0, paddingBottom: 64 }}>
        <Categories />
        <TrendingProducts />
      </div>
    </>
  );
}
