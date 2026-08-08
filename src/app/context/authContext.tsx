"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut,
  onAuthStateChanged,
  UserCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/app/services/firebaseConfig";
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<UserCredential>;
  signUpWithEmail: (
    email: string,
    pass: string,
    fullName: string
  ) => Promise<UserCredential>;
  signInWithEmail: (email: string, pass: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  const signInWithGoogle = async (): Promise<UserCredential> => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    if (cred.user) {
      const userRef = doc(db, "users", cred.user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(
          userRef,
          {
            uid: cred.user.uid,
            displayName: cred.user.displayName || "",
            email: cred.user.email || "",
            photoURL: cred.user.photoURL || "",
            createdAt: new Date().toISOString(),
            onboardingCompleted: false,
          },
          { merge: true }
        );
      }
    }
    return cred;
  };
  const signUpWithEmail = async (
    email: string,
    pass: string,
    fullName: string
  ): Promise<UserCredential> => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      pass
    );
    await updateProfile(userCredential.user, { displayName: fullName });
    const userRef = doc(db, "users", userCredential.user.uid);
    await setDoc(
      userRef,
      {
        uid: userCredential.user.uid,
        displayName: fullName,
        email: email,
        createdAt: new Date().toISOString(),
        onboardingCompleted: false,
      },
      { merge: true }
    );
    await sendEmailVerification(userCredential.user);
    return userCredential;
  };
  const signInWithEmail = async (
    email: string,
    pass: string
  ): Promise<UserCredential> => {
    return await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    await signOut(auth);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
