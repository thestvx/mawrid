import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext(null);

function saveUserRole(uid, role, name, email) {
  try {
    localStorage.setItem('mawrid_user', JSON.stringify({ uid, role, name, email }));
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

async function readUserRole(uid) {
  try {
    const snap = await get(ref(db, `users/${uid}`));
    if (snap.exists()) return snap.val();
    return null;
  } catch {
    return null;
  }
}

async function writeUserRole(uid, data) {
  try {
    await set(ref(db, `users/${uid}`), data);
  } catch (err) {
    console.warn('RTDB write skipped:', err.message);
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

        // Try Realtime Database first
        const rtdbData = await readUserRole(firebaseUser.uid);
        if (rtdbData) {
          role = rtdbData.role || 'buyer';
          name = rtdbData.name || name;
          extraData = rtdbData;
        } else {
          // Fallback to localStorage
          const cached = getCachedUser();
          if (cached && cached.uid === firebaseUser.uid) {
            role = cached.role || 'buyer';
            name = cached.name || name;
          }
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
    const userData = { name, email, role, phone: phone || '', storeName: storeName || '', createdAt: new Date().toISOString() };

    // Save to localStorage immediately
    saveUserRole(cred.user.uid, role, name, email);

    // Write to Realtime Database
    await writeUserRole(cred.user.uid, userData);

    setUser({ uid: cred.user.uid, ...userData });
    setTimeout(() => { handledRef.current = false; }, 200);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    clearCachedUser();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (auth.currentUser) {
      const data = await readUserRole(auth.currentUser.uid);
      if (data) {
        setUser(prev => ({ ...prev, ...data }));
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
