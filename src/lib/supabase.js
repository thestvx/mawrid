import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getUserProfile(firebaseUid) {
  if (!supabase || !firebaseUid) return null;
  return supabase
    .from('users')
    .select('*')
    .eq('firebase_uid', firebaseUid)
    .maybeSingle();
}

function emptyResult(data = []) {
  return { data, error: null };
}

export async function fetchCategories() {
  if (!supabase) return emptyResult();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('enabled', true)
    .order('sort_order', { ascending: true });
  if (error) { console.warn('categories load failed:', error.message); return emptyResult(); }
  return { data: data || [], error: null };
}

export async function resolveCategoryId(slug) {
  if (!supabase || !slug) return null;
  const { data } = await supabase
    .from('categories')
    .select('id, slug')
    .eq('slug', slug)
    .eq('enabled', true)
    .maybeSingle();
  return data ? data.id : null;
}

export async function fetchProducts(filter = {}) {
  if (!supabase) return emptyResult();
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
  if (error) { console.warn('products load failed:', error.message); return emptyResult(); }
  return { data: data || [], error: null };
}

export async function fetchProductById(id) {
  if (!supabase || !id) return { data: null, error: null };
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) { console.warn('product load failed:', error.message); return { data: null, error }; }
  return { data, error: null };
}

let sellerColumnsPromise = null;

export function hasSellerColumns() {
  if (!supabase) return Promise.resolve(false);
  if (!sellerColumnsPromise) {
    sellerColumnsPromise = supabase
      .from('users')
      .select('seller_status')
      .limit(1)
      .then(({ error }) => !(error && /seller_status/.test(error.message || '')))
      .catch(() => false);
  }
  return sellerColumnsPromise;
}

export async function fetchSellers() {
  if (!supabase) return emptyResult();
  const ready = await hasSellerColumns();
  let q = supabase.from('users').select('*').eq('role', 'seller');
  if (ready) q = q.eq('seller_status', 'verified');
  const { data, error } = await q.order('created_at', { ascending: true });
  if (error) { console.warn('sellers load failed:', error.message); return emptyResult(); }
  return { data: data || [], error: null };
}

export async function fetchStoreStats() {
  if (!supabase) return { products: 0, sellers: 0, users: 0 };
  const [p, u, s] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
  ]);
  return {
    products: p.count ?? 0,
    users: u.count ?? 0,
    sellers: s.count ?? 0,
  };
}