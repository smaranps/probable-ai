import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "gen-lang-client-0275138457.firebaseapp.com",
  projectId: "gen-lang-client-0275138457",
  storageBucket: "gen-lang-client-0275138457.firebasestorage.app",
  messagingSenderId: "97995799641",
  appId: "1:97995799641:web:7b398ff40d6c08c11ec548",
};

// Prevent re-initializing Firebase during Next.js hot-reloading
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Export instances to use across your app
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
