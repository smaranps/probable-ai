"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingModal, {
  UserProfileData,
  TargetChoice,
} from "@/app/components/onboarding";
import { useAuth } from "@/app/context/authContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { SelectionSummary } from "../components/sideComponent";
import {
  AuroraBackground,
  FloatingParticles,
} from "../components/auroraBackground";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();

  // State to hold choices passed up from the OnboardingModal
  const [liveChoices, setLiveChoices] = useState<TargetChoice[]>([
    { university: "", program: "" },
    { university: "", program: "" },
    { university: "", program: "" },
  ]);

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
      <main className="min-h-screen flex items-center justify-center p-4 py-12">
        <FloatingParticles />
        <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 w-full max-w-5xl">
          <div className="w-full lg:w-[80%]">
            <OnboardingModal
              userDisplayName={user?.displayName || "Student"}
              onComplete={handleOnboardingComplete}
              onChoicesChange={setLiveChoices}
            />
          </div>
          <div className="shrink-0 lg:sticky lg:top-12 lg:w-[20%]">
            <SelectionSummary targetChoices={liveChoices} />
          </div>
        </div>
      </main>
    </AuroraBackground>
  );
}
