import { Link } from 'react-router-dom';
import './Details.css';

const RELATED = [
  { title_ar: 'حزمة أيقونات Neo', title_en: 'Neo Icon Pack', price: '24.00' },
  { title_ar: 'قالب لوحة تحكم AdminX', title_en: 'AdminX Dashboard', price: '49.00' },
  { title_ar: 'أصول 3D مجردة', title_en: 'Abstract 3D Assets', price: '18.00' },
  { title_ar: 'خط Sans Pro', title_en: 'Sans Pro Font', price: '35.00' },
];

export default function Details() {
  const isRtl = document.documentElement.dir === 'rtl';

  return (
    <div className="details" style={{ paddingTop: '100px' }}>
      <div className="container">
        <nav className="details__breadcrumb">
          <Link to="/">{isRtl ? 'الرئيسية' : 'Home'}</Link>
          <span className="details__breadcrumb-sep">‹</span>
          <Link to="/marketplace">{isRtl ? 'التصميم' : 'Design'}</Link>
          <span className="details__breadcrumb-sep">‹</span>
          <Link to="/marketplace">{isRtl ? 'أدوات' : 'Tools'}</Link>
          <span className="details__breadcrumb-sep">‹</span>
          <span>{isRtl ? 'مجموعة واجهات Nitec' : 'Nitec UI Kit Pro'}</span>
        </nav>

        <div className="details__layout">
          <div className="details__gallery">
            <div className="details__main-image">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCNcuEIf8VKJ603f76RjWpH8rNqiaP3c__veg1xjgg88AmZroI9eA8ojGCZoVsyuUbRfnV2nV03j2J-C5p2Ju4DdUrxay16iLgphcCs7jNx26hbCVq21GCEQvz1au6z1T8nyyYbDgvrioXWeL4Zp18M919IAS-SgHcYe-e1bpMLPj48EMKFR_yEvgTBOYlJAuR3c5PUFhOcZdwqe2RCosp56P4HIpOoLQoqqmVKXEEz8Q-4OK45g"
                alt=""
              />
              <button className="details__fav-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>
            <div className="details__thumbs">
              {[1, 2, 3, 4].map((t) => (
                <div key={t} className={`details__thumb ${t === 1 ? 'details__thumb--active' : ''}`}>
                  <img
                    src={`https://lh3.googleusercontent.com/aida-public/AB6AXuDyTnVvQU8S0BnemF_wwxKQhFxC7BNwRssU5iJE1CU-HNu9jyuWaPa1UFTeVkR9T7HEnriN8gTBZ1Ed8t3jWjBhyqlTalqEqh4iFQ81AwOqML-_sHT8l5uGl8gCcj7oPRtPouDk3EtUX7D0xkYxFfEM4MdbcmAD6GV0-leAuHr2wOW4TNpCQywiebO_teyjBFwD1T5ywN5uv7SrKIzzLCh8eLKXSVxVBXTf4JTTNsjJ553SYa1VA`}
                    alt=""
                  />
                  {t === 4 && <div className="details__thumb-more">+3</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="details__info">
            <div className="details__card">
              <span className="details__tag">{isRtl ? 'حزمة واجهات' : 'UI Kit'}</span>
              <h1 className="details__title">
                {isRtl ? 'مجموعة واجهة المستخدم المتقدمة Nitec' : 'Nitec Pro UI Kit Collection'}
              </h1>

              <div className="details__rating">
                <div className="details__stars">{'★'.repeat(4)}<span className="details__star-empty">★</span></div>
                <span>4.8 (124 {isRtl ? 'تقييم' : 'reviews'})</span>
                <span className="details__rating-divider">|</span>
                <span>{isRtl ? 'تم البيع: 1,050+' : '1,050+ sold'}</span>
              </div>

              <div className="details__price">
                <span className="details__price-current">$129.00</span>
                <span className="details__price-old">$199.00</span>
              </div>

              <div className="details__license">
                <h3>{isRtl ? 'نوع الترخيص' : 'License Type'}</h3>
                <div className="details__license-options">
                  <label className="details__license-option details__license-option--active">
                    <input type="radio" name="license" defaultChecked />
                    <div>
                      <span className="details__license-label">{isRtl ? 'شخصي' : 'Personal'}</span>
                      <span className="details__license-price">$129</span>
                    </div>
                  </label>
                  <label className="details__license-option">
                    <input type="radio" name="license" />
                    <div>
                      <span className="details__license-label">{isRtl ? 'تجاري' : 'Commercial'}</span>
                      <span className="details__license-price">$349</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="details__actions">
                <button className="btn btn--primary details__buy-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  {isRtl ? 'شراء الآن' : 'Buy Now'}
                </button>
                <button className="details__wishlist-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="details__vendor-card">
              <div className="details__vendor-avatar">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOEytsbTmPbyuMqWtHANssAElsmsP_DqLA8_-6V2iaIioyKsiQkRA1e4tpBylWWyb8NRjn0oxq5CuPWrkNVPLa5JkKHE0NTH0E2UcEdaGH2M8idkTEJRoOcXTVbsdMR09fMIflbhxhMhZT3g-kK0HfekdR7HnQmCsk5Z5y034KD4VvWy2umIsQzxiGVKXKeIcdXb2H3IMonpQd-Fb2IMVCHuZOFjJFotOdx4YbalvjXny8cUkq2Q" alt="" />
              </div>
              <div>
                <strong>{isRtl ? 'استوديو بيكسل' : 'Pixel Studio'}</strong>
                <span className="details__vendor-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                  </svg>
                  {isRtl ? 'بائع موثوق' : 'Verified Seller'}
                </span>
              </div>
              <button className="btn btn--outline details__follow-btn">{isRtl ? 'متابعة' : 'Follow'}</button>
            </div>

            <div className="details__specs">
              <h3>{isRtl ? 'المواصفات السريعة' : 'Quick Specs'}</h3>
              <div className="details__spec"><span>{isRtl ? 'صيغة الملفات' : 'File Format'}</span><span>Figma, Sketch</span></div>
              <div className="details__spec"><span>{isRtl ? 'حجم الملف' : 'File Size'}</span><span>145 MB</span></div>
              <div className="details__spec"><span>{isRtl ? 'تحديثات مجانية' : 'Free Updates'}</span><span>{isRtl ? 'مدى الحياة' : 'Lifetime'}</span></div>
              <div className="details__spec"><span>{isRtl ? 'دعم فني' : 'Support'}</span><span>{isRtl ? '6 أشهر' : '6 Months'}</span></div>
            </div>
          </div>
        </div>

        <div className="details__description">
          <div className="details__desc-tabs">
            <button className="details__desc-tab details__desc-tab--active">{isRtl ? 'الوصف' : 'Description'}</button>
            <button className="details__desc-tab">{isRtl ? 'المراجعات (124)' : 'Reviews (124)'}</button>
            <button className="details__desc-tab">{isRtl ? 'الأسئلة الشائعة' : 'FAQ'}</button>
          </div>
          <div className="details__desc-content">
            <p>{isRtl
              ? 'مجموعة واجهة المستخدم Nitec هي نظام تصميم شامل ومميز تم بناؤه خصيصاً لتطبيقات الويب الحديثة ولوحات القيادة المعقدة. تتميز بتصميم Soft-UI نظيف يعتمد على البطاقات مع عمق خفيف ومساحات بيضاء واسعة.'
              : 'Nitec UI Kit is a comprehensive design system built for modern web applications and complex dashboards. Features a clean Soft-UI design based on cards with subtle depth and generous whitespace.'}</p>
            <h4>{isRtl ? 'الميزات الرئيسية' : 'Key Features'}:</h4>
            <ul>
              <li>{isRtl ? '300+ مكون UI قابل للتخصيص' : '300+ customizable UI components'}</li>
              <li>{isRtl ? 'نظام ألوان وطباعة متكامل' : 'Integrated color & typography system'}</li>
              <li>{isRtl ? 'متوافق مع الوضع المظلم' : 'Dark mode compatible'}</li>
              <li>{isRtl ? 'تصميم متجاوب لجميع الشاشات' : 'Fully responsive layout'}</li>
            </ul>
          </div>
        </div>

        <div className="details__related">
          <div className="details__related-header">
            <h2>{isRtl ? 'منتجات ذات صلة' : 'Related Products'}</h2>
            <Link to="/marketplace">{isRtl ? 'عرض الكل' : 'View All'} →</Link>
          </div>
          <div className="details__related-grid">
            {RELATED.map((item, i) => (
              <Link key={i} to="/details" className="details__related-card">
                <div className="details__related-image">
                  <img
                    src={`https://lh3.googleusercontent.com/aida-public/AB6AXuAnY-enw4IIYt_uocfc5lee7hhvauNtu2SeL3rdU32LvdpMRP83LMVm5epjhl2TALhUJFGdMFRGrfYATh8Otbbmq-KJpvSTKlvkOU6WkofktzRJr4mTv9cAMOx_Jd5qwOyNfG1v1KgwRiva_UT5Dr5j6oMOCb0SdKFTdvCGsZWtL3CsuHma6GVXCnCxijEib6RDYLu0WQHKJ-EVsjtg8H-6Sh_97fxc84836EVsYBSejAP-NiDQsw`}
                    alt=""
                    loading="lazy"
                  />
                </div>
                <div className="details__related-body">
                  <h3>{isRtl ? item.title_ar : item.title_en}</h3>
                  <span className="details__related-price">${item.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
