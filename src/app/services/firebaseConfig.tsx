// Source: Google's Firebase Initialize Setup (Guarded for Next.js Build Phase)

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyCqrFuJEWC2nEn00PwLYVRi0tHcOqYwKqg",
  authDomain: "gen-lang-client-0275138457.firebaseapp.com",
  projectId: "gen-lang-client-0275138457",
  storageBucket: "gen-lang-client-0275138457.firebasestorage.app",
  messagingSenderId: "97995799641",
  appId: "1:97995799641:web:7b398ff40d6c08c11ec548",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
let dbInstance: Firestore;

if (getApps().length > 1 || (app as any)._initializedStore) {
  dbInstance = getFirestore(app);
} else {
  try {
    dbInstance = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
    (app as any)._initializedStore = true;
  } catch (e) {
    dbInstance = getFirestore(app);
  }
}
export const db = dbInstance;
export default app;
