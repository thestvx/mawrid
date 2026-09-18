export const CURRENCIES = [
  { code: 'USD', symbol: '$', suffix: 'USD', name_ar: 'دولار أمريكي', name_en: 'US Dollar', decimals: 2, rate: 1 },
  { code: 'EUR', symbol: '€', suffix: 'EUR', name_ar: 'يورو', name_en: 'Euro', decimals: 2, rate: 0.93 },
  { code: 'DZD', symbol: 'دج', suffix: 'DZD', name_ar: 'دينار جزائري', name_en: 'Algerian Dinar', decimals: 0, rate: 133 },
];

export const DEFAULT_CURRENCY = 'USD';

export function getCurrency(code) {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
}

export function convertUsd(usdAmount, code) {
  const n = Number(usdAmount) || 0;
  return n * getCurrency(code).rate;
}

export function productPrices(product, code) {
  const baseBase = Number(product?.price) || 0;
  const baseSale = Number(product?.sale_price) > 0 ? Number(product?.sale_price) : baseBase;
  const cur = getCurrency(code);
  const explicit = (v) => (Number.isFinite(Number(v)) && v !== '' && v != null ? Number(v) : null);
  if (code === 'EUR') {
    const eur = explicit(product?.price_eur);
    const eurSale = explicit(product?.sale_price_eur);
    return {
      price: eur != null ? eur : baseBase * cur.rate,
      salePrice: eurSale != null ? eurSale : baseSale * cur.rate,
    };
  }
  if (code === 'DZD') {
    const dzd = explicit(product?.price_dzd);
    const dzdSale = explicit(product?.sale_price_dzd);
    return {
      price: dzd != null ? dzd : baseBase * cur.rate,
      salePrice: dzdSale != null ? dzdSale : baseSale * cur.rate,
    };
  }
  return { price: baseBase, salePrice: baseSale };
}

function roundTo(n, decimals) {
  const f = Math.pow(10, decimals);
  return Math.round((Number(n) || 0) * f) / f;
}

export function formatValue(value, code) {
  const cur = getCurrency(code);
  const n = roundTo(value, cur.decimals);
  const body = n.toLocaleString('en-US', {
    minimumFractionDigits: cur.decimals,
    maximumFractionDigits: cur.decimals,
  });
  if (code === 'DZD') return `${body} ${cur.symbol}`;
  if (code === 'EUR') return `${cur.symbol}${body}`;
  return `${cur.symbol}${body}`;
}

export function formatUsd(usdAmount, code) {
  return formatValue(convertUsd(usdAmount, code), code);
}