"use client";

import React from "react";
import { useRouter } from "next/navigation";
import OnboardingModal, { UserProfileData } from "@/app/components/onboarding";
import { useAuth } from "@/app/context/authContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import {
  AuroraBackground,
  FloatingParticles,
} from "../components/auroraBackground";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleOnboardingComplete = async (data: UserProfileData) => {
    if (
      typeof window !== "undefined" &&
      localStorage.getItem("isGuestMode") === "true"
    ) {
      localStorage.setItem("guestOnboardingCompleted", "true");
      localStorage.setItem("guestProfileData", JSON.stringify(data));
      router.push("/dashboard");
      return;
    }
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(
          userDocRef,
          {
            onboardingCompleted: true,
            profileData: data,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error("Failed to save onboarding data to Firestore:", err);
      }
    }

    router.push("/dashboard");
  };

  return (
    <AuroraBackground>
      <main className="min-h-screen  flex items-center justify-center p-4">
        <FloatingParticles />
        <OnboardingModal
          userDisplayName={user?.displayName || "Student"}
          onComplete={handleOnboardingComplete}
        />
      </main>
    </AuroraBackground>
  );
}
