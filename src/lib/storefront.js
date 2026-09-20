import { supabase, isSupabaseConfigured } from './supabase';

const TABLE = 'storefronts';

export const STOREFRONT_READY_KEY = 'mawrid_storefronts_ready';
let storefrontTablePromise = null;

export function hasStorefrontTable() {
  if (!isSupabaseConfigured) return Promise.resolve(false);
  if (!storefrontTablePromise) {
    storefrontTablePromise = supabase
      .from(TABLE)
      .select('id', { head: true, count: 'exact' })
      .limit(1)
      .then(({ error }) => {
        const ok = !error || error.code !== 'PGRST205';
        if (ok) { try { localStorage.setItem(STOREFRONT_READY_KEY, '1'); } catch {} }
        return ok;
      })
      .catch(() => false);
  }
  return storefrontTablePromise;
}

export function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"`]/g, '')
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

export function defaultSlug(seller) {
  const base = slugify(seller?.store_name || seller?.storeName || seller?.full_name || '');
  if (base && /[a-z0-9]/.test(base)) return base;
  const id = String(seller?.firebase_uid || seller?.id || seller?.uid || '').replace(/[^a-z0-9]/gi, '').slice(0, 8);
  return base ? `${base}-${id || 'store'}` : `store-${id || 'mawrid'}`;
}

export const PALETTES = [
  { id: 'ember', label_ar: 'جمر', label_en: 'Ember', primary: '#ff6201', accent: '#a53c00', bg: '#fff8f4', surface: '#ffffff', ink: '#26160e' },
  { id: 'ink', label_ar: 'حِبري', label_en: 'Ink', primary: '#111827', accent: '#6b7280', bg: '#fafafa', surface: '#ffffff', ink: '#111827' },
  { id: 'rose', label_ar: 'وردي', label_en: 'Rose', primary: '#e11d6f', accent: '#9d174d', bg: '#fff5f8', surface: '#ffffff', ink: '#2a1018' },
  { id: 'sage', label_ar: 'زيتي', label_en: 'Sage', primary: '#2f7d5c', accent: '#14532d', bg: '#f4faf6', surface: '#ffffff', ink: '#0f2a1d' },
  { id: 'ocean', label_ar: 'محيطي', label_en: 'Ocean', primary: '#0ea5e9', accent: '#0c4a6e', bg: '#f2f9ff', surface: '#ffffff', ink: '#0b2239' },
  { id: 'violet', label_ar: 'بنفسجي', label_en: 'Violet', primary: '#6d28d9', accent: '#4c1d95', bg: '#f8f6ff', surface: '#ffffff', ink: '#1e1140' },
  { id: 'noir', label_ar: 'ليلي', label_en: 'Noir', primary: '#f5b642', accent: '#b45309', bg: '#0e0e10', surface: '#1a1a1e', ink: '#f7f5ef' },
  { id: 'sand', label_ar: 'رملي', label_en: 'Sand', primary: '#b45309', accent: '#78350f', bg: '#fdf8ef', surface: '#ffffff', ink: '#2a1c0a' },
];

export const FONT_PRESETS = [
  { id: 'modern', label_ar: 'عصري', label_en: 'Modern', head: "'Tajawal', 'Inter', system-ui, sans-serif", body: "'Tajawal', 'Inter', system-ui, sans-serif" },
  { id: 'editorial', label_ar: 'تحريري', label_en: 'Editorial', head: "'Playfair Display', 'Amiri', Georgia, serif", body: "'Inter', 'Tajawal', system-ui, sans-serif" },
  { id: 'classic', label_ar: 'كلاسيكي', label_en: 'Classic', head: "Georgia, 'Amiri', serif", body: "Georgia, 'Tajawal', serif" },
  { id: 'display', label_ar: 'بارز', label_en: 'Display', head: "'Tajawal', 'Inter', sans-serif", body: "'Inter', 'Tajawal', system-ui, sans-serif" },
];

export function getPalette(id) {
  return PALETTES.find((p) => p.id === id) || PALETTES[0];
}

export function getFont(id) {
  return FONT_PRESETS.find((f) => f.id === id) || FONT_PRESETS[0];
}

export function themeToVars(theme) {
  const t = { ...DEFAULT_THEME, ...(theme || {}) };
  const p = getPalette(t.palette);
  const custom = t.custom || {};
  const primary = custom.primary || p.primary;
  const accent = custom.accent || p.accent;
  const bg = custom.bg || p.bg;
  const surface = custom.surface || p.surface;
  const ink = custom.ink || p.ink;
  const font = getFont(t.font);
  const fontHead = custom.fontHead || font.head;
  const fontBody = custom.fontBody || font.body;
  return {
    '--st-primary': primary,
    '--st-accent': accent,
    '--st-bg': bg,
    '--st-surface': surface,
    '--st-ink': ink,
    '--st-muted': mix(ink, bg, 0.45),
    '--st-border': mix(ink, bg, 0.86),
    '--st-radius': `${t.radius}px`,
    '--st-radius-sm': `${Math.max(4, Math.round(t.radius * 0.55))}px`,
    '--st-font-head': fontHead,
    '--st-font-body': fontBody,
    '--st-density': t.density === 'compact' ? '0.75' : t.density === 'airy' ? '1.25' : '1',
    '--st-on-primary': readableOn(primary),
  };
}

function clamp(n) { return Math.max(0, Math.min(255, Math.round(n))); }

function parse(hex) {
  const h = String(hex || '').replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full || '000000', 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function toHex({ r, g, b }) {
  return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('')}`;
}

function mix(a, b, w) {
  const A = parse(a); const B = parse(b);
  return toHex({ r: A.r * (1 - w) + B.r * w, g: A.g * (1 - w) + B.g * w, b: A.b * (1 - w) + B.b * w });
}

function readableOn(hex) {
  const { r, g, b } = parse(hex);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? '#1a1208' : '#ffffff';
}

export const DEFAULT_THEME = {
  palette: 'ember',
  font: 'modern',
  radius: 18,
  density: 'comfy',
  custom: {},
};

export const DEFAULT_SETTINGS = {
  tagline_ar: '',
  tagline_en: '',
  announcementOn: false,
  announcement_ar: '',
  announcement_en: '',
  announcementHref: '',
  whatsapp: '',
  email: '',
  phone: '',
  address: '',
  mapUrl: '',
  hours: '',
  socials: [],
  shipping_ar: '',
  shipping_en: '',
  return_ar: '',
  return_en: '',
};

function uid(prefix = 's') {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function newSection(type, defaults) {
  return { id: uid('sec-'), type, visible: true, props: { ...defaults } };
}

export function defaultStorefront(seller, products = []) {
  const name = seller?.store_name || seller?.storeName || seller?.full_name || '';
  const specialty = seller?.specialty || seller?.specialty_en || '';
  const cover = seller?.cover_url || seller?.cover || (products[0] && (products[0].images?.[0] || products[0].thumbnail)) || '';
  const about = seller?.bio || seller?.about || '';
  const sections = [];

  sections.push(newSection('hero', {
    layout: 'full',
    align: 'center',
    height: 'tall',
    eyebrow: specialty,
    title_ar: name,
    title_en: name,
    subtitle_ar: seller?.bio_ar || about,
    subtitle_en: about,
    image: cover,
    overlay: 48,
    cta1Label_ar: 'تسوّق الآن',
    cta1Label_en: 'Shop now',
    cta1Href: '#products',
    cta2Label_ar: 'تواصل معنا',
    cta2Label_en: 'Contact us',
    cta2Href: '#contact',
  }));

  sections.push(newSection('featured', {
    title_ar: 'الأكثر رواجاً',
    title_en: 'Featured',
    subtitle_ar: '',
    subtitle_en: '',
    source: 'featured',
    limit: 8,
    layout: 'grid',
  }));

  if (products.length) {
    sections.push(newSection('categories', {
      title_ar: 'تسوّق حسب القسم',
      title_en: 'Shop by category',
      layout: 'cards',
      limit: 8,
    }));
  }

  if (about) {
    sections.push(newSection('about', {
      title_ar: 'قصتنا',
      title_en: 'Our story',
      text_ar: about,
      text_en: about,
      image: cover,
      bullets: [],
    }));
  }

  sections.push(newSection('contact', {
    title_ar: 'تواصل معنا',
    title_en: 'Get in touch',
    text_ar: '',
    text_en: '',
    showWhatsapp: true,
    showEmail: true,
    showPhone: true,
    showAddress: true,
  }));

  return {
    seller_id: seller?.firebase_uid || seller?.id || '',
    slug: defaultSlug(seller),
    status: 'draft',
    theme: { ...DEFAULT_THEME },
    settings: {
      ...DEFAULT_SETTINGS,
      tagline_ar: specialty,
      tagline_en: specialty,
      whatsapp: seller?.whatsapp || '',
      email: seller?.email || '',
      phone: seller?.phone || '',
      address: seller?.address || seller?.location || '',
      socials: [],
    },
    sections,
    seo: { title: name, description: about, ogImage: cover },
  };
}

export function normalizeStorefront(row) {
  if (!row) return null;
  return {
    ...row,
    theme: { ...DEFAULT_THEME, ...(row.theme || {}), custom: { ...(row.theme?.custom || {}) } },
    settings: { ...DEFAULT_SETTINGS, ...(row.settings || {}) },
    sections: Array.isArray(row.sections) ? row.sections : [],
    seo: row.seo || {},
  };
}

export async function getStorefrontBySlug(slug) {
  if (!slug) return null;
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from(TABLE).select('*').eq('slug', slug).maybeSingle();
    if (!error && data) return normalizeStorefront(data);
  }
  const wanted = slugify(slug);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('mawrid_storefront_')) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const row = JSON.parse(raw);
      if (row && slugify(row.slug || '') === wanted) return normalizeStorefront(row);
    }
  } catch {}
  return null;
}

export async function getStorefrontBySeller(sellerId) {
  if (!isSupabaseConfigured || !sellerId) return null;
  const { data, error } = await supabase.from(TABLE).select('*').eq('seller_id', sellerId).maybeSingle();
  if (error) return null;
  return normalizeStorefront(data);
}

export async function saveStorefront(store) {
  const payload = {
    seller_id: store.seller_id,
    slug: slugify(store.slug) || defaultSlug({ firebase_uid: store.seller_id }),
    status: store.status === 'published' ? 'published' : 'draft',
    theme: store.theme || DEFAULT_THEME,
    settings: store.settings || DEFAULT_SETTINGS,
    sections: store.sections || [],
    seo: store.seo || {},
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: 'seller_id' })
    .select()
    .maybeSingle();
  if (error) return { ok: false, error: error.message, code: error.code };
  return { ok: true, store: normalizeStorefront(data) };
}

export async function setStoreStatus(sellerId, status) {
  if (!isSupabaseConfigured || !sellerId) return { ok: false, error: 'not-configured' };
  const patch = { status, updated_at: new Date().toISOString() };
  if (status === 'published') patch.published_at = new Date().toISOString();
  const { error } = await supabase.from(TABLE).update(patch).eq('seller_id', sellerId);
  if (error) return { ok: false, error: error.message, code: error.code };
  return { ok: true };
}

export async function isSlugAvailable(slug, sellerId) {
  if (!isSupabaseConfigured || !slug) return true;
  const { data, error } = await supabase.from(TABLE).select('seller_id').eq('slug', slug).limit(1);
  if (error) return true;
  if (!data || !data.length) return true;
  return data[0].seller_id === sellerId;
}

export async function extractPalette(url, count = 5) {
  return new Promise((resolve) => {
    if (!url || typeof document === 'undefined') return resolve([]);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const w = canvas.width = 72;
        const h = canvas.height = Math.max(1, Math.round(72 * (img.height / img.width || 1)));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        const buckets = new Map();
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          const r = data[i]; const g = data[i + 1]; const b = data[i + 2];
          const max = Math.max(r, g, b); const min = Math.min(r, g, b);
          const l = (max + min) / 510;
          const s = max === min ? 0 : (max - min) / (255 * (Math.abs(2 * l - 1) || 1));
          if (l < 0.12 || l > 0.94 || s < 0.16) continue;
          const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
          const cur = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };
          cur.r += r; cur.g += g; cur.b += b; cur.n += 1;
          buckets.set(key, cur);
        }
        const arr = [...buckets.values()]
          .map((b) => ({ r: Math.round(b.r / b.n), g: Math.round(b.g / b.n), b: Math.round(b.b / b.n), n: b.n }))
          .sort((a, b) => b.n - a.n)
          .slice(0, count);
        resolve(arr.map((c) => toHex(c)));
      } catch {
        resolve([]);
      }
    };
    img.onerror = () => resolve([]);
    img.src = url;
  });
}
