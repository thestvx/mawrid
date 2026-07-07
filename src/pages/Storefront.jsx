import { Link } from 'react-router-dom';
import ProductCard from '../components/marketplace/ProductCard';
import './Storefront.css';

const PRODUCTS = [
  {
    id: 1,
    title_ar: 'حزمة واجهات Nexus Pro',
    title_en: 'Nexus Pro Dashboard UI Kit',
    price: '89.00',
    badge_ar: 'الأفضل مبيعاً',
    badge_en: 'Best Seller',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAubMC_bvCWKoCTEsJvZu595f0V-aZGrUbCSvkNcPbcw-h5IUE4Xj-64vfKZdqgktGeZNdQtO4j2VZ-ivpI4Mkm8USH3OP1u3aivP0gyeMPB0BPVZaajSTNPejxz_adoFWzRzrlh7O1zMCV6hf1rk9zEwNPSgxoygnjAvYUFnPznYbOdDLElxnPsFmJ1RlVA7b5bbjuziFa4YqJ1eanuKOtX-aWAitcShvR5_prwVm22B_kvhhx4Q',
  },
  {
    id: 2,
    title_ar: 'قالب تطبيق متجر',
    title_en: 'E-Commerce App Template',
    price: '45.00',
    badge_ar: null,
    badge_en: null,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_o1X1Wg0ua_kNJcNOhC3260PWRDJI6hMmr-J60rRJhpOrMjhLDoTPNmzlhCLXrsJsEknruC7SEdiX4xEPY3tCSNNhZxuHDcuOu6P03Wug1FcE8s3N-ZYylhQ-6tGCEL-keCTb1aEzsLwPG9LJpVeCNIu9Q17_9vZMm99KM7LPByRPdKL6vZ1hkKQWzL-q8wLt6sNgAA-6iTJ8-bkI0pW0jUbXDqlebC4z8Pd9jBZf9iRVfuFSBg',
  },
  {
    id: 3,
    title_ar: 'باقة أشكال 3D مجردة',
    title_en: 'Abstract 3D Shape Pack v2',
    price: '29.00',
    badge_ar: 'جديد',
    badge_en: 'New',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZljs3d8QIURapQKWo6rzy-J3L-RRnhbDnrVcPeB8A3LEXnbGFvjG9g1p3p9W1dAHpa4pymgfavpEiIezbzYQ70rF-k9ZaeB9A-88Cce384ku5U_XVeBT1OAkv4uds3hr8YNsVWAuOpywgCkDrc6_xZa90aHDJMecP70l8CgYmy2A8bhH0qUJJh322CvcD8sf48HH8IH8t4BJpBvquIFW4MxxPkjvzT7kzFLn6zUC11C6jH_rZxg',
  },
  {
    id: 4,
    title_ar: 'قالب لوحة تحكم مالية',
    title_en: 'Fintech Admin Dashboard',
    price: '55.00',
    badge_ar: null,
    badge_en: null,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_dsjete62ve8x_q36X9TvBSPB0wm1g-NXSguBXZnr6vJ3geddNcXLkEP776tFZgxb6HcLWJmd54zKESIH1mtkru4bSVyQutQ3dK9EWEwoU03-4PqKYZjZsYlByxXnLabsaev5R7yt8ycvl5GE4jxSxTVPkbD-xyR3-56k-dabi4lvno_eP-sdvNYZjI0MurYJa1gJKmJPacJLE5ijyLNXvhlYR5HGvZeK9IkpaHJ02B73cNtbEA',
  },
  {
    id: 5,
    title_ar: 'باقة توضيحات احترافية',
    title_en: 'Corporate Vector Pack',
    price: '24.00',
    badge_ar: null,
    badge_en: null,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxzQjeLjqTopeY-IaDOmy-OuiaGraDFSezdY8YRcVXoP3NUjHERO7ZQQPhifRQNjiucOksYeFk6XVIlNjSXYRipuY75R5Cw66mygdPli3cU-0qc8Jcl0tFdKsNnEJFCFieCcPArov1x80rRF4h1b9MHQehpuPXZYqJflrBLk9KNxW-xO0AM9YGi9sPA79EA-uLjRqVNeZcVeM35JQyqw94Omo2CKbVhvh2UqMxtHmVSWXSpR5XSg',
  },
];

export default function Storefront() {
  const isRtl = document.documentElement.dir === 'rtl';

  return (
    <div className="storefront" style={{ paddingTop: '100px' }}>
      <div className="container">
        <div className="storefront__banner">
          <div className="storefront__banner-overlay" />
        </div>

        <div className="storefront__vendor-card">
          <div className="storefront__vendor-avatar">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOqCCiTQi7nQOFZqMpeNnnwJhzoj0XzsorPq69zG0si9flcQTsyQG7y_WFRsa6JTO_MgfsBoZzWH96DCjGqJ_Mhit9QapiM8HVBl7FmFvbbkeBkPK0c2vLzdqS4CVnn26jrd0rUNA29kug-YcgZnrCmNn_UC3JAIPerDm0pTcMWwNk5IQYd3whYpZITooT44GZzRiSeICmcuilg0JtZChBBzrOkVE8uI_JimZtjvVqCZL3sADBJw"
              alt=""
            />
            <div className="storefront__vendor-verified">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
            </div>
          </div>

          <div className="storefront__vendor-info">
            <div className="storefront__vendor-header">
              <div>
                <h1>Creative Studio X</h1>
                <p>{isRtl ? 'حزمة واجهات وموارد رقمية متميزة' : 'Premium UI Kits & Digital Assets'}</p>
              </div>
              <div className="storefront__vendor-actions">
                <button className="btn btn--primary">{isRtl ? 'متابعة' : 'Follow'}</button>
                <button className="btn btn--outline">{isRtl ? 'تواصل' : 'Contact'}</button>
              </div>
            </div>
            <div className="storefront__vendor-stats">
              <div><strong>4.9</strong><span>Rating</span></div>
              <div className="storefront__stat-divider" />
              <div><strong>12k+</strong><span>Sales</span></div>
              <div className="storefront__stat-divider" />
              <div><strong>150</strong><span>Products</span></div>
              <div className="storefront__stat-divider" />
              <div><strong>USA</strong><span>Location</span></div>
            </div>
          </div>
        </div>

        <div className="storefront__tabs">
          <button className="storefront__tab storefront__tab--active">
            {isRtl ? 'جميع المنتجات' : 'All Products'}
          </button>
          <button className="storefront__tab">UI Kits</button>
          <button className="storefront__tab">Illustrations</button>
          <button className="storefront__tab">3D Assets</button>
          <button className="storefront__tab">Templates</button>
          <div className="storefront__sort">
            <span>{isRtl ? 'ترتيب:' : 'Sort by:'}</span>
            <select>
              <option>Popular</option>
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="storefront__grid">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          <div className="storefront__promo-card">
            <span className="material-symbols-outlined" style={{ fontSize: 48 }}>workspace_premium</span>
            <h3>{isRtl ? 'اشتراك مميز' : 'Premium Subscription'}</h3>
            <p>{isRtl ? 'احصل على جميع المنتجات بسعر سنوي' : 'Get all products for one yearly price'}</p>
            <button className="btn btn--primary">
              {isRtl ? 'اشترك $199/سنة' : 'Subscribe $199/yr'}
            </button>
          </div>
        </div>

        <div className="storefront__load-more">
          <button className="btn btn--outline">
            {isRtl ? 'تحميل المزيد' : 'Load More Products'}
          </button>
        </div>
      </div>
    </div>
  );
}
