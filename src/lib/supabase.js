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