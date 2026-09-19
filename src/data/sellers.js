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

export function findStoreById(id, realSellers = []) {
  if (!id || !String(id).startsWith('real-')) return null;
  const idx = realSellers.findIndex((u) => `real-${u.id}` === id);
  return idx === -1 ? null : mapRealSeller(realSellers[idx], idx);
}