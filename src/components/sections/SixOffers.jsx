import { useState } from 'react';
import PlanCard from '../ui/PlanCard';
import SubscriptionCards from './SubscriptionCards';
import './SixOffers.css';

const offers = [
  { key: 'chatgptplus-3months', img: '/sub/chatgpt/chatgptplus-3months.png', nameAr: 'اشتراك شات جي بي تي بلس لمدة 3 أشهر', nameEn: 'ChatGPT Plus — 3 Months', durAr: '3 أشهر', durEn: '3 months', price: 33, oldPrice: 41 },
  { key: 'geminipro-1months', img: '/sub/gemini/geminipro-1months.png', nameAr: 'اشتراك جيميني برو — شهر واحد', nameEn: 'Gemini Pro — 1 Month', durAr: 'شهر واحد', durEn: '1 month', price: 29, oldPrice: 38 },
  { key: 'chatgptplus-1months', img: '/sub/chatgpt/chatgptplus-1months.png', nameAr: 'اشتراك شات جي بي تي بلس شخصي لمدة شهر واحد', nameEn: 'ChatGPT Plus Personal — 1 Month', durAr: 'شهر واحد', durEn: '1 month', price: 22, oldPrice: 27 },
  { key: 'courseraplus-1year', img: '/sub/coursera/courseraplus-1year.png', nameAr: 'اشتراك كورسيرا بلس — لمدة سنة كاملة', nameEn: 'Coursera Plus — 1 Year', durAr: 'سنة كاملة', durEn: '1 year', price: 149, oldPrice: 190 },
  { key: 'canvapro-1year', img: '/sub/canva/canvapro-1year.png', nameAr: 'اشتراك كانفا برو التعليمي — لمدة سنة', nameEn: 'Canva Pro (Education) — 1 Year', durAr: 'سنة', durEn: '1 year', price: 99, oldPrice: 140 },
  { key: 'adobe-3months', img: '/sub/adobe/adobe-3months.png', nameAr: 'اشتراك أدوبي — 3 أشهر', nameEn: 'Adobe — 3 Months', durAr: '3 أشهر', durEn: '3 months', price: 79, oldPrice: 120 },
];

const thumbFor = o => o.img;
const cardProps = o => ({ planNameEn: o.nameEn, planNameAr: o.nameAr, durationEn: o.durEn, durationAr: o.durAr, price: o.price, oldPrice: o.oldPrice, image: o.img, offers: 1, bestValue: o.key === 'courseraplus-1year' || o.key === 'canvapro-1year' });

export default function SixOffers() {
  const [dir] = useState('rtl');
  return (
    <section className="so">
      <img src="/images/lines/famousline.png" alt="" className="so__line" />
      <div className="so__grid">
        {offers.map(o => (
          <div className="so__cell" key={o.key}>
            <div className="so__thumb"><img src={thumbFor(o)} alt={dir === 'rtl' ? o.nameAr : o.nameEn} /></div>
            <div className="so__meta">
              <strong className="so__name">{dir === 'rtl' ? o.nameAr : o.nameEn}</strong>
              <span className="so__dur">{dir === 'rtl' ? o.durAr : o.durEn}</span>
              <div className="so__price">
                <b className="so__price-new">{o.price} ﷼</b>
                <s className="so__price-old">{o.oldPrice} ﷼</s>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="so__bg">
        <img src="/images/backgrounds/allinmawrid.png" alt="" className="so__bg-img" />
      </div>
      <div className="so__catalog">
        <SubscriptionCards />
      </div>
    </section>
  );
}
