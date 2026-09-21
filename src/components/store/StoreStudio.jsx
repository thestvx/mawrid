import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DEMO_LOOKS, DEMO_ABOUT_BULLETS, DEMO_TESTIMONIALS, DEMO_FAQ, DEMO_STATS } from '../../lib/demoCatalog';
import { saveStorefront, slugify, isSlugAvailable, PALETTES, FONT_PRESETS, DEFAULT_THEME, getPalette } from '../../lib/storefront';
import { SECTION_TYPES, sectionLabel, makeSection } from './sectionSchema';
import './StoreStudio.css';

const TEMPLATES = [
  {
    id: 'ember', icon: '🔥', label_ar: 'جمر', label_en: 'Ember', desc_ar: 'دفء كلاسيكي وقصة علامة تجارية كاملة', desc_en: 'Warm classic with a full brand story',
    theme: { palette: 'ember', font: 'modern', radius: 18, density: 'comfy', custom: {} },
    sections: [
      { type: 'hero', props: { layout: 'full', align: 'center', height: 'tall', badge_ar: 'مجموعة خريف ٢٠٢٦', badge_en: 'Autumn 2026', title_ar: 'طيف', title_en: 'Taif', subtitle_ar: 'قصص تُخاط لِتُرتدى — كل قطعة شهادة على ذوقك', subtitle_en: 'Stories stitched to be worn — every piece a statement', image: 'https://picsum.photos/seed/mawrid-ember/1400/1200', overlay: 55, cta1Label_ar: 'تسوّق الآن', cta1Label_en: 'Shop now', cta1Href: '#products', cta2Label_ar: 'قِصّتنا', cta2Label_en: 'Our story', cta2Href: '#about' } },
      { type: 'marquee', props: { text_ar: 'شحن مجاني لكل السعودية — إرجاع خلال ١٤ يوم — قطع محدودة الإصدار', text_en: 'Free KSA-wide shipping — 14-day returns — limited drops', speed: 26 } },
      { type: 'featured', props: { title_ar: 'القطع المميزة', title_en: 'Featured pieces', eyebrow_ar: 'الأفضل مبيعاً', eyebrow_en: 'Best sellers', subtitle_ar: 'أيقونات اختارها عملاؤنا مراراً وتكراراً', subtitle_en: 'Icons our clients keep coming back for', source: 'featured', limit: 6, layout: 'editorial', showPrice: true, cartBtn: 'overlay' } },
      { type: 'categories', props: { title_ar: 'تسوّق حسب القسم', title_en: 'Shop by category', eyebrow_ar: 'أقسامنا', eyebrow_en: 'Browse', layout: 'cards', limit: 8 } },
      { type: 'stats', props: { title_ar: '', title_en: '', eyebrow_ar: 'ثقة تنمو منذ ٢٠١٧', eyebrow_en: 'Trust built since 2017', items: [] } },
      { type: 'lookbook', props: { title_ar: 'من أعمالنا', title_en: 'Lookbook', eyebrow_ar: 'أبرز الإطلالات', eyebrow_en: 'Latest looks', columns: 3, images: [] } },
      { type: 'about', props: { title_ar: 'قصتنا', title_en: 'Our story', eyebrow_ar: 'من نحن', eyebrow_en: 'About us', text_ar: '', text_en: '', image: 'https://picsum.photos/seed/mawrid-story/1100/900', signature: 'عائلة طيف', bullets: [] } },
      { type: 'testimonials', props: { title_ar: 'قالوا عنا', title_en: 'Kind words', eyebrow_ar: 'آراء عميلاتنا', eyebrow_en: 'Client love', items: [] } },
      { type: 'faq', props: { title_ar: 'أسئلة شائعة', title_en: 'FAQ', eyebrow_ar: 'تحتاج مساعدة؟', eyebrow_en: 'Need help?', items: [] } },
      { type: 'cta', props: { title_ar: 'جاهزة لإطلالتك الجديدة؟', title_en: 'Ready for your new look?', text_ar: 'فريقنا جاهز يرافقك من القَصّ إلى التوصيل.', text_en: 'We guide you from the cut to your doorstep.', button_ar: 'اطلبي الآن', button_en: 'Order now', href: '#contact', tint: true } },
      { type: 'contact', props: { title_ar: 'تواصل معنا', title_en: 'Get in touch', text_ar: 'نتشرف بخدمتك ونسعد بالرد على استفساراتك', text_en: 'Happy to help with any enquiry', showWhatsapp: true, showEmail: true, showPhone: true, showAddress: true } },
    ],
  },
  {
    id: 'editorial', icon: '📰', label_ar: 'تحريري فاخر', label_en: 'Editorial Luxe', desc_ar: 'مجلة أزياء بخط سيريف وإيقاع هادئ', desc_en: 'A fashion magazine with quiet rhythm',
    theme: { palette: 'sand', font: 'editorial', radius: 8, density: 'comfy', custom: {} },
    sections: [
      { type: 'hero', props: { layout: 'split', align: 'start', height: 'tall', eyebrow_ar: 'الموسم الجديد', eyebrow_en: 'The new season', title_ar: 'طيف', title_en: 'Taif', subtitle_ar: 'تصميم يبدأ من الخامة، ويروي حكاية لا تُنسى', subtitle_en: 'Design that begins with the fabric and tells an unforgettable story', image: 'https://picsum.photos/seed/mawrid-edit/1200/1500', overlay: 0, cta1Label_ar: 'المجموعة الجديدة', cta1Label_en: 'New collection', cta1Href: '#products', cta2Label_ar: 'قصتنا', cta2Label_en: 'Our story', cta2Href: '#about' } },
      { type: 'stats', props: { title_ar: '', title_en: '', eyebrow_ar: 'بالأرقام', eyebrow_en: 'By the numbers', items: [] } },
      { type: 'featured', props: { title_ar: 'القطع المميزة', title_en: 'Featured pieces', eyebrow_ar: 'خالدة', eyebrow_en: 'Timeless', subtitle_ar: 'إصدارات محدودة خيطوها أمهر الخيّاطين', subtitle_en: 'Limited editions crafted by master hands', source: 'featured', limit: 6, layout: 'editorial', showPrice: true, cartBtn: 'inline' } },
      { type: 'lookbook', props: { title_ar: 'من أعمالنا', title_en: 'Lookbook', eyebrow_ar: 'ألبوم الموضة', eyebrow_en: 'Fashion album', subtitle_ar: 'نظرة على أجمل ما خرج من مشغلنا', subtitle_en: 'A look inside our atelier', columns: 3, images: [] } },
      { type: 'about', props: { title_ar: 'قصتنا', title_en: 'Our story', eyebrow_ar: 'من نحن', eyebrow_en: 'About us', text_ar: '', text_en: '', image: 'https://picsum.photos/seed/mawrid-atelier/1100/900', signature: 'طيف — عام ٢٠١٧', bullets: [] } },
      { type: 'testimonials', props: { title_ar: 'قالوا عنا', title_en: 'Kind words', eyebrow_ar: 'آراء العميلات', eyebrow_en: 'From our clients', items: [] } },
      { type: 'faq', props: { title_ar: 'الأسئلة الشائعة', title_en: 'FAQ', eyebrow_ar: 'كل ما يخص الطلب', eyebrow_en: 'All about your order', items: [] } },
      { type: 'cta', props: { title_ar: 'احجزي مقاسك قبل نفاد الكميّة', title_en: 'Reserve your piece before it sells out', text_ar: '', text_en: '', button_ar: 'ابدئي الآن', button_en: 'Start now', href: '#contact', tint: true } },
      { type: 'contact', props: { title_ar: 'تواصل معنا', title_en: 'Get in touch', text_ar: 'نختار شريكاً لكل عميلة', text_en: 'A point of contact for every client', showWhatsapp: true, showEmail: true, showPhone: true, showAddress: true } },
    ],
  },
  {
    id: 'noir', icon: '🌙', label_ar: 'ليلي', label_en: 'Noir', desc_ar: 'داكن جريء وإيقاع شارعي قوي', desc_en: 'Dark, bold, street-cred rhythm',
    theme: { palette: 'noir', font: 'display', radius: 14, density: 'airy', custom: {} },
    sections: [
      { type: 'hero', props: { layout: 'full', align: 'center', height: 'full', badge_ar: 'إصدار ٠٠١', badge_en: 'Drop 001', title_ar: 'طيف', title_en: 'Taif', subtitle_ar: 'لا تطارد الموضة — أمليها', subtitle_en: "Don't chase trends — set them", image: 'https://picsum.photos/seed/mawrid-noir/1200/1500', overlay: 62, cta1Label_ar: 'اكتشف', cta1Label_en: 'Discover', cta1Href: '#products', cta2Label_ar: 'تعرف علينا', cta2Label_en: 'About', cta2Href: '#about' } },
      { type: 'marquee', props: { text_ar: 'إصدارات محدودة — يبدأ الشحن خلال ٢٤ ساعة — تواصل مباشر', text_en: 'Limited drops — ships within 24h — direct contact', speed: 22 } },
      { type: 'featured', props: { title_ar: 'الأحدث', title_en: 'Fresh drops', eyebrow_ar: 'وصل حديثاً', eyebrow_en: 'New arrivals', source: 'all', limit: 10, layout: 'carousel', showPrice: true, cartBtn: 'overlay' } },
      { type: 'lookbook', props: { title_ar: 'إطلالات', title_en: 'Looks', eyebrow_ar: 'ستريت ستايل', eyebrow_en: 'Street style', columns: 4, images: [] } },
      { type: 'stats', props: { title_ar: '', title_en: '', eyebrow_ar: 'المجتمع', eyebrow_en: 'The numbers', items: [] } },
      { type: 'about', props: { title_ar: 'من نحن', title_en: 'Who we are', eyebrow_ar: 'الرؤية', eyebrow_en: 'The vision', text_ar: '', text_en: '', image: 'https://picsum.photos/seed/mawrid-dark/1100/900', signature: 'فريق طيف', bullets: [] } },
      { type: 'cta', props: { title_ar: 'لا تفوّت الإصدار القادم', title_en: 'Never miss the next drop', text_ar: 'انضم لقائمة الانتظار واستلم أولاً.', text_en: 'Get on the list and be first to know.', button_ar: 'انضم للقائمة', button_en: 'Join the list', href: '#contact', tint: true } },
      { type: 'contact', props: { title_ar: 'تواصل معنا', title_en: 'Get in touch', text_ar: '', text_en: '', showWhatsapp: true, showEmail: true, showPhone: true, showAddress: false } },
    ],
  },
  {
    id: 'boutique', icon: '🌸', label_ar: 'بوتيك', label_en: 'Boutique', desc_ar: 'أنوثة ناعمة وتجربة اقتناء فاخرة', desc_en: 'Soft feminine, luxury shopping feel',
    theme: { palette: 'rose', font: 'chic', radius: 24, density: 'airy', custom: {} },
    sections: [
      { type: 'hero', props: { layout: 'minimal', align: 'center', height: 'tall', badge_ar: 'افتتاح الموسم', badge_en: 'Season opening', eyebrow_ar: 'مرحباً بكِ', eyebrow_en: 'Welcome', title_ar: 'طيف بوتيك', title_en: 'Taif Boutique', subtitle_ar: 'لمسة ناعمة لكل يوم — لأنّكِ تستحقين الأجمل', subtitle_en: 'A soft touch for every day — because you deserve the finest', cta1Label_ar: 'تسوّقي', cta1Label_en: 'Shop', cta1Href: '#products', cta2Label_ar: 'مواعيدنا', cta2Label_en: 'Book us', cta2Href: '#contact' } },
      { type: 'marquee', props: { text_ar: 'إطلالة واحدة تكفي — خيارات مختارة بعناية — شحن هدايا مجاني', text_en: 'One look is enough — curated picks — free gift wrap', speed: 26 } },
      { type: 'featured', props: { title_ar: 'وصل حديثاً', title_en: 'New arrivals', eyebrow_ar: 'موسم ٢٠٢٦', eyebrow_en: 'Season 2026', source: 'all', limit: 8, layout: 'grid', showPrice: true, cartBtn: 'inline' } },
      { type: 'stats', props: { title_ar: '', title_en: '', eyebrow_ar: 'لمسة شفافية', eyebrow_en: 'Transparency', items: [] } },
      { type: 'lookbook', props: { title_ar: 'إطلالاتنا', title_en: 'Our looks', eyebrow_ar: 'من الكلاسيكي للعصري', eyebrow_en: 'Classic to modern', columns: 3, images: [] } },
      { type: 'about', props: { title_ar: 'فلسفتنا', title_en: 'Our philosophy', eyebrow_ar: 'لماذا نحن', eyebrow_en: 'Why us', text_ar: '', text_en: '', image: 'https://picsum.photos/seed/mawrid-rose/1100/900', signature: 'طيف بوتيك', bullets: [] } },
      { type: 'testimonials', props: { title_ar: 'آراء عميلاتنا', title_en: 'Client love', eyebrow_ar: 'من قلب المشاغل', eyebrow_en: 'From our clients', items: [] } },
      { type: 'contact', props: { title_ar: 'احجزي موعدك', title_en: 'Book an appointment', text_ar: 'جلسة خاصة لتجربة الأقمشة قبل الشراء', text_en: 'A private session to feel the fabrics first', showWhatsapp: true, showEmail: true, showPhone: true, showAddress: true } },
    ],
  },
  {
    id: 'minimal', icon: '▫', label_ar: 'مينيمال', label_en: 'Minimal', desc_ar: 'نقاء بلا ضجيج — المنتج هو البطل', desc_en: 'Pure, quiet, product-first',
    theme: { palette: 'ink', font: 'modern', radius: 10, density: 'compact', custom: {} },
    sections: [
      { type: 'hero', props: { layout: 'minimal', align: 'center', height: 'short', badge_ar: 'الجودة تلي بالكم', badge_en: 'Quality over quantity', title_ar: 'طيف', title_en: 'Taif', subtitle_ar: 'أقل هو أكثر', subtitle_en: 'Less is more', cta1Label_ar: 'تسوّق', cta1Label_en: 'Shop', cta1Href: '#products' } },
      { type: 'featured', props: { title_ar: 'تشكيلتنا', title_en: 'The Edit', eyebrow_ar: 'اختياراتنا', eyebrow_en: 'Our picks', source: 'featured', limit: 6, layout: 'grid', showPrice: true, cartBtn: 'hidden' } },
      { type: 'richtext', props: { title_ar: 'نحوّة هادئة', title_en: 'Quiet craftsmanship', text_ar: 'نبني كل قطعة بعناية، حتى تخدمكِ سنوات.\nنختار الجودة على الكم، والواقعية على المبالغة.\nهذا كلّ ما نحتاج قوله.', text_en: 'We build each piece carefully, so it serves you for years.\nWe choose quality over quantity, and honesty over hype.\nThat is all we need to say.', align: 'center' } },
      { type: 'stats', props: { title_ar: '', title_en: '', eyebrow_ar: 'منذ ٢٠١٧', eyebrow_en: 'Since 2017', items: [] } },
      { type: 'contact', props: { title_ar: 'تواصل معنا', title_en: 'Get in touch', text_ar: 'نسعد بملاحظاتك واقتراحاتك', text_en: 'We value your feedback', showWhatsapp: true, showEmail: true, showPhone: false, showAddress: false } },
    ],
  },
  {
    id: 'organic', icon: '🌿', label_ar: 'طبيعي', label_en: 'Organic', desc_ar: 'أصالة طبيعية تُبني على الثقة', desc_en: 'Honest, earthy trust builder',
    theme: { palette: 'sage', font: 'classic', radius: 20, density: 'comfy', custom: {} },
    sections: [
      { type: 'hero', props: { layout: 'full', align: 'center', height: 'tall', badge_ar: 'طبيعي ١٠٠٪', badge_en: '100% natural', title_ar: 'طيف', title_en: 'Taif', subtitle_ar: 'من الأرض إلى بين يديك — بلا وسطاء ومعاملات جائرة', subtitle_en: 'From the earth to your hands — fair and honest', image: 'https://picsum.photos/seed/mawrid-org/1400/1200', overlay: 48, cta1Label_ar: 'اكتشف', cta1Label_en: 'Explore', cta1Href: '#products', cta2Label_ar: 'رحلتنا', cta2Label_en: 'Our journey', cta2Href: '#about' } },
      { type: 'featured', props: { title_ar: 'منتجاتنا', title_en: 'Our products', eyebrow_ar: 'حصاد هذا الموسم', eyebrow_en: 'This season', source: 'all', limit: 8, layout: 'grid', showPrice: true, cartBtn: 'inline' } },
      { type: 'about', props: { title_ar: 'من نحن', title_en: 'Who we are', eyebrow_ar: 'رحلتنا', eyebrow_en: 'Our journey', text_ar: '', text_en: '', image: 'https://picsum.photos/seed/mawrid-green/1100/900', signature: 'مزارعو طيف', bullets: [] } },
      { type: 'stats', props: { title_ar: '', title_en: '', eyebrow_ar: 'أثرنا', eyebrow_en: 'Our impact', items: [] } },
      { type: 'faq', props: { title_ar: 'أسئلة شائعة', title_en: 'FAQ', eyebrow_ar: 'قبل أن تسألي', eyebrow_en: 'Before you ask', items: [] } },
      { type: 'testimonials', props: { title_ar: 'قالوا عنا', title_en: 'Kind words', eyebrow_ar: 'عملاؤنا', eyebrow_en: 'Our clients', items: [] } },
      { type: 'cta', props: { title_ar: 'ابدئي رحلتك معنا', title_en: 'Start your journey', text_ar: '', text_en: '', button_ar: 'منتجاتنا', button_en: 'Our products', href: '#products', tint: true } },
      { type: 'contact', props: { title_ar: 'تواصل معنا', title_en: 'Get in touch', text_ar: '', text_en: '', showWhatsapp: true, showEmail: true, showPhone: true, showAddress: true } },
    ],
  },
  {
    id: 'chic', icon: '♛', label_ar: 'شيك', label_en: 'Chic', desc_ar: 'فخامة شوكولاتية دافئة وعالمية', desc_en: 'Warm chocolate sophistication',
    theme: { palette: 'choc', font: 'editorial', radius: 16, density: 'airy', custom: {} },
    sections: [
      { type: 'hero', props: { layout: 'split', align: 'start', height: 'tall', eyebrow_ar: 'مجموعة الشتاء', eyebrow_en: 'Winter collection', badge_ar: 'جديد', badge_en: 'New', title_ar: 'طيف بريميوم', title_en: 'Taif Premium', subtitle_ar: 'لمسات دافئة وفخامة كُتبت بهدوء', subtitle_en: 'Warm touches and quiet luxury', image: 'https://picsum.photos/seed/mawrid-choc/1200/1500', cta1Label_ar: 'اكتشف القطع', cta1Label_en: 'Discover pieces', cta1Href: '#products', cta2Label_ar: 'أتيليرنا', cta2Label_en: 'Our atelier', cta2Href: '#about' } },
      { type: 'marquee', props: { text_ar: 'تغليف هدايا فاخر — توصيل نفس اليوم في الرياض — خياطة يدوية', text_en: 'Luxury gift wrap — same-day Riyadh delivery — hand tailoring', speed: 24 } },
      { type: 'featured', props: { title_ar: 'القطع المختارة', title_en: 'Curated pieces', eyebrow_ar: 'اختيارات القيّمة', eyebrow_en: 'Curator\'s pick', source: 'featured', limit: 6, layout: 'editorial', showPrice: true, cartBtn: 'overlay' } },
      { type: 'lookbook', props: { title_ar: 'إطلالات الشتاء', title_en: 'Winter looks', eyebrow_ar: 'من الكتالوج', eyebrow_en: 'From the catalogue', columns: 3, images: [] } },
      { type: 'stats', props: { title_ar: '', title_en: '', eyebrow_ar: 'بالأرقام', eyebrow_en: 'The numbers', items: [] } },
      { type: 'about', props: { title_ar: 'أتيليّـرنا', title_en: 'Our atelier', eyebrow_ar: 'خلف الكواليس', eyebrow_en: 'Behind the scenes', text_ar: '', text_en: '', image: 'https://picsum.photos/seed/mawrid-moody/1100/900', signature: 'لؤي — المدير الإبداعي', bullets: [] } },
      { type: 'testimonials', props: { title_ar: 'قالوا عنا', title_en: 'Kind words', eyebrow_ar: 'آراء العميلات', eyebrow_en: 'Client words', items: [] } },
      { type: 'cta', props: { title_ar: 'أنشئي إطلالة لا تُنسى', title_en: 'Create an unforgettable look', text_ar: '', text_en: '', button_ar: 'احجزي استشارة', button_en: 'Book a consult', href: '#contact', tint: true } },
      { type: 'contact', props: { title_ar: 'تواصل معنا', title_en: 'Get in touch', text_ar: 'فريقنا جاهز على مدار الساعة', text_en: 'Our team is here around the clock', showWhatsapp: true, showEmail: true, showPhone: true, showAddress: true } },
    ],
  },
  {
    id: 'plum', icon: '🥂', label_ar: 'خمري', label_en: 'Plum', desc_ar: 'سهرة فاخرة وحِرفة مملكية', desc_en: 'Evening elegance, royal craft',
    theme: { palette: 'plum', font: 'editorial', radius: 8, density: 'comfy', custom: {} },
    sections: [
      { type: 'hero', props: { layout: 'full', align: 'center', height: 'tall', badge_ar: 'فستان السهرة', badge_en: 'Evening gala', eyebrow_ar: 'المجموعة المميزة', eyebrow_en: 'Signature collection', title_ar: 'طيف ليل', title_en: 'Taif Noir', subtitle_ar: 'حيث يلتقي السكون بالبريق', subtitle_en: 'Where stillness meets sparkle', image: 'https://picsum.photos/seed/mawrid-plum/1400/1600', overlay: 58, cta1Label_ar: 'اكتشفي', cta1Label_en: 'Explore', cta1Href: '#products', cta2Label_ar: 'جلسة خاصة', cta2Label_en: 'Private session', cta2Href: '#contact' } },
      { type: 'featured', props: { title_ar: 'فساتين السهرة', title_en: 'Evening gowns', eyebrow_ar: 'لأهم الليالي', eyebrow_en: 'For your biggest nights', source: 'featured', limit: 6, layout: 'editorial', showPrice: true, cartBtn: 'inline' } },
      { type: 'about', props: { title_ar: 'الحِرفة', title_en: 'The craft', eyebrow_ar: 'خياطة يدوية', eyebrow_en: 'By hand', text_ar: '', text_en: '', image: 'https://picsum.photos/seed/mawrid-soiree/1100/900', signature: 'استوديو طيف', bullets: [] } },
      { type: 'stats', props: { title_ar: '', title_en: '', eyebrow_ar: 'لمسات نهائية', eyebrow_en: 'The finish', items: [] } },
      { type: 'testimonials', props: { title_ar: 'قالت عنها العميلات', title_en: 'Client whispers', eyebrow_ar: 'آراء', eyebrow_en: 'Reviews', items: [] } },
      { type: 'cta', props: { title_ar: 'احجز قطعتك قبل المناسبة', title_en: 'Reserve before the big night', text_ar: 'خياطة مخصصة خلال ٧ أيام.', text_en: 'Bespoke tailoring within 7 days.', button_ar: 'احجزي الآن', button_en: 'Reserve now', href: '#contact', tint: true } },
      { type: 'contact', props: { title_ar: 'تواصل معنا', title_en: 'Get in touch', text_ar: 'نستقبل حجوزات الجلسات الخاصة', text_en: 'Private appointment bookings open', showWhatsapp: true, showEmail: true, showPhone: true, showAddress: false } },
    ],
  },
];

function Field({ field, value, onChange, dir, onPickImage, sectionId }) {
  const label = dir === 'rtl' ? field.label_ar : field.label_en;
  if (field.type === 'textarea') {
    return (
      <div className="ss-f ss-f--area">
        <label>{label}</label>
        <textarea rows={3} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  if (field.type === 'select') {
    const options = field.options || [];
    const isSegmented = options.length <= 4 && options.every((o) => o.label_ar.length < 16);
    if (isSegmented) {
      return (
        <div className="ss-f">
          <label>{label}</label>
          <div className="ss-seg">
            {options.map((o) => (
              <button key={o.value} type="button" className={String(value ?? '') === o.value ? 'is-active' : ''} onClick={() => onChange(o.value)}>
                {dir === 'rtl' ? o.label_ar : o.label_en}
              </button>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="ss-f">
        <label>{label}</label>
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
          {(options || []).map((o) => (
            <option key={o.value} value={o.value}>{dir === 'rtl' ? o.label_ar : o.label_en}</option>
          ))}
        </select>
      </div>
    );
  }
  if (field.type === 'number') {
    return (
      <div className="ss-f">
        <label>{label}</label>
        <input
          type="number"
          min={field.min}
          max={field.max}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
      </div>
    );
  }
  if (field.type === 'toggle') {
    return (
      <div className="ss-f ss-f--toggle">
        <span>{label}</span>
        <button type="button" className={`ss-switch${value ? ' is-on' : ''}`} onClick={() => onChange(!value)} aria-pressed={!!value}>
          <i />
        </button>
      </div>
    );
  }
  if (field.type === 'image') {
    return (
      <div className="ss-f">
        <label>{label}</label>
        <MediaThumb value={String(value ?? '')} onChange={onChange} onPick={() => onPickImage(sectionId, field.k)} dir={dir} />
      </div>
    );
  }
  if (field.type === 'list') {
    return (
      <div className="ss-f">
        <label>{label}</label>
        <ListEditor field={field} value={Array.isArray(value) ? value : []} onChange={onChange} dir={dir} onPickImage={onPickImage} sectionId={sectionId} />
      </div>
    );
  }
  return (
    <div className="ss-f">
      <label>{label}</label>
      <input
        type="text"
        value={String(value ?? '')}
        placeholder={field.placeholder || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function MediaThumb({ value, onChange, onPick, dir }) {
  return (
    <div className={`ss-img${value ? ' has-img' : ''}`} onClick={onPick}>
      {value ? <img src={value} alt="" /> : <span className="ss-img__empty">🖼 {dir === 'rtl' ? 'اضغط لإضافة صورة' : 'Tap to add an image'}</span>}
      {value && (
        <div className="ss-img__over" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="ss-img__act" onClick={onPick}>{dir === 'rtl' ? 'تغيير' : 'Change'}</button>
          <button type="button" className="ss-img__act ss-img__act--del" onClick={() => onChange('')}>{dir === 'rtl' ? 'إزالة' : 'Remove'}</button>
        </div>
      )}
    </div>
  );
}

function ListEditor({ field, value, onChange, dir, onPickImage, sectionId }) {
  const add = () => onChange([...value, field.blank ? field.blank() : {}]);
  const setItem = (i, k, v) => {
    const next = value.map((it, j) => (j === i ? { ...it, [k]: v } : it));
    onChange(next);
  };
  const remove = (i) => onChange(value.filter((_, j) => j !== i));
  return (
    <div className="ss-list">
      {value.length === 0 && <p className="ss-list__empty">{dir === 'rtl' ? 'لا عناصر بعد — اضغط "إضافة"' : 'No items yet — tap Add'}</p>}
      {value.map((item, i) => (
        <div className="ss-list__item" key={i}>
          <div className="ss-list__head">
            <span>
              {field.titleKey && item[field.titleKey]
                ? String(item[field.titleKey]).slice(0, 28)
                : `${dir === 'rtl' ? 'عنصر' : 'Item'} ${i + 1}`}
            </span>
            <button type="button" className="ss-list__del" onClick={() => remove(i)} aria-label={dir === 'rtl' ? 'حذف' : 'Remove'}>✕</button>
          </div>
          <div className="ss-list__body">
            {(field.itemFields || []).map((sub, j) => (
              <Field key={j} field={sub} value={item[sub.k]} onChange={(v) => setItem(i, sub.k, v)} dir={dir} onPickImage={onPickImage} sectionId={sectionId} />
            ))}
          </div>
        </div>
      ))}
      <button type="button" className="ss-list__add" onClick={add}>+ {dir === 'rtl' ? 'إضافة' : 'Add'}</button>
    </div>
  );
}

function ColorRow({ label, value, onChange }) {
  return (
    <div className="ss-color">
      <span>{label}</span>
      <div>
        <span className="ss-color__hex">{String(value || '#000000').toUpperCase()}</span>
        <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export default function StoreStudio({
  uid, store, onChange, seller, dir, isPending, onExit,
  selectedId, onSelectSection,
  onPickImage,
  savedHint,
  panel, setPanel,
  onAddAt,
}) {
  const { dir: langDir } = useLanguage();
  const rtl = (dir == null ? langDir : dir) === 'rtl';
  const L = (ar, en) => (rtl ? ar : en);

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [slugState, setSlugState] = useState('idle');

  const theme = store?.theme || DEFAULT_THEME;
  const slug = slugify(store?.slug || '');
  const isPublished = store?.status === 'published';

  const editingSection = selectedId ? store.sections.find((s) => s.id === selectedId) || null : null;
  const sheetTitle = editingSection
    ? sectionLabel(editingSection.type, rtl ? 'rtl' : 'ltr')
    : panel === 'add' ? L('إضافة قسم', 'Add section')
    : panel === 'design' ? L('تصميم المتجر', 'Design')
    : panel === 'settings' ? L('إعدادات المتجر', 'Settings')
    : L('أقسام المتجر', 'Sections');

  const sheetOpen = !!editingSection || !!panel;

  const patchTheme = (p) => onChange({ ...store, theme: { ...store.theme, ...p } });
  const patchCustom = (p) => onChange({ ...store, theme: { ...store.theme, custom: { ...(store.theme?.custom || {}), ...p } } });
  const patchSettings = (p) => onChange({ ...store, settings: { ...store.settings, ...p } });
  const patchSeo = (p) => onChange({ ...store, seo: { ...(store.seo || {}), ...p } });

  const patchSection = (id, p) => onChange({
    ...store,
    sections: store.sections.map((sec) => (sec.id === id ? { ...sec, props: { ...(sec.props || {}), ...p } } : sec)),
  });

  const toggleSection = (id) => onChange({
    ...store,
    sections: store.sections.map((sec) => (sec.id === id ? { ...sec, visible: sec.visible !== false ? false : true } : sec)),
  });

  const removeSection = (id) => {
    onChange({ ...store, sections: store.sections.filter((sec) => sec.id !== id) });
    if (selectedId === id) onSelectSection(null);
  };

  const addSection = (type) => {
    if (onAddAt) { onAddAt(type); return; }
    const sec = makeSection(type, rtl ? 'rtl' : 'ltr');
    if (!sec) return;
    onChange({ ...store, sections: [...store.sections, sec] });
    onSelectSection(sec.id);
    setPanel(null);
  };

  const seedSectionLists = (section) => {
    const p = section.props || {};
    const list = {
      lookbook: () => (p.images && p.images.length ? null : { images: DEMO_LOOKS }),
      about: () => (p.bullets && p.bullets.length ? null : { bullets: DEMO_ABOUT_BULLETS }),
      testimonials: () => (p.items && p.items.length ? null : { items: DEMO_TESTIMONIALS }),
      faq: () => (p.items && p.items.length ? null : { items: DEMO_FAQ }),
      stats: () => (p.items && p.items.length ? null : { items: DEMO_STATS }),
    }[section.type];
    return list ? { ...section, props: { ...p, ...(list() || {}) } } : section;
  };

  const applyTemplate = (tpl) => {    const dir = rtl ? 'rtl' : 'ltr';
    const built = (tpl.sections || []).map(({ type, props }) => {
      const sec = makeSection(type, dir);
      if (!sec) return null;
      return { ...sec, props: { ...sec.props, ...props } };
    }).filter(Boolean).map(seedSectionLists);
    onChange({
      ...store,
      theme: { ...tpl.theme, custom: {} },
      sections: built.length ? built : store.sections,
    });
    setPanel('design');
  };

  const publish = async (targetStatus) => {
    const next = { ...store, status: targetStatus };
    onChange(next);
    setSaving(true);
    let localOnly = true;
    try {
      if (next.seller_id) {
        const res = await saveStorefront(next);
        localOnly = res.localOnly || !res.ok;
      }
    } catch {}
    if (localOnly && uid) {
      try { localStorage.setItem(`mawrid_storefront_${uid}`, JSON.stringify(next)); } catch {}
    }
    setSaving(false);
    setSavedMsg(localOnly ? L('حُفظ محلياً ✓', 'Saved locally ✓') : (targetStatus === 'published' ? L('تم النشر ✓', 'Published ✓') : L('تم الحفظ ✓', 'Saved ✓')));
    setTimeout(() => setSavedMsg(''), 2600);
  };

  const checkSlug = async () => {
    if (!slug || !store.seller_id) { setSlugState('ok'); return; }
    setSlugState('checking');
    const ok = await isSlugAvailable(slug, store.seller_id);
    setSlugState(ok ? 'ok' : 'taken');
  };

  useEffect(() => {
    let alive = true;
    if (slugState !== 'idle' || !slug || !store.seller_id) return;
    setSlugState('checking');
    isSlugAvailable(slug, store.seller_id).then((ok) => {
      if (alive) setSlugState(ok ? 'ok' : 'taken');
    });
    return () => { alive = false; };
  }, [slug, slugState, store.seller_id]);

  const closeSheet = () => {
    onSelectSection(null);
    setPanel(null);
  };

  return (
    <>
      {/* Sheet (contextual) */}
      {sheetOpen && (
        <div className={`ss-sheet${rtl ? '' : ' ss-sheet--ltr'}`}>
          <div className="ss-sheet__head">
            <b>{sheetTitle}</b>
            {editingSection && (
              <div className="ss-sheet__mini">
                <button type="button" onClick={() => toggleSection(editingSection.id)} title={L('إظهار/إخفاء', 'Show/Hide')}>{editingSection.visible === false ? '◐' : '👁'}</button>
              </div>
            )}
            <button type="button" className="ss-sheet__close" onClick={closeSheet}>✕</button>
          </div>
          <div className="ss-sheet__body">
            {editingSection ? (
              <>
                <div className="ss-livetip">
                  <b>✱</b>
                  <span>{L('التعديلات تظهر على الصفحة مباشرة', 'Changes apply to your page instantly')}</span>
                </div>
                {(SECTION_TYPES[editingSection.type]?.fields || []).map((field, j) => (
                  <Field
                    key={j}
                    field={field}
                    value={editingSection.props?.[field.k]}
                    onChange={(v) => patchSection(editingSection.id, { [field.k]: v })}
                    dir={rtl ? 'rtl' : 'ltr'}
                    onPickImage={onPickImage}
                    sectionId={editingSection.id}
                  />
                ))}
                <button type="button" className="ss-sheet__delete" onClick={() => removeSection(editingSection.id)}>
                  🗑 {L('حذف هذا القسم', 'Delete this section')}
                </button>
              </>
            ) : panel === 'add' ? (
              <>
                <p className="ss-sheet__sub">{L('اختر نوع القسم — يُضاف في الموضع الذي ضغطت فيه على ＋', 'Pick a section type — added where you tapped ＋')}</p>
                <div className="ss-grid">
                  {Object.entries(SECTION_TYPES).map(([type, def]) => (
                    <button key={type} type="button" className="ss-tile" onClick={() => addSection(type)}>
                      <i>{def.icon}</i>
                      <span>{rtl ? def.label_ar : def.label_en}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : panel === 'design' ? (
              <>
                <div className="ss__block">
                  <h4>{L('قوالب جاهزة', 'Ready templates')}</h4>
                  <div className="ss__templates">
                    {TEMPLATES.map((tpl) => (
                      <button key={tpl.id} type="button" className={theme.palette === tpl.theme.palette && theme.font === tpl.theme.font ? 'is-active' : ''} onClick={() => applyTemplate(tpl)}>
                        <i style={{ background: getPalette(tpl.theme.palette).bg, color: getPalette(tpl.theme.palette).ink }}><em style={{ background: getPalette(tpl.theme.palette).primary }} /></i>
                        <span><b>{tpl.icon} {rtl ? tpl.label_ar : tpl.label_en}</b><small>{rtl ? tpl.desc_ar : tpl.desc_en}</small></span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="ss__block">
                  <h4>{L('الألوان', 'Colours')}</h4>
                  <div className="ss__palettes">
                    {PALETTES.map((p) => (
                      <button key={p.id} type="button" className={theme.palette === p.id ? 'is-active' : ''} onClick={() => patchTheme({ palette: p.id })}>
                        <i style={{ background: `linear-gradient(135deg, ${p.bg} 0%, ${p.surface} 60%)`, color: p.ink }}><b style={{ background: p.primary }} /></i>
                        {rtl ? p.label_ar : p.label_en}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="ss__block">
                  <h4>{L('الخطوط', 'Fonts')}</h4>
                  <div className="ss__fonts">
                    {FONT_PRESETS.map((f) => (
                      <button key={f.id} type="button" className={theme.font === f.id ? 'is-active' : ''} onClick={() => patchTheme({ font: f.id })}>
                        <b style={{ fontFamily: f.head }}>ع</b>
                        <span>{rtl ? f.label_ar : f.label_en}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="ss__block">
                  <h4>{L('ألوان مخصصة', 'Custom colours')}</h4>
                  <div className="ss__colors">
                    {[['primary', L('الرئيسي', 'Primary')], ['accent', L('الثانوي', 'Accent')], ['bg', L('الخلفية', 'Background')], ['surface', L('البطاقات', 'Cards')], ['ink', L('النص', 'Text')]].map(([k, label]) => (
                      <ColorRow key={k} label={label} value={theme.custom?.[k] || getPalette(theme.palette)[k]} onChange={(v) => patchCustom({ [k]: v })} />
                    ))}
                  </div>
                </div>
                <div className="ss__block">
                  <h4>{L('المقاس والكثافة', 'Shape')}</h4>
                  <div className="ss-f">
                    <label>{L('انحناء الحواف', 'Corner radius')} — {theme.radius}px</label>
                    <input type="range" min={4} max={32} value={theme.radius ?? 18} onChange={(e) => patchTheme({ radius: Number(e.target.value) })} />
                  </div>
                  <div className="ss-f">
                    <label>{L('الكثافة', 'Density')}</label>
                    <div className="ss-seg">
                      {[['compact', L('مضغوط', 'Tight')], ['comfy', L('مريح', 'Comfy')], ['airy', L('واسع', 'Airy')]].map(([v, label]) => (
                        <button key={v} type="button" className={theme.density === v ? 'is-active' : ''} onClick={() => patchTheme({ density: v })}>{label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="ss__block">
                  <h4>{L('رابط المتجر', 'Store link')}</h4>
                  <div className="ss-slug">
                    <span>/store/</span>
                    <input type="text" value={store.slug || ''} dir="ltr" onChange={(e) => onChange({ ...store, slug: slugify(e.target.value) })} onBlur={checkSlug} />
                  </div>
                  <div className="ss-slug-state">
                    {slugState === 'checking' && <span className="is-check">{L('جارٍ التحقق…', 'Checking…')}</span>}
                    {slugState === 'ok' && <span className="is-ok">✓ {L('متاح', 'Available')}</span>}
                    {slugState === 'taken' && <span className="is-bad">✕ {L('مستخدم', 'Taken')}</span>}
                  </div>
                </div>
                <div className="ss__block">
                  <h4>{L('عن المتجر', 'Identity')}</h4>
                  <div className="ss-f"><label>{L('الشعار المختصر (عربي)', 'Tagline (AR)')}</label><input type="text" value={store.settings?.tagline_ar || ''} onChange={(e) => patchSettings({ tagline_ar: e.target.value })} /></div>
                  <div className="ss-f"><label>{L('الشعار المختصر (إنجليزي)', 'Tagline (EN)')}</label><input type="text" value={store.settings?.tagline_en || ''} onChange={(e) => patchSettings({ tagline_en: e.target.value })} /></div>
                  <div className="ss-f ss-f--toggle">
                    <span>{L('شريط الإعلان', 'Announcement bar')}</span>
                    <button type="button" className={`ss-switch${store.settings?.announcementOn ? ' is-on' : ''}`} onClick={() => patchSettings({ announcementOn: !store.settings?.announcementOn })} aria-pressed={!!store.settings?.announcementOn}><i /></button>
                  </div>
                  {store.settings?.announcementOn && (<>
                    <div className="ss-f"><label>{L('الإعلان (عربي)', 'Announcement (AR)')}</label><input type="text" value={store.settings?.announcement_ar || ''} onChange={(e) => patchSettings({ announcement_ar: e.target.value })} /></div>
                    <div className="ss-f"><label>{L('الإعلان (إنجليزي)', 'Announcement (EN)')}</label><input type="text" value={store.settings?.announcement_en || ''} onChange={(e) => patchSettings({ announcement_en: e.target.value })} /></div>
                    <div className="ss-f"><label>{L('رابط الإعلان', 'Announcement link')}</label><input type="text" dir="ltr" value={store.settings?.announcementHref || ''} onChange={(e) => patchSettings({ announcementHref: e.target.value })} /></div>
                  </>)}
                </div>
                <div className="ss__block">
                  <h4>{L('التواصل', 'Contact')}</h4>
                  {[['whatsapp', L('واتساب', 'WhatsApp')], ['email', L('البريد', 'Email')], ['phone', L('الهاتف', 'Phone')], ['address', L('العنوان', 'Address')], ['hours', L('ساعات العمل', 'Hours')]].map(([k, label]) => (
                    <div className="ss-f" key={k}><label>{label}</label><input type="text" dir="ltr" value={store.settings?.[k] || ''} onChange={(e) => patchSettings({ [k]: e.target.value })} /></div>
                  ))}
                </div>
                <div className="ss__block">
                  <h4>{L('الشحن والإرجاع', 'Policies')}</h4>
                  <div className="ss-f"><label>{L('الشحن (عربي)', 'Shipping (AR)')}</label><textarea rows={2} value={store.settings?.shipping_ar || ''} onChange={(e) => patchSettings({ shipping_ar: e.target.value })} /></div>
                  <div className="ss-f"><label>{L('الشحن (إنجليزي)', 'Shipping (EN)')}</label><textarea rows={2} value={store.settings?.shipping_en || ''} onChange={(e) => patchSettings({ shipping_en: e.target.value })} /></div>
                  <div className="ss-f"><label>{L('الإرجاع (عربي)', 'Returns (AR)')}</label><textarea rows={2} value={store.settings?.return_ar || ''} onChange={(e) => patchSettings({ return_ar: e.target.value })} /></div>
                  <div className="ss-f"><label>{L('الإرجاع (إنجليزي)', 'Returns (EN)')}</label><textarea rows={2} value={store.settings?.return_en || ''} onChange={(e) => patchSettings({ return_en: e.target.value })} /></div>
                </div>
                <div className="ss__block">
                  <h4>{L('السوشيال ميديا', 'Social')}</h4>
                  <button type="button" className="ss__linkbtn" onClick={() => patchSettings({ socials: [...(store.settings?.socials || []), { label: 'instagram', url: '' }] })}>+ {L('إضافة شبكة', 'Add network')}</button>
                  {(store.settings?.socials || []).map((s, i) => (
                    <div className="ss__social" key={i}>
                      <input type="text" dir="ltr" placeholder={L('الشبكة', 'Network')} value={s.label || ''} onChange={(e) => { const arr = [...(store.settings?.socials || [])]; arr[i] = { ...arr[i], label: e.target.value }; patchSettings({ socials: arr }); }} />
                      <input type="text" dir="ltr" placeholder="https://" value={s.url || ''} onChange={(e) => { const arr = [...(store.settings?.socials || [])]; arr[i] = { ...arr[i], url: e.target.value }; patchSettings({ socials: arr }); }} />
                      <button type="button" className="ss__mini ss__mini--danger" onClick={() => patchSettings({ socials: (store.settings?.socials || []).filter((_, j) => j !== i) })}>🗑</button>
                    </div>
                  ))}
                </div>
                <div className="ss__block">
                  <h4>SEO</h4>
                  <div className="ss-f"><label>{L('العنوان', 'Title')}</label><input type="text" value={store.seo?.title || ''} onChange={(e) => patchSeo({ title: e.target.value })} /></div>
                  <div className="ss-f"><label>{L('الوصف', 'Description')}</label><textarea rows={2} value={store.seo?.description || ''} onChange={(e) => patchSeo({ description: e.target.value })} /></div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Dock */}
      <div className={`ss${rtl ? '' : ' ss--ltr'}`}>
        <div className="ss__dock">
          <div className="ss__dock-brand">
            <span className="ss__dock-logo">🛍️</span>
            <span className="ss__dock-title">
              <b>{seller?.store_name || 'المتجر'}</b>
              <em className={`ss__pill${isPublished ? ' is-live' : ''}`}>{isPublished ? L('منشور', 'Live') : L('مسودة', 'Draft')}</em>
            </span>
          </div>

          <div className="ss__dock-actions">
            <button type="button" className={panel === 'add' ? 'is-active' : ''} onClick={() => { onSelectSection(null); setPanel(panel === 'add' ? null : 'add'); }}>
              <i>＋</i> {L('قسم', 'Section')}
            </button>
            <button type="button" className={panel === 'design' ? 'is-active' : ''} onClick={() => { onSelectSection(null); setPanel(panel === 'design' ? null : 'design'); }}>
              <i>🎨</i> {L('تصميم', 'Design')}
            </button>
            <button type="button" className={panel === 'settings' ? 'is-active' : ''} onClick={() => { onSelectSection(null); setPanel(panel === 'settings' ? null : 'settings'); }}>
              <i>⚙</i> {L('إعدادات', 'Settings')}
            </button>
          </div>

          <div className="ss__dock-status">
            {savedMsg && <span className="ss__saved">{savedMsg}</span>}
            {savedHint && <span className="ss__saved">{savedHint}</span>}
            {!isPending && (
              isPublished ? (
                <button type="button" className="ss__btn ss__btn--soft" disabled={saving} onClick={() => publish('draft')}>{L('إلغاء النشر', 'Unpublish')}</button>
              ) : (
                <button type="button" className="ss__btn ss__btn--primary" disabled={saving} onClick={() => publish('published')}>{saving ? L('…', '…') : L('نشر المتجر', 'Publish')}</button>
              )
            )}
            <button type="button" className="ss__dock-exit" onClick={onExit} title={L('إنهاء التحرير', 'Exit editor')}>✕ {L('تم', 'Done')}</button>
          </div>
        </div>
      </div>
    </>
  );
}