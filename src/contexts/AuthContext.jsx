import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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

        // Try Firestore first
        try {
          const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            role = data.role || 'buyer';
            name = data.name || name;
            extraData = data;
          } else {
            // No Firestore doc — check localStorage
            const cached = getCachedUser();
            if (cached && cached.uid === firebaseUser.uid) {
              role = cached.role || 'buyer';
              name = cached.name || name;
            }
          }
        } catch (err) {
          // Firestore unavailable — use localStorage fallback
          console.warn('Firestore unavailable, using localStorage:', err.message);
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
    // handledRef will be reset after onAuthStateChanged processes
    setTimeout(() => { handledRef.current = false; }, 100);
  }, []);

  const signup = useCallback(async ({ email, password, name, role, phone, storeName }) => {
    handledRef.current = true;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userData = { name, email, role, phone: phone || '', storeName: storeName || '', createdAt: new Date().toISOString() };

    // Always save to localStorage as backup
    saveUserRole(cred.user.uid, role, name, email);

    // Try Firestore (may fail if DB not created)
    try {
      await setDoc(doc(db, 'users', cred.user.uid), userData);
    } catch (err) {
      console.warn('Firestore write skipped (DB may not exist):', err.message);
    }

    setUser({ uid: cred.user.uid, ...userData });
    setTimeout(() => { handledRef.current = false; }, 100);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    clearCachedUser();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (auth.currentUser) {
      try {
        const docSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (docSnap.exists()) {
          setUser(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch {
        // Firestore unavailable
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
