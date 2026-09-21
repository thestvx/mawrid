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

export const DEMO_LOOKS = [
  { url: IMG('look-1'), caption_ar: 'إطلالة الصباح', caption_en: 'Morning look' },
  { url: IMG('look-2'), caption_ar: 'سهرة الخميس', caption_en: 'Thursday night' },
  { url: IMG('look-3'), caption_ar: 'ويكندا تريبة', caption_en: 'Trip weekend' },
  { url: IMG('look-4'), caption_ar: 'إطلالة المكتب', caption_en: 'Office hour' },
  { url: IMG('look-5'), caption_ar: 'ليل الشتاء', caption_en: 'Winter night' },
  { url: IMG('look-6'), caption_ar: 'لقاء الأصدقاء', caption_en: 'Friends meetup' },
];

export const DEMO_TESTIMONIALS = [
  { name: 'سارة', role_ar: 'عميلة منذ ٢٠٢٣', role_en: 'Client since 2023', text_ar: 'جودة غير متوقعة في كل طلب — القماش والخياطة فاقا توقعي.', text_en: 'Unexpected quality, every order — the fabric and tailoring exceeded my expectations.', avatar: 'https://i.pravatar.cc/96?u=sara' },
  { name: 'نورة', role_ar: 'مصممة أزياء', role_en: 'Fashion designer', text_ar: 'قطع فريدة لا أجدها في أي مكان، والتغليف فخم من أول نظرة.', text_en: 'Unique pieces found nowhere else, with packaging that impresses at first sight.', avatar: 'https://i.pravatar.cc/96?u=noura' },
  { name: 'ريم', role_ar: 'بلوجرة', role_en: 'Blogger', text_ar: 'الشحن سريع والتواصل مباشر، جرّبتهم في ثلاث مناسبات وطبعاً سأعود.', text_en: 'Fast shipping and direct contact — worn them three times and I will be back.', avatar: 'https://i.pravatar.cc/96?u=reem' },
  { name: 'خولة', role_ar: 'أم لطفلين', role_en: 'Mom of two', text_ar: 'المقاسات مضبوطة وطلب خاص تم تنفيذه في يومين فقط.', text_en: 'Perfect sizing, and a custom request was done in just two days.', avatar: 'https://i.pravatar.cc/96?u=khawla' },
];

export const DEMO_FAQ = [
  { q_ar: 'كم يستغرق الشحن؟', q_en: 'How long does shipping take?', a_ar: '١-٣ أيام داخل السعودية، ويوم واحد في المدن الرئيسية.', a_en: '1-3 days across KSA, next-day in major cities.' },
  { q_ar: 'هل يمكن الإرجاع؟', q_en: 'Can I return?', a_ar: 'نعم خلال ١٤ يوماً مع بقاء القطعة بحالتها الأصلية.', a_en: 'Yes, within 14 days as long as the item is unused.' },
  { q_ar: 'هل الدفع عند الاستلام متاح؟', q_en: 'Is cash on delivery available?', a_ar: 'نعم لجميع المناطق بدون استثناء.', a_en: 'Yes, available everywhere.' },
  { q_ar: 'هل تعملون بطلب خاص؟', q_en: 'Do you take custom orders?', a_ar: 'بالطبع — مقاسات مخصصة وخامات من اختيارك.', a_en: 'Of course — bespoke sizing and fabrics of your choice.' },
];

export const DEMO_ABOUT_BULLETS = ['نختار الأقمشة يدوياً', 'خياطة بإتقان ١٠٠٪', 'قطع محدودة الإصدار'];
export const DEMO_STATS = [
  { label_ar: 'عميلة سعيدة', label_en: 'Happy clients', value: 1240, suffix_ar: '+', suffix_en: '+' },
  { label_ar: 'تصميم فريد', label_en: 'Unique designs', value: 48, suffix_ar: '', suffix_en: '' },
  { label_ar: 'تقييم العملاء', label_en: 'Client rating', value: 4.9, suffix_ar: '/5', suffix_en: '/5' },
  { label_ar: 'سنة خبرة', label_en: 'Years of craft', value: 9, suffix_ar: '', suffix_en: '' },
];
