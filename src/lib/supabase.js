import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

let supabaseDisabled = false;

let healthPromise = null;
function checkHealth() {
  if (supabaseDisabled) return Promise.resolve(false);
  if (healthPromise) return healthPromise;
  healthPromise = (async () => {
    if (!supabase) return false;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2500);
      const r = await fetch(supabaseUrl + '/rest/v1/', { method: 'HEAD', headers: { apikey: supabaseAnonKey }, signal: ctrl.signal });
      clearTimeout(t);
      const ok = r.status > 0 && r.status < 500;
      if (!ok) { supabaseDisabled = true; }
      return ok;
    } catch {
      supabaseDisabled = true;
      return false;
    }
  })();
  return healthPromise;
}
function isNetworkError(err) {
  const m = (err && (err.message || String(err))) || '';
  return /failed to fetch|networkerror|err_name_not_resolved|load failed|aborted/i.test(m);
}
function markDisabled() {
  supabaseDisabled = true;
}

export async function getUserProfile(firebaseUid) {
  if (!supabase || supabaseDisabled || !firebaseUid) return { data: null, error: null };
  const ok = await checkHealth();
  if (!ok) return { data: null, error: null };
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .maybeSingle();
    if (error) { if (isNetworkError(error)) markDisabled(); }
    return { data: data || null, error: error || null };
  } catch (e) {
    if (isNetworkError(e)) markDisabled();
    return { data: null, error: e };
  }
}

function emptyResult(data = []) {
  return { data, error: null };
}

export async function fetchCategories() {
  if (!supabase || supabaseDisabled) return emptyResult();
  const ok = await checkHealth();
  if (!ok) return emptyResult();
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('enabled', true)
      .order('sort_order', { ascending: true });
    if (error) {
      console.warn('categories load failed:', error.message);
      if (isNetworkError(error)) markDisabled();
      return emptyResult();
    }
    return { data: data || [], error: null };
  } catch (e) {
    console.warn('categories load failed:', e && e.message);
    if (isNetworkError(e)) markDisabled();
    return emptyResult();
  }
}

export async function resolveCategoryId(slug) {
  if (!supabase || supabaseDisabled || !slug) return null;
  const ok = await checkHealth();
  if (!ok) return null;
  try {
    const { data } = await supabase
      .from('categories')
      .select('id, slug')
      .eq('slug', slug)
      .eq('enabled', true)
      .maybeSingle();
    return data ? data.id : null;
  } catch { return null; }
}

export async function fetchProducts(filter = {}) {
  if (!supabase || supabaseDisabled) return emptyResult();
  const ok = await checkHealth();
  if (!ok) return emptyResult();
  try {
    let q = supabase.from('products').select('*').eq('status', 'active');
    if (filter.categoryId) {
      q = q.eq('category_id', filter.categoryId);
    } else if (filter.categorySlug) {
      const id = await resolveCategoryId(filter.categorySlug);
      if (id) q = q.eq('category_id', id);
      else return emptyResult();
    }
    if (filter.featuredOnly) q = q.eq('featured', true);
    q = q.order('created_at', { ascending: false });
    if (filter.limit) q = q.limit(filter.limit);
    const { data, error } = await q;
    if (error) { console.warn('products load failed:', error.message); if (isNetworkError(error)) markDisabled(); return emptyResult(); }
    return { data: data || [], error: null };
  } catch (e) {
    console.warn('products load failed:', e && e.message);
    if (isNetworkError(e)) markDisabled();
    return emptyResult();
  }
}

export async function fetchProductById(id) {
  if (!supabase || supabaseDisabled || !id) return { data: null, error: null };
  const ok = await checkHealth();
  if (!ok) return { data: null, error: null };
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) { console.warn('product load failed:', error.message); if (isNetworkError(error)) markDisabled(); return { data: null, error }; }
    return { data, error: null };
  } catch (e) {
    if (isNetworkError(e)) markDisabled();
    return { data: null, error: e };
  }
}

let sellerColumnsPromise = null;

export function hasSellerColumns() {
  if (!supabase || supabaseDisabled) return Promise.resolve(false);
  if (!sellerColumnsPromise) {
    sellerColumnsPromise = (async () => {
      const ok = await checkHealth();
      if (!ok) return false;
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
  if (!supabase || supabaseDisabled) return Promise.resolve(false);
  if (userColumnCache.has(name)) return userColumnCache.get(name);
  const p = (async () => {
    const ok = await checkHealth();
    if (!ok) return false;
    try {
      const { error } = await supabase.from('users').select(name).limit(1);
      return !(error && (error.message || '').includes(name));
    } catch { return false; }
  })();
  userColumnCache.set(name, p);
  return p;
}

export async function fetchSellers() {
  if (!supabase || supabaseDisabled) return emptyResult();
  const ok = await checkHealth();
  if (!ok) return emptyResult();
  try {
    const ready = await hasSellerColumns();
    let q = supabase.from('users').select('*').eq('role', 'seller');
    if (ready) q = q.eq('seller_status', 'verified');
    const { data, error } = await q.order('created_at', { ascending: true });
    if (error) { console.warn('sellers load failed:', error.message); if (isNetworkError(error)) markDisabled(); return emptyResult(); }
    return { data: data || [], error: null };
  } catch (e) {
    console.warn('sellers load failed:', e && e.message);
    if (isNetworkError(e)) markDisabled();
    return emptyResult();
  }
}

export async function fetchStoreStats() {
  if (!supabase || supabaseDisabled) return { products: 0, sellers: 0, users: 0 };
  const ok = await checkHealth();
  if (!ok) return { products: 0, sellers: 0, users: 0 };
  try {
    const [p, u, s] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
    ]);
    if (isNetworkError(p.error) || isNetworkError(u.error) || isNetworkError(s.error)) markDisabled();
    return {
      products: p.count ?? 0,
      users: u.count ?? 0,
      sellers: s.count ?? 0,
    };
  } catch (e) {
    if (isNetworkError(e)) markDisabled();
    return { products: 0, sellers: 0, users: 0 };
  }
}
