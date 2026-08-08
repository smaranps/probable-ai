"use client";

import React, { useState, useEffect } from "react";
import OnboardingModal, { UserProfileData } from "@/app/components/onboarding";
import OverviewDashboard from "@/app/components/dashboard";
import { db, auth } from "../services/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "user_profiles", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfileData);
            setShowModal(false);
          } else {
            const saved = localStorage.getItem("ouac_user_profile");
            if (saved) {
              setUserProfile(JSON.parse(saved));
              setShowModal(false);
            } else {
              setShowModal(true);
            }
          }
        } catch (error) {
          console.error("Firestore read error:", error);
          const saved = localStorage.getItem("ouac_user_profile");
          if (saved) {
            setUserProfile(JSON.parse(saved));
            setShowModal(false);
          } else {
            setShowModal(true);
          }
        }
      } else {
        const saved = localStorage.getItem("ouac_user_profile");
        if (saved) {
          setUserProfile(JSON.parse(saved));
          setShowModal(false);
        } else {
          setShowModal(true);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleModalComplete = (data: UserProfileData) => {
    setUserProfile(data);
    setShowModal(false);
    localStorage.setItem("ouac_user_profile", JSON.stringify(data));
  };

  const handleEditProfile = () => {
    setShowModal(true);
  };
  if (isLoading) {
    return (
      <main className="min-h-screen py-8 flex items-center justify-center bg-slate-950 text-white">
        <p className="text-sm font-medium text-slate-400 animate-pulse">
          Loading your dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8">
      {showModal && (
        <OnboardingModal
          onComplete={handleModalComplete}
          userDisplayName="Student"
        />
      )}

      {userProfile ? (
        <OverviewDashboard
          profile={userProfile}
          onResetModal={handleEditProfile}
        />
      ) : (
        <div className="max-w-md mx-auto text-center pt-24 text-slate-400">
          <p className="text-sm font-medium">
            Complete the steps to generate your admissions analysis.
          </p>
        </div>
      )}
    </main>
  );
}
