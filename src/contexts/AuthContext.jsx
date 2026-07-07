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
        try {
          const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (docSnap.exists()) {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...docSnap.data() });
          } else {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'buyer', name: firebaseUser.displayName || '' });
          }
        } catch (err) {
          console.error('Firestore read error:', err);
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName || '', role: 'buyer' });
        }
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
    handledRef.current = false;
  }, []);

  const signup = useCallback(async ({ email, password, name, role, phone, storeName }) => {
    handledRef.current = true;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userData = { name, email, role, phone: phone || '', storeName: storeName || '', createdAt: new Date().toISOString() };
    try {
      await setDoc(doc(db, 'users', cred.user.uid), userData);
    } catch (err) {
      console.error('Firestore write error (user created in Auth):', err);
    }
    setUser({ uid: cred.user.uid, ...userData });
    handledRef.current = false;
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (auth.currentUser) {
      try {
        const docSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (docSnap.exists()) {
          setUser({ uid: auth.currentUser.uid, email: auth.currentUser.email, ...docSnap.data() });
        }
      } catch (err) {
        console.error('Firestore refresh error:', err);
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
