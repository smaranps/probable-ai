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

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: string;
  onboardingCompleted?: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<UserCredential>;
  signUpWithEmail: (
    email: string,
    pass: string,
    fullName: string
  ) => Promise<UserCredential>;
  signInWithEmail: (email: string, pass: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchUserProfile = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setProfile(userSnap.data() as UserProfile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.uid);
    }
  };
  const signInWithGoogle = async (): Promise<UserCredential> => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    if (cred.user) {
      const userRef = doc(db, "users", cred.user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const newProfile = {
          uid: cred.user.uid,
          displayName: cred.user.displayName || "",
          email: cred.user.email || "",
          photoURL: cred.user.photoURL || "",
          createdAt: new Date().toISOString(),
          onboardingCompleted: false,
        };
        await setDoc(userRef, newProfile, { merge: true });
        setProfile(newProfile);
      } else {
        setProfile(userSnap.data() as UserProfile);
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
    const newProfile = {
      uid: userCredential.user.uid,
      displayName: fullName,
      email: email,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
    };
    await setDoc(userRef, newProfile, { merge: true });
    setProfile(newProfile);
    await sendEmailVerification(userCredential.user);
    return userCredential;
  };

  const signInWithEmail = async (
    email: string,
    pass: string
  ): Promise<UserCredential> => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await fetchUserProfile(cred.user.uid);
    }
    return cred;
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        logout,
        refreshProfile,
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
