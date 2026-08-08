// Source: Google's Firebase Initialize Setup (Guarded for Next.js Build Phase)

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const hasValidKey = Boolean(
  firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined"
);

const app: FirebaseApp | null = hasValidKey
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const auth = (app ? getAuth(app) : {}) as Auth;
export const googleProvider = new GoogleAuthProvider();
export const db = (app ? getFirestore(app) : {}) as Firestore;

export default app;
