import { createClient } from '@supabase/supabase-js';
import { DEMO_BRANDS } from '../data/sellers';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ---------- demo data (used when Supabase is unreachable) ----------
const DEMO_CATEGORIES = [
  { id: 'c-ai', slug: 'ai', name: 'الذكاء الاصطناعي', name_en: 'AI Tools', enabled: true, sort_order: 1 },
  { id: 'c-courses', slug: 'courses', name: 'الدورات والتعليم', name_en: 'Education', enabled: true, sort_order: 2 },
  { id: 'c-design', slug: 'design', name: 'التصميم', name_en: 'Design', enabled: true, sort_order: 3 },
  { id: 'c-office', slug: 'office', name: 'الأعمال', name_en: 'Business', enabled: true, sort_order: 4 },
  { id: 'c-gaming', slug: 'gaming', name: 'الألعاب', name_en: 'Gaming', enabled: true, sort_order: 5 },
  { id: 'c-ent', slug: 'entertainment', name: 'الترفيه والبث', name_en: 'Entertainment', enabled: true, sort_order: 6 },
];

const DEMO_PRODUCTS = [
  { id: 'p-chatgpt-3m', name: 'ChatGPT Plus — 3 أشهر', name_en: 'ChatGPT Plus 3 Months', price: 41, sale_price: 33, thumbnail: '/sub/chatgpt/chatgptplus-3months.png', images: ['/sub/chatgpt/chatgptplus-3months.png'], category_id: 'c-ai', featured: true, status: 'active', created_at: '2026-01-01' },
  { id: 'p-gemini-1m', name: 'Gemini Pro — شهر', name_en: 'Gemini Pro 1 Month', price: 45, sale_price: 36, thumbnail: '/sub/gemini/geminipro-1months.png', images: ['/sub/gemini/geminipro-1months.png'], category_id: 'c-ai', featured: true, status: 'active', created_at: '2026-01-02' },
  { id: 'p-coursera-1y', name: 'Coursera Plus — سنة', name_en: 'Coursera Plus 1 Year', price: 190, sale_price: 149, thumbnail: '/sub/coursera/courseraplus-1year.png', images: ['/sub/coursera/courseraplus-1year.png'], category_id: 'c-courses', featured: true, status: 'active', created_at: '2026-01-03' },
  { id: 'p-canva-1y', name: 'Canva Pro — سنة', name_en: 'Canva Pro 1 Year', price: 140, sale_price: 99, thumbnail: '/sub/canva/canvapro-1year.png', images: ['/sub/canva/canvapro-1year.png'], category_id: 'c-design', featured: false, status: 'active', created_at: '2026-01-04' },
  { id: 'p-adobe-3m', name: 'Adobe Creative Cloud — 3 أشهر', name_en: 'Adobe CC 3 Months', price: 120, sale_price: 79, thumbnail: '/sub/adobe/adobe-3months.png', images: ['/sub/adobe/adobe-3months.png'], category_id: 'c-design', featured: false, status: 'active', created_at: '2026-01-05' },
  { id: 'p-netflix-1m', name: 'Netflix Premium — شهر', name_en: 'Netflix Premium 1 Month', price: 20, sale_price: 15, thumbnail: '/sub/netflix/netflix-1months.png', images: ['/sub/netflix/netflix-1months.png'], category_id: 'c-ent', featured: true, status: 'active', created_at: '2026-01-06' },
  { id: 'p-spotify-3m', name: 'Spotify Premium — 3 أشهر', name_en: 'Spotify Premium 3 Months', price: 12, sale_price: 9, thumbnail: '/sub/spotify/spotify-3months.png', images: ['/sub/spotify/spotify-3months.png'], category_id: 'c-ent', featured: false, status: 'active', created_at: '2026-01-07' },
  { id: 'p-xbox-1y', name: 'Xbox Game Pass — سنة', name_en: 'Xbox Game Pass 1 Year', price: 80, sale_price: 60, thumbnail: '/sub/xbox/xbox-1year.png', images: ['/sub/xbox/xbox-1year.png'], category_id: 'c-gaming', featured: false, status: 'active', created_at: '2026-01-08' },
];

// ---------- health / disabled state ----------
let supabaseDisabled = true;
let healthPromise = null;
let supabaseAlive = false;

function checkHealth() {
  if (supabaseDisabled) return Promise.resolve(false);
  if (healthPromise) return healthPromise;
  if (!supabase) { supabaseDisabled = true; return Promise.resolve(false); }
  healthPromise = (async () => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2000);
      const r = await fetch(supabaseUrl + '/rest/v1/', { method: 'HEAD', headers: { apikey: supabaseAnonKey }, signal: ctrl.signal });
      clearTimeout(t);
      const ok = r.status > 0 && r.status < 500;
      supabaseAlive = ok;
      if (!ok) supabaseDisabled = true;
      return ok;
    } catch {
      supabaseDisabled = true;
      supabaseAlive = false;
      return false;
    }
  })();
  return healthPromise;
}


function isNetworkError(err) {
  const m = (err && (err.message || String(err))) || '';
  return /failed to fetch|networkerror|err_name_not_resolved|load failed|aborted/i.test(m);
}
function markDisabled() { supabaseDisabled = true; }

function emptyResult(data = []) { return { data, error: null }; }

function useDemo() { return supabaseDisabled || !supabaseAlive; }

// ---------- exports ----------
export function getUserProfile(firebaseUid) {
  if (!supabase || supabaseDisabled || !firebaseUid || useDemo()) return { data: null, error: null };
  return (async () => {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('firebase_uid', firebaseUid).maybeSingle();
      if (error && isNetworkError(error)) markDisabled();
      return { data: data || null, error: error || null };
    } catch (e) { if (isNetworkError(e)) markDisabled(); return { data: null, error: e }; }
  })();
}

export async function fetchCategories() {
  if (useDemo()) return emptyResult(DEMO_CATEGORIES);
  try {
    const { data, error } = await supabase.from('categories').select('*').eq('enabled', true).order('sort_order', { ascending: true });
    if (error) { if (isNetworkError(error)) markDisabled(); return emptyResult(DEMO_CATEGORIES); }
    return { data: data || DEMO_CATEGORIES, error: null };
  } catch (e) { if (isNetworkError(e)) markDisabled(); return emptyResult(DEMO_CATEGORIES); }
}

export async function resolveCategoryId(slug) {
  if (useDemo()) { const c = DEMO_CATEGORIES.find((x) => x.slug === slug); return c ? c.id : null; }
  if (!supabase || supabaseDisabled || !slug) return null;
  try {
    const { data } = await supabase.from('categories').select('id, slug').eq('slug', slug).eq('enabled', true).maybeSingle();
    return data ? data.id : null;
  } catch { return null; }
}

export async function fetchProducts(filter = {}) {
  if (useDemo()) {
    let list = DEMO_PRODUCTS.filter((p) => p.status === 'active');
    if (filter.categoryId) list = list.filter((p) => p.category_id === filter.categoryId);
    else if (filter.categorySlug) {
      const id = await resolveCategoryId(filter.categorySlug);
      if (id) list = list.filter((p) => p.category_id === id);
    }
    if (filter.featuredOnly) list = list.filter((p) => p.featured);
    list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (filter.limit) list = list.slice(0, filter.limit);
    return { data: list, error: null };
  }
  try {
    let q = supabase.from('products').select('*').eq('status', 'active');
    if (filter.categoryId) q = q.eq('category_id', filter.categoryId);
    else if (filter.categorySlug) {
      const id = await resolveCategoryId(filter.categorySlug);
      if (id) q = q.eq('category_id', id); else return emptyResult();
    }
    if (filter.featuredOnly) q = q.eq('featured', true);
    q = q.order('created_at', { ascending: false });
    if (filter.limit) q = q.limit(filter.limit);
    const { data, error } = await q;
    if (error) { if (isNetworkError(error)) markDisabled(); return emptyResult(); }
    return { data: data || [], error: null };
  } catch (e) { if (isNetworkError(e)) markDisabled(); return emptyResult(); }
}

export async function fetchProductById(id) {
  if (useDemo()) { const p = DEMO_PRODUCTS.find((x) => x.id === id) || null; return { data: p, error: null }; }
  if (!supabase || supabaseDisabled || !id) return { data: null, error: null };
  try {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
    if (error) { if (isNetworkError(error)) markDisabled(); return { data: null, error }; }
    return { data, error: null };
  } catch (e) { if (isNetworkError(e)) markDisabled(); return { data: null, error: e }; }
}

let sellerColumnsPromise = null;
export function hasSellerColumns() {
  if (!supabase || supabaseDisabled || useDemo()) return Promise.resolve(false);
  if (!sellerColumnsPromise) {
    sellerColumnsPromise = (async () => {
      try {
        const { error } = await supabase.from('users').select('seller_status').limit(1);
        return !(error && /seller_status/.test(error.message || ''));
      } catch { return false; }
    })();
  }
  return sellerColumnsPromise;
}

const userColumnCache = new Map();
export function hasUserColumn(name) {
  if (!supabase || supabaseDisabled || useDemo()) return Promise.resolve(false);
  if (userColumnCache.has(name)) return userColumnCache.get(name);
  const p = (async () => {
    try {
      const { error } = await supabase.from('users').select(name).limit(1);
      return !(error && (error.message || '').includes(name));
    } catch { return false; }
  })();
  userColumnCache.set(name, p);
  return p;
}

export async function fetchSellers() {
  if (useDemo()) return emptyResult(DEMO_BRANDS);
  try {
    const ready = await hasSellerColumns();
    let q = supabase.from('users').select('*').eq('role', 'seller');
    if (ready) q = q.eq('seller_status', 'verified');
    const { data, error } = await q.order('created_at', { ascending: true });
    if (error) { if (isNetworkError(error)) markDisabled(); return emptyResult(DEMO_BRANDS); }
    return { data: data || DEMO_BRANDS, error: null };
  } catch (e) { if (isNetworkError(e)) markDisabled(); return emptyResult(DEMO_BRANDS); }
}

export async function fetchStoreStats() {
  if (useDemo()) return { products: DEMO_PRODUCTS.length, sellers: DEMO_BRANDS.length, users: 24 };
  try {
    const [p, u, s] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
    ]);
    if (isNetworkError(p.error) || isNetworkError(u.error) || isNetworkError(s.error)) markDisabled();
    return { products: p.count ?? 0, users: u.count ?? 0, sellers: s.count ?? 0 };
  } catch (e) { if (isNetworkError(e)) markDisabled(); return { products: DEMO_PRODUCTS.length, sellers: DEMO_BRANDS.length, users: 24 }; }
}

