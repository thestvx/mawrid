import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { supabase, isSupabaseConfigured, getUserProfile, hasSellerColumns, hasUserColumn } from '../lib/supabase';

const AuthContext = createContext(null);

function saveUserLocal(uid, data) {
  try {
    localStorage.setItem('mawrid_user', JSON.stringify({ uid, ...data }));
  } catch {}
}

function getCachedUser() {
  try {
    const raw = localStorage.getItem('mawrid_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearCachedUser() {
  try { localStorage.removeItem('mawrid_user'); } catch {}
}

const PENDING_WRITE_KEY = 'mawrid_pending_profile_write';

async function buildUserRow({ uid, email, displayName, role, name, phone, storeName, sellerStatus, specialty, website, createdAt }) {
  const row = {
    firebase_uid: uid,
    email: email || '',
    name: name || displayName || '',
    role: role || 'buyer',
    phone: phone || '',
    store_name: storeName || '',
    created_at: createdAt || new Date().toISOString(),
  };
  if (row.role === 'seller') {
    if (await hasSellerColumns()) {
      row.seller_status = sellerStatus || 'pending';
      row.specialty = specialty || '';
    }
    if (await hasUserColumn('website')) {
      row.website = website || '';
    }
  }
  return row;
}

async function upsertUserProfile(cred, data) {
  if (!supabase) return { ok: false, error: null, configured: false };
  try {
    const row = await buildUserRow({
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName,
      role: data.role,
      name: data.name,
      phone: data.phone,
      storeName: data.storeName,
      sellerStatus: data.sellerStatus,
      specialty: data.specialty,
      website: data.website,
      createdAt: data.createdAt,
    });
    const { error } = await supabase.from('users').upsert(row, { onConflict: 'firebase_uid' });
    if (error) {
      console.warn('Supabase profile write skipped:', error.message);
      return { ok: false, error };
    }
    return { ok: true };
  } catch (err) {
    console.warn('Supabase profile write skipped:', err.message);
    return { ok: false, error: err };
  }
}

function queueProfileWrite(payload) {
  try { localStorage.setItem(PENDING_WRITE_KEY, JSON.stringify(payload)); } catch {}
}

async function flushPendingProfileWrite() {
  if (!supabase || !isSupabaseConfigured) return false;
  let item;
  try {
    const raw = localStorage.getItem(PENDING_WRITE_KEY);
    if (!raw) return false;
    item = JSON.parse(raw);
  } catch { return false; }
  const res = await upsertUserProfile(
    { user: { uid: item.uid, email: item.email, displayName: item.displayName || '' } },
    item.data
  );
  if (res.ok) {
    try { localStorage.removeItem(PENDING_WRITE_KEY); } catch {}
    return true;
  }
  return false;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const handledRef = useRef(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (handledRef.current) {
        setLoading(false);
        return;
      }
      if (firebaseUser) {
        let role = 'buyer';
        let name = firebaseUser.displayName || '';
        let extraData = {};

        // Database first (Supabase, then localStorage cache fallback)
        if (isSupabaseConfigured) {
          try {
            const { data, error } = await getUserProfile(firebaseUser.uid);
            if (!error && data) {
              role = data.role || 'buyer';
              name = data.name || name;
              extraData = { ...data };
            }
          } catch (err) {
            console.warn('Supabase profile read failed:', err.message);
          }
        }

        const cached = getCachedUser();
        if (cached && cached.uid === firebaseUser.uid) {
          if (!extraData.role) role = cached.role || 'buyer';
          if (!extraData.name) name = cached.name || name;
          extraData = { ...cached, ...extraData };
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name,
          role,
          ...extraData,
        });
        if (isSupabaseConfigured) {
          flushPendingProfileWrite().catch(() => {});
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = useCallback(async (identifier, password) => {
    handledRef.current = true;
    let email = identifier;
    if (!identifier.includes('@')) {
      // Username login: resolve the email from the users table, then sign in.
      if (!supabase || !isSupabaseConfigured) {
        const err = new Error(
          'Supabase is not configured on this client. VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be present at build time.'
        );
        err.code = 'ERR_SUPABASE_NOT_CONFIGURED';
        throw err;
      }
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('name', identifier.toLowerCase())
        .limit(1);
      if (error) {
        console.warn('Username lookup failed:', error.code, error.message);
        const err = new Error(
          `Username lookup failed (${error.code || 'unknown'}: ${error.message})`
        );
        err.code = 'ERR_USERNAME_LOOKUP';
        err.cause = error;
        throw err;
      }
      if (data && data[0] && data[0].email) {
        email = data[0].email;
      } else {
        const err = new Error(
          `No account found for the username "${identifier}".`
        );
        err.code = 'ERR_USERNAME_NOT_FOUND';
        throw err;
      }
    }

    const cred = await signInWithEmailAndPassword(auth, email, password);

    // Resolve profile + role right away (don't wait for onAuthStateChanged).
    let role = 'buyer';
    let name = cred.user.displayName || '';
    let extra = {};
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await getUserProfile(cred.user.uid);
        if (!error && data) {
          role = data.role || 'buyer';
          name = data.name || name;
          extra = { ...extra, ...data };
        }
      } catch (err) {
        console.warn('Supabase profile read failed:', err.message);
      }
    }

    const profile = { uid: cred.user.uid, email: cred.user.email, name, role, ...extra };
    saveUserLocal(cred.user.uid, profile);
    setUser(profile);
    setTimeout(() => { handledRef.current = false; }, 200);
    return profile;
  }, []);

  const signup = useCallback(async ({ email, password, name, role, phone, storeName, specialty, website }) => {
    handledRef.current = true;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const sellersReady = role === 'seller' ? await hasSellerColumns() : false;
    const userData = {
      name,
      email,
      role,
      phone: phone || '',
      storeName: storeName || '',
      ...(sellersReady ? { sellerStatus: 'pending', seller_status: 'pending' } : {}),
      ...(role === 'seller' ? { specialty: specialty || '', website: website || '' } : {}),
      createdAt: new Date().toISOString(),
    };

    // Keep local cache for instant reads
    saveUserLocal(cred.user.uid, userData);

    // Save to Supabase (if configured); if it fails, queue a background retry
    // so the seller row still lands in the admin dashboard.
    let supabaseStatus = 'unsaved';
    const saved = await upsertUserProfile(cred, userData);
    if (saved.ok) {
      supabaseStatus = 'saved';
    } else if (isSupabaseConfigured) {
      supabaseStatus = 'syncing';
      queueProfileWrite({
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || '',
        data: userData,
      });
      setTimeout(() => { flushPendingProfileWrite().catch(() => {}); }, 2000);
      setTimeout(() => { flushPendingProfileWrite().catch(() => {}); }, 10000);
    }

    setUser({ uid: cred.user.uid, ...userData, supabaseStatus });
    setTimeout(() => { handledRef.current = false; }, 200);
    return { uid: cred.user.uid, email, role, supabaseStatus };
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    clearCachedUser();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return;
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await getUserProfile(auth.currentUser.uid);
        if (!error && data) {
          setUser(prev => ({ ...prev, ...data }));
          saveUserLocal(auth.currentUser.uid, data);
        }
      } catch (err) {
        console.warn('Supabase profile refresh failed:', err.message);
      }
    }
  }, []);

  const isAuthenticated = !!user;
  const role = user?.role || null;

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, refreshUser, isAuthenticated, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}