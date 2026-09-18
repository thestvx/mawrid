export function parsePlanDuration(src) {
  if (!src) return null;
  const base = String(src).split('/').pop();
  const m = base.match(/(\d+)\s*(y|year|years|m|month|months)/i);
  if (!m) return null;
  const val = parseInt(m[1], 10);
  if (!val) return null;
  const unit = m[2].toLowerCase();
  return unit.startsWith('y') ? val * 12 : val;
}

export function durationLabel(src, isRtl = true) {
  const months = parsePlanDuration(src);
  if (months == null) return '';
  if (months % 12 === 0) {
    const y = months / 12;
    if (isRtl) return y === 1 ? 'سنة واحدة' : `${y} سنوات`;
    return y === 1 ? '1 Year' : `${y} Years`;
  }
  if (isRtl) return months === 1 ? 'شهر واحد' : months === 2 ? 'شهران' : months <= 10 ? `${months} أشهر` : `${months} شهر`;
  return months === 1 ? '1 Month' : `${months} Months`;
}

export function planPrice(product) {
  if (!product) return 0;
  const n = Number(product.sale_price || product.price);
  return isFinite(n) ? n : 0;
}

const TIER_WORDS = ['plus', 'pro', 'ultra', 'max', 'premium', 'prime', 'standard', 'better', 'one', 'family', 'team', 'kids', 'bundle'];

function planTier(src) {
  if (!src) return '';
  const base = String(src).split('/').pop().replace(/\.[a-z0-9]+$/i, '');
  return base.replace(/-?\d+(y(ear(s)?)?|m(onth(s)?)?)$/i, '').replace(/[-_]/g, '').toLowerCase();
}

function compact(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]/g, '');
}

function tierScore(p, tier) {
  if (!tier || tier.length < 2) return 0;
  const c = compact(`${p.name || ''} ${p.name_en || ''} ${p.slug || ''} ${(Array.isArray(p.tags) ? p.tags : []).join(' ')}`);
  let score = 0;
  if (c.includes(tier)) score += tier.length * 2 + 12;
  if (tier !== c) {
    for (const m of TIER_WORDS) {
      if (tier.includes(m) !== c.includes(m)) score -= 12;
    }
  }
  return score;
}

export function matchPlanProduct(src, products) {
  const months = parsePlanDuration(src);
  const list = Array.isArray(products) ? products.filter((p) => p) : [];
  if (list.length === 0) return null;
  if (months == null) return list[0];

  const kws = [];
  if (months % 12 === 0) {
    kws.push(String(months / 12), String(months), 'year', 'y', 'سنو', 'سنه', 'سنة');
  } else {
    kws.push(String(months), `${months}m`, 'month', 'mo', 'شهر');
  }

  const tier = planTier(src);
  if (tier) kws.push(tier);

  const scored = list.map((p) => {
    const hay = `${p.name || ''} ${p.name_en || ''} ${p.slug || ''} ${(Array.isArray(p.tags) ? p.tags : []).join(' ')}`.toLowerCase();
    let score = 0;
    for (const kw of kws) {
      if (hay.includes(kw.toLowerCase())) score += kw.length + 1;
    }
    score += tierScore(p, tier);
    return { p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].score > 0 ? scored[0].p : list[0];
}

export function planCartItem(sub, src, product) {
  const isRtl = true;
  const label = durationLabel(src, isRtl);
  const fileName = String(src).split('/').pop().replace(/\.[a-z0-9]+$/i, '');
  const price = planPrice(product);
  return {
    id: `${sub.key}::${fileName}`,
    key: fileName,
    name: label ? `${sub.title_ar} — ${label}` : sub.title_ar,
    name_en: label ? `${sub.title_en} - ${durationLabel(src, false)}` : sub.title_en,
    thumbnail: src,
    sale_price: product && Number(product.sale_price) > 0 ? product.sale_price : 0,
    price: Number(product?.price) || price,
    originalPrice: Number(product?.price) || price,
    link: `/subscription/${sub.key}`,
    options: label ? { duration: label } : {},
  };
}