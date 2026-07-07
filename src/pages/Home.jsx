import Hero from '../components/sections/Hero';
import TrendingProducts from '../components/sections/TrendingProducts';
import Categories from '../components/sections/Categories';

export default function Home() {
  return (
    <>
      <Hero />
      <div className="container" style={{ paddingTop: 0, paddingBottom: 64 }}>
        <Categories />
        <TrendingProducts />
      </div>
    </>
  );
}
