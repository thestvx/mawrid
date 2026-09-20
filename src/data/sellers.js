export const SELLER_SPECIALTIES = [
  { key: 'designers', img: '/sellers/icons/designers.png', name_ar: 'مصممين', name_en: 'Designers' },
  { key: 'editors', img: '/sellers/icons/editors.png', name_ar: 'مونتيرين', name_en: 'Video Editors' },
  { key: 'commentators', img: '/sellers/icons/commentators.png', name_ar: 'معلقين صوتي', name_en: 'Commentators' },
  { key: 'creators', img: '/sellers/icons/creators.png', name_ar: 'صنّاع محتوى', name_en: 'Content Creators' },
  { key: 'developers', img: '/sellers/icons/developers.png', name_ar: 'مبرمجين', name_en: 'Developers' },
  { key: 'brands', img: '/sellers/icons/brands.png', name_ar: 'أصحاب براندات', name_en: 'Brand Owners' },
];

export function mapRealSeller(u, i = 0) {
  const key = u.specialty && SELLER_SPECIALTIES.some((s) => s.key === u.specialty)
    ? u.specialty
    : SELLER_SPECIALTIES[i % SELLER_SPECIALTIES.length].key;
  const name = u.name || 'مورّد مَورد';
  const store = u.store_name || '';
  const works = Array.isArray(u.works) ? u.works : [];
  const models = Array.isArray(u.models) ? u.models : [];
  const rating = Number(u.rating) || 0;
  return {
    id: `real-${u.id}`,
    kind: models.length ? 'brand' : 'seller',
    specialtyKey: key,
    name,
    name_en: name,
    brand: store || name,
    role_ar: store ? `متجر ${store}` : 'مورّد على مَورد',
    role_en: store || 'Supplier on Mawrid',
    cover: u.cover || 'linear-gradient(135deg,#ffb199,#a53c00)',
    avatarGradient: 'linear-gradient(135deg,#ff8a3d,#7e2c00)',
    avatar_url: u.avatar_url || '',
    website: u.website || '',
    verified: u.seller_status ? u.seller_status === 'verified' : true,
    bio_ar: u.bio || store || '',
    bio_en: u.bio_en || u.bio || store || '',
    availability: u.availability || 'full',
    hours: { from: u.hours_from || '09:00', to: u.hours_to || '18:00', zone: u.hours_zone || 'GST' },
    stats: { projects: works.length, products: models.length, rating },
    works,
    models,
  };
}

export function buildStoreSlugId(u) {
  const base = (u.store_name || u.name || '').toString().trim().replace(/\s+/g, '-');
  const emoji = ['🇸🇦', '🇦🇪', '🇶🇦', '🇧🇭', '🇰🇼', '🇴🇲'];
  const flag = u.store_country ? emoji[(u.store_country.charCodeAt(0) || 0) % emoji.length] : '';
  if (!base) return `mawrid-${u.id}`;
  return flag ? `mawrid-${flag}-${base}` : `mawrid-${base}`;
}

export function buildBrandCards() {
  return DEMO_BRANDS.map((u, i) => ({ ...mapRealSeller(u, i), id: buildStoreSlugId(u) }));
}

export function findStoreById(id, realSellers = []) {
  if (!id) return null;
  const sid = String(id);
  const realIdx = realSellers.findIndex((u) => sid === `real-${u.id}` || sid === buildStoreSlugId(u));
  if (realIdx !== -1) return mapRealSeller(realSellers[realIdx], realIdx);
  if (sid.startsWith('real-') || sid.startsWith('mawrid-')) {
    const demoIdx = DEMO_BRANDS.findIndex((u) => sid === `real-${u.id}` || sid === buildStoreSlugId(u));
    return demoIdx === -1 ? null : mapRealSeller(DEMO_BRANDS[demoIdx], demoIdx);
  }
  return null;
}

const DEMO_BRAND_IMG = '/images/cards/designcard.png';

export const DEMO_BRANDS = [
  {
    id: 'ufuq-001',
    name: 'Ufuq Wear',
    store_name: 'أفق للملابس',
    specialty: 'brands',
    rating: 4.7,
    verified: true,
    manager: 'سارة العوضي',
    bio: 'تصميم قِطع يومية عصرية بقِصّات مريحة وأقمشة تتنفس — تصنيع محلي بألوان هادئة تليق بكل الأوقات.',
    bio_en: 'Modern everyday cuts in breathable fabrics, made locally in calm neutral shades that suit any occasion.',
    bio_ar: 'تصميم قِطع يومية عصرية بقِصّات مريحة وأقمشة تتنفس — تصنيع محلي بألوان هادئة تليق بكل الأوقات.',
    cover: DEMO_BRAND_IMG,
    availability: 'full',
    works: [
      { id: 'ufuq-w1', type: 'image', title_ar: 'تشكيلة الصباح', title_en: 'Morning Edit', src: DEMO_BRAND_IMG, duration: '—' },
      { id: 'ufuq-w2', type: 'image', title_ar: 'قِطع المساء', title_en: 'Evening Pieces', src: DEMO_BRAND_IMG, duration: '—' },
    ],
    models: [
      { id: 'ufuq-m1', name_ar: 'الإطلالة اليومية', name_en: 'The Daily', image: DEMO_BRAND_IMG, colors: [
        { hex: '#f4ede2', name_ar: 'بيج رملي', name_en: 'Sand Beige' },
        { hex: '#b9aa94', name_ar: 'كاكي', name_en: 'Khaki' },
        { hex: '#2f2a25', name_ar: 'قهوة داكنة', name_en: 'Dark Coffee' },
        { hex: '#b0bec5', name_ar: 'رمادي فاتح', name_en: 'Light Grey' },
      ]},
      { id: 'ufuq-m2', name_ar: 'لمسة المكتب', name_en: 'Office Touch', image: DEMO_BRAND_IMG, colors: [
        { hex: '#d5cfc3', name_ar: 'غبار زهري', name_en: 'Dusty Rose' },
        { hex: '#415a77', name_ar: 'كحلي عميق', name_en: 'Deep Navy' },
      ]},
    ],
    hours: { from: '09:00', to: '17:00', zone: 'GST' },
  },
  {
    id: 'nasj-002',
    name: 'Nasj Heritage',
    store_name: 'نَسج للتراث',
    specialty: 'brands',
    rating: 4.9,
    verified: true,
    manager: 'عبدالله النعيمي',
    bio: 'نُعيد إحياء الغرز التراثية بتطريز يدوي على عباءات ملوّنة بدرجات مستوحاة من الصحراء والخليج.',
    bio_en: 'Hand embroidery reviving heritage stitches on colorful abayas inspired by desert and Gulf tones.',
    bio_ar: 'نُعيد إحياء الغرز التراثية بتطريز يدوي على عباءات ملوّنة بدرجات مستوحاة من الصحراء والخليج.',
    cover: DEMO_BRAND_IMG,
    availability: 'full',
    works: [
      { id: 'nasj-w1', type: 'image', title_ar: 'عباءات الديوانية', title_en: 'Majlis Abayas', src: DEMO_BRAND_IMG, duration: '—' },
      { id: 'nasj-w2', type: 'image', title_ar: 'قصة الغرزة', title_en: 'Stitch Story', src: DEMO_BRAND_IMG, duration: '—' },
    ],
    models: [
      { id: 'nasj-m1', name_ar: 'عباءة الصحراء', name_en: 'Desert Abaya', image: DEMO_BRAND_IMG, colors: [
        { hex: '#c2a77a', name_ar: 'ذهبي رملي', name_en: 'Sandy Gold' },
        { hex: '#7d5a3a', name_ar: 'كراميل', name_en: 'Caramel' },
        { hex: '#1e1e21', name_ar: 'فحمي', name_en: 'Charcoal' },
        { hex: '#5b7c99', name_ar: 'سماوي داكن', name_en: 'Deep Sky' },
      ]},
      { id: 'nasj-m2', name_ar: 'عباءة الخليج', name_en: 'Gulf Abaya', image: DEMO_BRAND_IMG, colors: [
        { hex: '#2c4e6e', name_ar: 'بحري فاخر', name_en: 'Luxury Sea' },
        { hex: '#c9c0b3', name_ar: 'لؤلؤي', name_en: 'Pearl' },
      ]},
    ],
    hours: { from: '10:00', to: '19:00', zone: 'GST' },
  },
];