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
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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
