import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './About.css';

const PROBLEM = [
  { ar: 'الاشتراكات الرقمية مشتتة بين عشرات المواقع.', en: 'Digital subscriptions scattered across dozens of sites.' },
  { ar: 'أسعار متفاوتة وطرق دفع معقدة في المنطقة.', en: 'Inconsistent pricing and complex payment methods in the region.' },
  { ar: 'لا يوجد ضمان عند طلب خدمة من بائع مستقل.', en: 'No guarantee when ordering a service from an independent seller.' },
  { ar: 'المستخدم العربي يحتاج منصة بلغته وعملته.', en: 'Arabic users need a platform in their language and currency.' },
];

const RES = [
  { ar: 'اشتراكات رياضية وترفيهية (Netflix, TOD, OSN, Spotify…).', en: 'Sports & entertainment subscriptions (Netflix, TOD, OSN, Spotify…).' },
  { ar: 'ذكاء اصطناعي: ChatGPT, Gemini, Claude.', en: 'AI: ChatGPT, Gemini, Claude.' },
  { ar: 'تعليم وتصميم وأعمال وألعاب.', en: 'Education, design, business, gaming.' },
  { ar: 'خطط: شهر / 3 أشهر / سنة.', en: 'Plans: month / 3 months / year.' },
  { ar: 'سعر أصلي + خصم ظاهر في البطاقة.', en: 'Original price + visible discount on the card.' },
];

const SELL = [
  { ar: 'تصميم، برمجة، مونتاج، تسويق، إدارة حسابات، ترجمة…', en: 'Design, programming, editing, marketing, account management, translation…' },
  { ar: 'كل مورّد يملك متجراً يعرض خدماته وتقييماته.', en: 'Each seller has a store showcasing services and ratings.' },
  { ar: 'الزبون يقارن ويختار الأفضل من أكثر من مورّد.', en: 'Buyers compare and pick the best among multiple sellers.' },
  { ar: 'السعر والمدة والوصف يحدّدها المورّد.', en: 'Price, duration and description set by the seller.' },
];

const STEPS = [
  { n: '١', ar: 'الاتفاق', en: 'Agreement', d_ar: 'على الخدمة + المدة + المبلغ', d_en: 'On service + duration + amount' },
  { n: '٢', ar: 'الدفع', en: 'Payment', d_ar: 'يدفع الزبون المبلغ المتفق عليه', d_en: 'Buyer pays the agreed amount' },
  { n: '٣', ar: 'الحجز', en: 'Hold', d_ar: 'يبقى المبلغ معلّقاً في خزينة مَورد', d_en: 'Amount held in Mawrid vault' },
  { n: '٤', ar: 'العدّاد', en: 'Countdown', d_ar: 'يبدأ العد التنازلي للمدة', d_en: 'Countdown for the agreed duration' },
  { n: '٥', ar: 'متابعة المراحل', en: 'Progress', d_ar: 'الزبون مطّلع على مراحل العمل', d_en: 'Buyer tracks work stages' },
  { n: '٦', ar: 'التسليم', en: 'Delivery', d_ar: 'المورّد يسلّم الخدمة عبر مَورد', d_en: 'Seller delivers via Mawrid' },
  { n: '٧', ar: 'التعديلات', en: 'Revisions', d_ar: 'بتفاهم الطرفين + عمولة إضافية', d_en: 'By agreement + extra fee' },
  { n: '٨', ar: 'التأكيد والتحويل', en: 'Release', d_ar: 'تأكيد الاستلام ← تحويل للمورّد (بعد خصم عمولة)', d_en: 'Confirm receipt → release to seller (minus fee)' },
];

const CASES = [
  { ar: 'تأخّر الزبون', en: 'Buyer delays', d_ar: 'المورّد يبلّغ إدارة مَورد والإدارة تتدخّل بكل أحقية.', d_en: 'Seller reports to Mawrid admin, who intervenes with full authority.' },
  { ar: 'تأخّر المورّد', en: 'Seller delays', d_ar: 'المبلغ يبقى محجوزاً حتى رضا الزبون.', d_en: 'Amount stays held until buyer is satisfied.' },
  { ar: 'النزاعات', en: 'Disputes', d_ar: 'يُحكم فيها بسجل المراحل والاتفاق والمحادثات.', d_en: 'Resolved by stage log, agreement and conversations.' },
];

const WHY = [
  { ar: 'مكان واحد لكل الحاجات الرقمية.', en: 'One place for all digital needs.' },
  { ar: 'أسعار تنافسية وعروض واضحة.', en: 'Competitive pricing and clear offers.' },
  { ar: 'ضمان مالي حقيقي يحمي الطرفين.', en: 'Real financial guarantee protecting both sides.' },
  { ar: 'عربي / إنجليزي + عملات متعددة.', en: 'Arabic / English + multiple currencies.' },
  { ar: 'لوحتا إدارة وبائع لإدارة كاملة.', en: 'Admin & seller dashboards for full control.' },
  { ar: 'بنية قابلة للتوسّع بأقسام جديدة.', en: 'Scalable structure for new sections.' },
];

export default function About() {
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const L = (ar, en) => (isRtl ? ar : en);

  return (
    <div className="about-page" dir={dir}>
      <section className="about-hero">
        <div className="container">
          <span className="about-kicker">{L('عن مَورد', 'About Mawrid')}</span>
          <h1 className="about-title">{L('منصة رقمية متكاملة', 'A complete digital platform')}</h1>
          <p className="about-sub">
            {L('سوق رقمي واحد لكل احتياجاتك الرقمية — موارد جاهزة وخدمات موثوقة في مكان واحد.',
              'One digital marketplace for all your digital needs — ready resources and trusted services in one place.')}
          </p>
          <div className="about-chips">
            <span>{L('موارد جاهزة', 'Ready resources')}</span>
            <span>{L('سوق مورّدين', 'Sellers market')}</span>
            <span>{L('ضمان مالي', 'Financial guarantee')}</span>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <h2 className="about-h2">{L('المشكلة', 'The problem')}</h2>
          <p className="about-lead">{L('لماذا نحتاج مَورد؟', 'Why do we need Mawrid?')}</p>
          <ul className="about-list">
            {PROBLEM.map((p, i) => (<li key={i}>{L(p.ar, p.en)}</li>))}
          </ul>
        </div>
      </section>

      <section className="about-section about-section--alt">
        <div className="container">
          <h2 className="about-h2">{L('الحل', 'The solution')}</h2>
          <p className="about-lead">{L('مَورد يجمع كل شيء في قسمين', 'Mawrid brings everything together in two sections')}</p>
          <div className="about-two">
            <div className="about-card about-card--teal">
              <h3>{L('١  قسم المَوارد', '1  Resources section')}</h3>
              <ul>{RES.map((p, i) => (<li key={i}>{L(p.ar, p.en)}</li>))}</ul>
            </div>
            <div className="about-card about-card--gold">
              <h3>{L('٢  سوق المورّدين', '2  Sellers market')}</h3>
              <ul>{SELL.map((p, i) => (<li key={i}>{L(p.ar, p.en)}</li>))}</ul>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <h2 className="about-h2">{L('نظام الضمان', 'Escrow system')}</h2>
          <p className="about-lead">{L('خزينة مَورد (Escrow)', 'Mawrid vault (Escrow)')}</p>
          <p className="about-para">
            {L('المبلغ يبقى معلّقاً في خزينة مَورد حتى إتمام العمل — لا يذهب للمورّد قبل التسليم، ولا يدخل محفظة مَورد إلّا كعمولة بعد الإتمام.',
              'The amount stays held in the Mawrid vault until work is complete — it does not go to the seller before delivery, and only enters Mawrid wallet as a fee after completion.')}
          </p>
          <div className="about-steps">
            {STEPS.map((s, i) => (
              <div key={i} className="about-step">
                <span className="about-step__n">{s.n}</span>
                <div>
                  <strong>{L(s.ar, s.en)}</strong>
                  <p>{L(s.d_ar, s.d_en)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="about-cases">
            {CASES.map((c, i) => (
              <div key={i} className="about-case">
                <h4>{L(c.ar, c.en)}</h4>
                <p>{L(c.d_ar, c.d_en)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section about-section--alt">
        <div className="container">
          <h2 className="about-h2">{L('لماذا مَورد؟', 'Why Mawrid?')}</h2>
          <ul className="about-grid">
            {WHY.map((w, i) => (<li key={i}>{L(w.ar, w.en)}</li>))}
          </ul>
        </div>
      </section>

      <section className="about-cta">
        <div className="container">
          <h2>{L('مَورد: موارد جاهزة… وخدمات موثوقة… في مكان واحد.', 'Mawrid: ready resources… and trusted services… in one place.')}</h2>
          <div className="about-cta__btns">
            <Link to="/marketplace" className="btn btn--primary">{L('ابدأ التسوق', 'Start shopping')}</Link>
            <Link to="/sellers" className="btn btn--ghost">{L('اكتشف المورّدين', 'Discover sellers')}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
