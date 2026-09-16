import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/marketplace/ProductCard';
import './Marketplace.css';

const PRODUCTS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title_ar: i === 0 ? 'ساعة ذكية WH22-6' : i === 1 ? 'مضارب تنس احترافية' : i === 2 ? 'قفازات ملاكمة Pro' : i === 3 ? 'هودي نايك التدريبي' : i === 4 ? 'طقم قوس وسهم' : i === 5 ? 'حذاء نايك الجري' : `منتج رقمي ${i + 1}`,
  title_en: i === 0 ? 'Smart Watch WH22-6' : i === 1 ? 'Pro Tennis Rackets' : i === 2 ? 'Boxing Gloves Pro' : i === 3 ? 'Nike Training Hoodie' : i === 4 ? 'Archery Bow Set' : i === 5 ? 'Nike Running Shoes' : `Digital Product ${i + 1}`,
  price: i === 0 ? '454.00' : i === 1 ? '130.99' : i === 2 ? '196.84' : i === 3 ? '154.99' : i === 4 ? '48.99' : i === 5 ? '210.00' : `${(Math.random() * 500).toFixed(2)}`,
  badge_ar: i === 0 ? 'الأفضل' : i === 5 ? 'مميز' : null,
  badge_en: i === 0 ? 'Top Item' : i === 5 ? 'Featured' : null,
  image: i === 0
    ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3sWM52Mlc3kc_4i75kk54V1uDg3vwBblQEiOVUjqU2Zp-HZocLdkLgCUGMUvjs408YdukExJ1iyP_4ZyrznyvdYDJ1tWDKN4mSrssyln4kmko7yej96cDdoWY-JrN6ZnWRaBQJE_4TxyAS8dX6jxsVpNSCI_pxdXYiO49rJ9G58XqVmvoxveRCqIZ3ubqUtJzQInFFvf0-cOzimjYf_7t9iBJmJH09lEp2LPSbxoODrqSRRHfTA'
    : i === 1
    ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuDl9xUPxX4490lVrD0BHMwWtqu-ugDMGf5mCpv8HA_tGRbLqNESatU804LfcdDSpBkTXVNl5-it5VmZbMFrcrpnmIawe_gv0sHh3cEmFonNqB3I65qI5zyXf329dpM8zRFtUElE0ii4cQn3bXM06uu_fGK8tiav94jHssZ-jIv-_sH7KdrcVX1MVwL1rrKa49OdPF0xYxOXVD45EnsfvKY5dKtfHYX8Wr8oWFPkeLIslcQ9QODC8A'
    : i === 2
    ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBV8BVgQYRJbleXkhrjnHGOicfasIArrbK8ROvs82UNtXNirRbV6wcKHrj1qeVFb3Ncyn5c7RVDZSbVI9twypJUgkN3qKhhuz5n65laLm3rYY0yLMyykzJgG9U77Wpq2xnw6k2I5Lq_ymXHaIOeVtTmmjEDhjeWHpHm5VPNWllWSQM6K1jG9hwC35gJ2-5FhLgeyrKv5ZINuzIobTW_MdA7qvMVDf5vytvCG16_3sMCy4KpfN185A'
    : i === 3
    ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsKeq4zNgjQGakoA_3asZ1al1c_oLpbi3AeozzXNjIruinYt58pV5fn5CNTGi2x6r1uLOzExeUksEHiqvqzMDKorp_T7f3pKTjqopADfKNs4ViVe6uf7fpOQ5atXJCSPsiSfWKn6VM2Znh8kyny0w41hexAgNz2kycC-YGYBjmujK4N6qGFZ6_asO4tmIonBHPZgI9hztjh07VKgaNAZmW6Hy2Mc3Q-GgQ3qkp5Qnf6CNRU_QQ1A'
    : i === 4
    ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtRYa-mbqd58LB5qngN8AIZJV4zcZ8W2cQOKvkeyXh0gpPEP8niDQfigj7mlI9JgZB4--GfOMPGzoGQECIkvE3y4l01rbTQb7APh76ZmUftTCvwnz-vZuQ-a48OakDtI9zeoz9Uiyqb3DcTaKuET7rG6lcOzIN0mMTgojqBGimhpfKKwsTtHGyZy5XZH44y2f0J6xdOy9vgG8vU3JP2QMoEULRPIJvgtipVXo487X4h3w1kr1yPA'
    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuATuZuSbtDRohLC7XKaR2R0WfODSxXmxVk_Bih_FESCyxcmyi97iDvZhIGoEFFqe_lSBhwLOe1ikQrDINFL_dfg7sSRDfoopk0b4TviwR8b-Seq6ONEypDC6kD-FcFR96FCw8_l-u_lKFLmCg3bZ_f1bRBrqzuhTR8605miHFkFwEt8aKLSNgH-I56srk_p9948rSIDVVnwZPF4p28mx6ZppTAMWbHmUhclok45oe1mYcY10wSgIg',
}));

const CATEGORIES = ['Sport', 'Music', 'Gaming', 'Fashion', 'Art', 'Crypto'];

export default function Marketplace() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="marketplace" style={{ paddingTop: '100px' }}>
      <div className="container">
        <div className="marketplace__layout">
          <aside className="marketplace__sidebar">
            <div className="marketplace__sidebar-header">
              <h3>Filters</h3>
              <p>Refine your search</p>
            </div>
            <nav className="marketplace__filter-nav">
              {['All Categories', 'Price Range', 'Ratings', 'Software Type', 'File Formats'].map((f) => (
                <a key={f} href="#" className="marketplace__filter-link">{f}</a>
              ))}
            </nav>
            <button className="marketplace__apply-btn">Apply Filters</button>
          </aside>

          <main className="marketplace__main" ref={ref}>
            <div className="marketplace__chips">
              {CATEGORIES.map((cat, i) => (
                <button key={cat} className={`marketplace__chip ${i === 0 ? 'marketplace__chip--active' : ''}`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="marketplace__grid">
              {PRODUCTS.map((product, i) => (
                <div key={product.id} className={visible ? `animate-slide-up stagger-${(i % 6) + 1}` : ''}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            <div className="marketplace__pagination">
              <button className="marketplace__page-btn">{'<'}</button>
              <button className="marketplace__page-btn marketplace__page-btn--active">1</button>
              <button className="marketplace__page-btn">2</button>
              <button className="marketplace__page-btn">3</button>
              <span className="marketplace__page-ellipsis">...</span>
              <button className="marketplace__page-btn">{'>'}</button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
