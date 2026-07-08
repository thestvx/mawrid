import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDUWwLWDzg0zv0r6tC62vzUD4E8LBiThtw',
  authDomain: 'mawrid-4c4de.firebaseapp.com',
  projectId: 'mawrid-4c4de',
  storageBucket: 'mawrid-4c4de.firebasestorage.app',
  messagingSenderId: '597814682673',
  appId: '1:597814682673:web:023f5735cce4d589b72110',
  measurementId: 'G-WLXD24RMYK',
  databaseURL: 'https://mawrid-4c4de-default-rtdb.europe-west1.firebasedatabase.app',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
