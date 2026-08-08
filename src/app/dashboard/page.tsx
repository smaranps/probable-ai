"use client";

import React, { useState, useEffect } from "react";
import OnboardingModal, { UserProfileData } from "@/app/components/onboarding";
import OverviewDashboard from "@/app/components/dashboard";

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [showModal, setShowModal] = useState<boolean>(true);

  useEffect(() => {
    const saved = localStorage.getItem("ouac_user_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserProfile(parsed);
        setShowModal(false);
      } catch (err) {
        console.error("Failed to load saved profile", err);
      }
    }
  }, []);

  const handleModalComplete = (data: UserProfileData) => {
    setUserProfile(data);
    setShowModal(false);
    localStorage.setItem("ouac_user_profile", JSON.stringify(data));
  };

  const handleEditProfile = () => {
    setShowModal(true);
  };

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
