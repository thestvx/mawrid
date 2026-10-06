import Hero from '../components/sections/Hero';
import Categories from '../components/sections/Categories';
import TrendingProducts from '../components/sections/TrendingProducts';
import Pricing from '../components/sections/Pricing';
import WhyMawrid from '../components/sections/WhyMawrid';
import Testimonials from '../components/sections/Testimonials';
import CtaBanner from '../components/sections/CtaBanner';
import './Home.css';

export default function Home() {
  return (
    <div className="mw mw-home">
      <Hero />
      <Categories />
      <TrendingProducts />
      <Pricing />
      <WhyMawrid />
      <Testimonials />
      <CtaBanner />
    </div>
  );
}
