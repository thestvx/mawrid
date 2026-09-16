import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { supabase, isSupabaseConfigured, getUserProfile } from '../lib/supabase';

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

async function upsertUserProfile(cred, data) {
  if (!supabase) return;
  try {
    const row = {
      firebase_uid: cred.user.uid,
      email: cred.user.email,
      name: data.name || cred.user.displayName || '',
      role: data.role || 'buyer',
      phone: data.phone || '',
      store_name: data.storeName || '',
      created_at: data.createdAt || new Date().toISOString(),
    };
    await supabase.from('users').upsert(row, { onConflict: 'firebase_uid' });
  } catch (err) {
    console.warn('Supabase profile write skipped:', err.message);
  }
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
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = useCallback(async (email, password) => {
    handledRef.current = true;
    await signInWithEmailAndPassword(auth, email, password);
    setTimeout(() => { handledRef.current = false; }, 200);
  }, []);

  const signup = useCallback(async ({ email, password, name, role, phone, storeName }) => {
    handledRef.current = true;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userData = {
      name,
      email,
      role,
      phone: phone || '',
      storeName: storeName || '',
      createdAt: new Date().toISOString(),
    };

    // Keep local cache for instant reads
    saveUserLocal(cred.user.uid, userData);

    // Save to Supabase (if configured)
    await upsertUserProfile(cred, userData);

    setUser({ uid: cred.user.uid, ...userData });
    setTimeout(() => { handledRef.current = false; }, 200);
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