import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAf8OV7c4pz4t0QLjFX24QLT9eBz150cuc',
  authDomain: 'mawrid-2372c.firebaseapp.com',
  projectId: 'mawrid-2372c',
  storageBucket: 'mawrid-2372c.firebasestorage.app',
  messagingSenderId: '988338030349',
  appId: '1:988338030349:web:e9f6cbbd70eb83746a1244',
  measurementId: 'G-W8RFQ58RT6',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;