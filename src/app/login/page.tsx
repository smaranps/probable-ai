"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/app/context/authContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { db } from "../services/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const [isSignUp, setIsSignUp] = useState(modeParam === "signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (modeParam === "signup") {
      setIsSignUp(true);
    } else if (modeParam === "login") {
      setIsSignUp(false);
    }
  }, [modeParam]);

  useEffect(() => {
    localStorage.removeItem("user_profile");
    localStorage.removeItem("auth_token");
  }, []);

  // Sign in with Google was fixed with help from Claude/Google Gemini.
  const handlePostAuthRedirect = async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      let userSnap = null;
      let retries = 3;

      while (retries > 0) {
        try {
          userSnap = await getDoc(userDocRef);
          break;
        } catch (innerErr: any) {
          if (
            innerErr?.code === "unavailable" ||
            innerErr?.message?.toLowerCase().includes("offline")
          ) {
            retries -= 1;
            if (retries === 0) throw innerErr;
            await new Promise((res) => setTimeout(res, 500));
          } else {
            throw innerErr;
          }
        }
      }
      if (
        userSnap &&
        userSnap.exists() &&
        userSnap.data()?.onboardingCompleted
      ) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch (err) {
      console.error("Error fetching user data after auth:", err);
      router.push("/onboarding");
    }
  };
  const handleGoogleAuth = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      const res: any = await signInWithGoogle();
      if (res?.user) {
        await handlePostAuthRedirect(res.user.uid);
      } else {
        router.push("/onboarding");
      }
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") {
        setIsSubmitting(false);
        return;
      }
      setError(err?.message || "Failed to authenticate with Google.");
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("isGuestMode", "true");
      const guestCompleted = localStorage.getItem("guestOnboardingCompleted");
      if (guestCompleted === "true") {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, fullName);
        router.push("/onboarding");
      } else {
        const res: any = await signInWithEmail(email, password);
        if (res?.user) {
          await handlePostAuthRedirect(res.user.uid);
        } else {
          router.push("/onboarding");
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Invalid email or password.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    }
  };

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090D16]" />}>
      <div className="min-h-screen flex flex-col md:flex-row">
        <div className="md:w-1/2 bg-[#090D16] text-white p-8 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#1E293B]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 mb-16">
              <div className="w-8 h-8 rounded-lg bg-[#10B981] flex items-center justify-center font-bold text-[#090D16] text-base">
                P
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Probable<span className="text-[#10B981]">.ai</span>
              </span>
            </Link>
            <div className="max-w-lg space-y-4">
              <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-[#10B981] uppercase bg-[#064E3B]/30 border border-[#10B981]/20 rounded-full">
                Ontario Admissions Intelligence
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Calculate your university chances.
              </h1>
              <p className="text-[#94A3B8] text-base leading-relaxed pt-2">
                Our platform analyzes your Top 6 average, target programs,
                extracurriculars, contest scores, and university-specific
                factors/penalties, along with using historical Ontario
                admissions data.
              </p>
            </div>
          </div>

          <p className="text-xs text-[#64748B] mt-12">
            Powered by real Ontario applicant data & Gemini AI.
          </p>
        </div>
        <div className="md:w-1/2 bg-slate-100 p-6 md:p-12 flex items-center justify-center relative overflow-hidden">
          <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-300/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-teal-300/30 rounded-full blur-3xl pointer-events-none" />

          <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/80 p-8 rounded-2xl shadow-2xl relative z-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
                {isSignUp ? "Create an account" : "Welcome back"}
              </h2>
              <p className="text-sm text-slate-600">
                {isSignUp
                  ? "Sign up to start calculating your admissions odds"
                  : "Log in to access your dashboard"}
              </p>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-600 text-xs p-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            <div className="space-y-3 mb-6">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleGoogleAuth}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm rounded-lg transition-all shadow-sm flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.3s.7 2.6 1.9 5l3.7-2.5z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                  />
                </svg>
                {isSubmitting ? "Authenticating..." : "Continue with Google"}
              </button>
              <button
                type="button"
                onClick={handleGuestLogin}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Continue as Guest / Try Demo
              </button>
            </div>
            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white/80 px-3 text-xs text-slate-500 absolute font-mono rounded">
                OR
              </span>
            </div>
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-white/80 border border-slate-200 focus:border-[#10B981] text-slate-900 text-sm rounded-lg p-2.5 outline-none transition shadow-sm"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/80 border border-slate-200 focus:border-[#10B981] text-slate-900 text-sm rounded-lg p-2.5 outline-none transition shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/80 border border-slate-200 focus:border-[#10B981] text-slate-900 text-sm rounded-lg p-2.5 outline-none transition shadow-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#090D16] hover:bg-slate-800 text-white font-semibold text-sm rounded-lg transition-all mt-2 cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : isSignUp ? (
                  "Sign Up"
                ) : (
                  "Log In"
                )}
              </button>
            </form>
            <p className="text-xs text-center text-slate-600 mt-6">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setIsSignUp(!isSignUp);
                }}
                className="text-[#059669] hover:underline font-semibold ml-1 cursor-pointer"
              >
                {isSignUp ? "Log In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
