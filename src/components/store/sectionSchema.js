export const SECTION_GROUPS = [
  { id: 'hero', label_ar: 'الواجهة', label_en: 'Hero' },
  { id: 'shop', label_ar: 'المتجر', label_en: 'Shop' },
  { id: 'content', label_ar: 'المحتوى', label_en: 'Content' },
  { id: 'contact', label_ar: 'التواصل', label_en: 'Contact' },
];

const f = (type) => (k, label_ar, label_en, extra = {}) => ({ k, type, label_ar, label_en, ...extra });
const txt = f('text');
const area = f('textarea');
const img = f('image');
const sel = f('select');
const num = f('number');
const tog = f('toggle');
const list = f('list');

const ALIGN = [
  { value: 'start', label_ar: 'بداية', label_en: 'Start' },
  { value: 'center', label_ar: 'وسط', label_en: 'Center' },
  { value: 'end', label_ar: 'نهاية', label_en: 'End' },
];
const HEIGHT = [
  { value: 'short', label_ar: 'قصير', label_en: 'Short' },
  { value: 'tall', label_ar: 'كامل', label_en: 'Tall' },
  { value: 'full', label_ar: 'ملء الشاشة', label_en: 'Full screen' },
];

export const SECTION_TYPES = {
  hero: {
    label_ar: 'واجهة رئيسية',
    label_en: 'Hero',
    icon: '★',
    group: 'hero',
    defaults: {
      layout: 'full', align: 'center', height: 'tall',
      eyebrow_ar: '', eyebrow_en: '',
      title_ar: '', title_en: '',
      subtitle_ar: '', subtitle_en: '',
      image: '', badge_ar: '', badge_en: '', overlay: 48,
      cta1Label_ar: '', cta1Label_en: '', cta1Href: '',
      cta2Label_ar: '', cta2Label_en: '', cta2Href: '',
    },
    fields: [
      sel('layout', 'التخطيط', 'Layout', {
        options: [
          { value: 'full', label_ar: 'خلفية كاملة', label_en: 'Full image' },
          { value: 'split', label_ar: 'صورة + نص', label_en: 'Split' },
          { value: 'minimal', label_ar: 'بسيط', label_en: 'Minimal' },
        ],
      }),
      sel('align', 'المحاذاة', 'Alignment', { options: ALIGN }),
      sel('height', 'الارتفاع', 'Height', { options: HEIGHT }),
      txt('eyebrow_ar', 'سطر علوي (عربي)', 'Eyebrow (AR)'),
      txt('eyebrow_en', 'سطر علوي (إنجليزي)', 'Eyebrow (EN)'),
      txt('title_ar', 'العنوان (عربي)', 'Title (AR)'),
      txt('title_en', 'العنوان (إنجليزي)', 'Title (EN)'),
      area('subtitle_ar', 'الوصف (عربي)', 'Subtitle (AR)'),
      area('subtitle_en', 'الوصف (إنجليزي)', 'Subtitle (EN)'),
      txt('badge_ar', 'شارة (عربي)', 'Badge (AR)'),
      txt('badge_en', 'شارة (إنجليزي)', 'Badge (EN)'),
      img('image', 'الصورة', 'Image'),
      num('overlay', 'تعتم الصورة %', 'Image overlay %', { min: 0, max: 90 }),
      txt('cta1Label_ar', 'زر 1 (عربي)', 'Button 1 (AR)'),
      txt('cta1Label_en', 'زر 1 (إنجليزي)', 'Button 1 (EN)'),
      txt('cta1Href', 'رابط زر 1', 'Button 1 link', { placeholder: '#products أو رابط' }),
      txt('cta2Label_ar', 'زر 2 (عربي)', 'Button 2 (AR)'),
      txt('cta2Label_en', 'زر 2 (إنجليزي)', 'Button 2 (EN)'),
      txt('cta2Href', 'رابط زر 2', 'Button 2 link'),
    ],
  },
  marquee: {
    label_ar: 'شريط متحرك',
    label_en: 'Marquee',
    icon: '☰',
    group: 'content',
    defaults: { text_ar: 'شحن سريع • جودة مضمونة • تواصل مباشر', text_en: 'Fast shipping • Guaranteed quality • Direct contact', speed: 26 },
    fields: [
      txt('text_ar', 'النص (عربي)', 'Text (AR)'),
      txt('text_en', 'النص (إنجليزي)', 'Text (EN)'),
      num('speed', 'السرعة (ثانية)', 'Speed (s)', { min: 8, max: 60 }),
    ],
  },
  featured: {
    label_ar: 'منتجات مميزة',
    label_en: 'Products',
    icon: '▦',
    group: 'shop',
    defaults: { title_ar: 'منتجاتنا', title_en: 'Our products', subtitle_ar: '', subtitle_en: '', source: 'featured', limit: 8, layout: 'grid', showPrice: true },
    fields: [
      txt('title_ar', 'العنوان (عربي)', 'Title (AR)'),
      txt('title_en', 'العنوان (إنجليزي)', 'Title (EN)'),
      txt('subtitle_ar', 'الوصف (عربي)', 'Subtitle (AR)'),
      txt('subtitle_en', 'الوصف (إنجليزي)', 'Subtitle (EN)'),
      sel('source', 'المصدر', 'Source', {
        options: [
          { value: 'featured', label_ar: 'المميّزة فقط', label_en: 'Featured only' },
          { value: 'all', label_ar: 'كل المنتجات', label_en: 'All products' },
        ],
      }),
      sel('layout', 'التخطيط', 'Layout', {
        options: [
          { value: 'grid', label_ar: 'شبكة', label_en: 'Grid' },
          { value: 'editorial', label_ar: 'تحريري', label_en: 'Editorial' },
          { value: 'carousel', label_ar: 'شريط أفقي', label_en: 'Carousel' },
        ],
      }),
      num('limit', 'عدد المنتجات', 'Product count', { min: 2, max: 24 }),
      tog('showPrice', 'إظهار السعر', 'Show price'),
    ],
  },
  categories: {
    label_ar: 'الأقسام',
    label_en: 'Categories',
    icon: '◇',
    group: 'shop',
    defaults: { title_ar: 'تسوّق حسب القسم', title_en: 'Shop by category', layout: 'cards', limit: 8 },
    fields: [
      txt('title_ar', 'العنوان (عربي)', 'Title (AR)'),
      txt('title_en', 'العنوان (إنجليزي)', 'Title (EN)'),
      sel('layout', 'التخطيط', 'Layout', {
        options: [
          { value: 'cards', label_ar: 'بطاقات', label_en: 'Cards' },
          { value: 'chips', label_ar: 'أقراص', label_en: 'Chips' },
        ],
      }),
      num('limit', 'العدد', 'Count', { min: 2, max: 20 }),
    ],
  },
  lookbook: {
    label_ar: 'معرض الصور',
    label_en: 'Lookbook',
    icon: '▣',
    group: 'content',
    defaults: {
      title_ar: 'من أعمالنا', title_en: 'Lookbook', subtitle_ar: '', subtitle_en: '', columns: 3,
      images: [],
    },
    fields: [
      txt('title_ar', 'العنوان (عربي)', 'Title (AR)'),
      txt('title_en', 'العنوان (إنجليزي)', 'Title (EN)'),
      txt('subtitle_ar', 'الوصف (عربي)', 'Subtitle (AR)'),
      txt('subtitle_en', 'الوصف (إنجليزي)', 'Subtitle (EN)'),
      num('columns', 'عدد الأعمدة', 'Columns', { min: 2, max: 4 }),
      list('images', 'الصور', 'Images', {
        titleKey: 'caption_ar',
        blank: () => ({ url: '', caption_ar: '', caption_en: '' }),
        itemFields: [img('url', 'صورة', 'Image'), txt('caption_ar', 'تعليق (عربي)', 'Caption (AR)'), txt('caption_en', 'تعليق (إنجليزي)', 'Caption (EN)')],
      }),
    ],
  },
  about: {
    label_ar: 'من نحن',
    label_en: 'About',
    icon: '❖',
    group: 'content',
    defaults: { title_ar: 'قصتنا', title_en: 'Our story', text_ar: '', text_en: '', image: '', signature: '', bullets: [] },
    fields: [
      txt('title_ar', 'العنوان (عربي)', 'Title (AR)'),
      txt('title_en', 'العنوان (إنجليزي)', 'Title (EN)'),
      area('text_ar', 'النص (عربي)', 'Text (AR)'),
      area('text_en', 'النص (إنجليزي)', 'Text (EN)'),
      img('image', 'الصورة', 'Image'),
      txt('signature', 'التوقيع / الاسم', 'Signature'),
      list('bullets', 'نقاط', 'Highlights', {
        titleKey: 'text_ar',
        blank: () => ({ text_ar: '', text_en: '' }),
        itemFields: [txt('text_ar', 'نص (عربي)', 'Text (AR)'), txt('text_en', 'نص (إنجليزي)', 'Text (EN)')],
      }),
    ],
  },
  stats: {
    label_ar: 'أرقام',
    label_en: 'Stats',
    icon: '#',
    group: 'content',
    defaults: { title_ar: '', title_en: '', items: [] },
    fields: [
      txt('title_ar', 'العنوان (عربي)', 'Title (AR)'),
      txt('title_en', 'العنوان (إنجليزي)', 'Title (EN)'),
      list('items', 'العناصر', 'Items', {
        titleKey: 'label_ar',
        blank: () => ({ value: '', label_ar: '', label_en: '' }),
        itemFields: [txt('value', 'القيمة', 'Value'), txt('label_ar', 'الوصف (عربي)', 'Label (AR)'), txt('label_en', 'الوصف (إنجليزي)', 'Label (EN)')],
      }),
    ],
  },
  testimonials: {
    label_ar: 'آراء العملاء',
    label_en: 'Testimonials',
    icon: '❝',
    group: 'content',
    defaults: { title_ar: 'ماذا يقول عملاؤنا', title_en: 'What clients say', items: [] },
    fields: [
      txt('title_ar', 'العنوان (عربي)', 'Title (AR)'),
      txt('title_en', 'العنوان (إنجليزي)', 'Title (EN)'),
      list('items', 'الآراء', 'Reviews', {
        titleKey: 'name',
        blank: () => ({ name: '', role_ar: '', role_en: '', text_ar: '', text_en: '', avatar: '' }),
        itemFields: [txt('name', 'الاسم', 'Name'), txt('role_ar', 'الصفة (عربي)', 'Role (AR)'), txt('role_en', 'الصفة (إنجليزي)', 'Role (EN)'), area('text_ar', 'النص (عربي)', 'Text (AR)'), area('text_en', 'النص (إنجليزي)', 'Text (EN)'), img('avatar', 'الصورة', 'Avatar')],
      }),
    ],
  },
  faq: {
    label_ar: 'الأسئلة الشائعة',
    label_en: 'FAQ',
    icon: '؟',
    group: 'content',
    defaults: { title_ar: 'الأسئلة الشائعة', title_en: 'Frequently asked', items: [] },
    fields: [
      txt('title_ar', 'العنوان (عربي)', 'Title (AR)'),
      txt('title_en', 'العنوان (إنجليزي)', 'Title (EN)'),
      list('items', 'الأسئلة', 'Questions', {
        titleKey: 'q_ar',
        blank: () => ({ q_ar: '', q_en: '', a_ar: '', a_en: '' }),
        itemFields: [txt('q_ar', 'السؤال (عربي)', 'Question (AR)'), txt('q_en', 'السؤال (إنجليزي)', 'Question (EN)'), area('a_ar', 'الجواب (عربي)', 'Answer (AR)'), area('a_en', 'الجواب (إنجليزي)', 'Answer (EN)')],
      }),
    ],
  },
  richtext: {
    label_ar: 'نص',
    label_en: 'Rich text',
    icon: '¶',
    group: 'content',
    defaults: { title_ar: '', title_en: '', text_ar: '', text_en: '', align: 'start' },
    fields: [
      txt('title_ar', 'العنوان (عربي)', 'Title (AR)'),
      txt('title_en', 'العنوان (إنجليزي)', 'Title (EN)'),
      area('text_ar', 'النص (عربي)', 'Text (AR)'),
      area('text_en', 'النص (إنجليزي)', 'Text (EN)'),
      sel('align', 'المحاذاة', 'Alignment', { options: ALIGN }),
    ],
  },
  cta: {
    label_ar: 'دعوة لاتخاذ إجراء',
    label_en: 'Call to action',
    icon: '➤',
    group: 'content',
    defaults: { title_ar: '', title_en: '', text_ar: '', text_en: '', button_ar: 'اطلب الآن', button_en: 'Order now', href: '#contact', image: '', tint: true },
    fields: [
      txt('title_ar', 'العنوان (عربي)', 'Title (AR)'),
      txt('title_en', 'العنوان (إنجليزي)', 'Title (EN)'),
      txt('text_ar', 'النص (عربي)', 'Text (AR)'),
      txt('text_en', 'النص (إنجليزي)', 'Text (EN)'),
      txt('button_ar', 'الزر (عربي)', 'Button (AR)'),
      txt('button_en', 'الزر (إنجليزي)', 'Button (EN)'),
      txt('href', 'الرابط', 'Link'),
      img('image', 'الصورة', 'Image'),
      tog('tint', 'خلفية ملوّنة', 'Tinted background'),
    ],
  },
  video: {
    label_ar: 'فيديو',
    label_en: 'Video',
    icon: '▶',
    group: 'content',
    defaults: { title_ar: '', title_en: '', url: '', poster: '', caption_ar: '', caption_en: '' },
    fields: [
      txt('title_ar', 'العنوان (عربي)', 'Title (AR)'),
      txt('title_en', 'العنوان (إنجليزي)', 'Title (EN)'),
      f('url')('url', 'رابط الفيديو (mp4/youtube)', 'Video URL (mp4/youtube)'),
      img('poster', 'صورة الغلاف', 'Poster'),
      txt('caption_ar', 'تعليق (عربي)', 'Caption (AR)'),
      txt('caption_en', 'تعليق (إنجليزي)', 'Caption (EN)'),
    ],
  },
  contact: {
    label_ar: 'تواصل معنا',
    label_en: 'Contact',
    icon: '✉',
    group: 'contact',
    defaults: { title_ar: 'تواصل معنا', title_en: 'Get in touch', text_ar: '', text_en: '', showWhatsapp: true, showEmail: true, showPhone: true, showAddress: true, showHours: true },
    fields: [
      txt('title_ar', 'العنوان (عربي)', 'Title (AR)'),
      txt('title_en', 'العنوان (إنجليزي)', 'Title (EN)'),
      txt('text_ar', 'النص (عربي)', 'Text (AR)'),
      txt('text_en', 'النص (إنجليزي)', 'Text (EN)'),
      tog('showWhatsapp', 'إظهار واتساب', 'Show WhatsApp'),
      tog('showEmail', 'إظهار البريد', 'Show email'),
      tog('showPhone', 'إظهار الهاتف', 'Show phone'),
      tog('showAddress', 'إظهار العنوان', 'Show address'),
      tog('showHours', 'إظهار ساعات العمل', 'Show hours'),
    ],
  },
};

export function sectionDef(type) {
  return SECTION_TYPES[type] || null;
}

export function sectionLabel(type, dir) {
  const def = SECTION_TYPES[type];
  if (!def) return type;
  return dir === 'rtl' ? def.label_ar : def.label_en;
}

export function makeSection(type, dir) {
  const def = SECTION_TYPES[type];
  if (!def) return null;
  const id = `sec-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return { id, type, visible: true, props: { ...def.defaults } };
}
