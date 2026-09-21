const IMG = (id) => `https://picsum.photos/seed/mawrid-${id}/900/1200`;

export const DEMO_PRODUCTS = [
  { id: 'demo-p1', name: 'فستان جابر', name_en: 'Jaber Dress', category_id: 'cat-dresses', category_name: 'فساتين', category_name_en: 'Dresses', thumbnail: IMG('d1'), featured: true, price: 340, sale_price: 289, status: 'active' },
  { id: 'demo-p2', name: 'عباية نفيسة', name_en: 'Nafisa Abaya', category_id: 'cat-abayas', category_name: 'عبايات', category_name_en: 'Abayas', thumbnail: IMG('d2'), featured: true, price: 420, sale_price: 0, status: 'active' },
  { id: 'demo-p3', name: 'طقم كشمير', name_en: 'Kashmir Set', category_id: 'cat-sets', category_name: 'طقوم', category_name_en: 'Sets', thumbnail: IMG('d3'), featured: true, price: 560, sale_price: 449, status: 'active' },
  { id: 'demo-p4', name: 'شال حرير', name_en: 'Silk Shawl', category_id: 'cat-misc', category_name: 'إكسسوارات', category_name_en: 'Accessories', thumbnail: IMG('d4'), featured: false, price: 120, sale_price: 0, status: 'active' },
  { id: 'demo-p5', name: 'ثوب قند', name_en: 'Qand Thobe', category_id: 'cat-abayas', category_name: 'عبايات', category_name_en: 'Abayas', thumbnail: IMG('d5'), featured: false, price: 380, sale_price: 0, status: 'active' },
  { id: 'demo-p6', name: 'إطلالة بوهيمية', name_en: 'Bohemian Look', category_id: 'cat-sets', category_name: 'طقوم', category_name_en: 'Sets', thumbnail: IMG('d6'), featured: true, price: 610, sale_price: 499, status: 'active' },
  { id: 'demo-p7', name: 'فستان سهرة', name_en: 'Evening Gown', category_id: 'cat-dresses', category_name: 'فساتين', category_name_en: 'Dresses', thumbnail: IMG('d7'), featured: false, price: 720, sale_price: 0, status: 'active' },
  { id: 'demo-p8', name: 'حقيبة يد', name_en: 'Handbag', category_id: 'cat-misc', category_name: 'إكسسوارات', category_name_en: 'Accessories', thumbnail: IMG('d8'), featured: true, price: 260, sale_price: 199, status: 'active' },
];

export const DEMO_CATEGORIES = [
  { id: 'cat-dresses', name_ar: 'فساتين', name_en: 'Dresses' },
  { id: 'cat-abayas', name_ar: 'عبايات', name_en: 'Abayas' },
  { id: 'cat-sets', name_ar: 'طقوم', name_en: 'Sets' },
  { id: 'cat-misc', name_ar: 'إكسسوارات', name_en: 'Accessories' },
];

export const DEMO_LOOKS = Array.from({ length: 6 }, (_, i) => ({ url: IMG(`look-${i + 1}`), caption_ar: `إطلالة ${i + 1}`, caption_en: `Look ${i + 1}` }));

export const DEMO_TESTIMONIALS = [
  { name: 'سارة', role_ar: 'عميلة منذ ٢٠٢٣', role_en: 'Client since 2023', text_ar: 'جودة غير متوقعة في كل طلب', text_en: 'Unexpected quality, every order', avatar: '' },
  { name: 'نورة', role_ar: 'مصممة أزياء', role_en: 'Fashion designer', text_ar: 'قطع فريدة لا أجدها في أي مكان', text_en: 'Unique pieces found nowhere else', avatar: '' },
  { name: 'ريم', role_ar: 'بلوجرة', role_en: 'Blogger', text_ar: 'الشحن سريع والتغليف فاخر', text_en: 'Fast shipping, luxurious packaging', avatar: '' },
];

export const DEMO_FAQ = [
  { q_ar: 'كم يستغرق الشحن؟', q_en: 'How long does shipping take?', a_ar: '١-٣ أيام داخل السعودية', a_en: '1-3 days across KSA' },
  { q_ar: 'هل يمكن الإرجاع؟', q_en: 'Can I return?', a_ar: 'نعم خلال ١٤ يوماً', a_en: 'Yes, within 14 days' },
  { q_ar: 'هل الدفع عند الاستلام متاح؟', q_en: 'Is cash on delivery available?', a_ar: 'نعم لجميع المناطق', a_en: 'Yes, everywhere' },
];

export const DEMO_ABOUT_BULLETS = ['نختار الأقمشة يدوياً', 'خياطة بإتقان ١٠٠٪', 'قطعات محدودة الإصدار'];
export const DEMO_STATS = [
  { label_ar: 'عميل سعيد', label_en: 'Happy client', value: 1200, suffix_ar: '+', suffix_en: '+' },
  { label_ar: 'منتج', label_en: 'Products', value: 48, suffix_ar: '', suffix_en: '' },
];
