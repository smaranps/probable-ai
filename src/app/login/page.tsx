"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/authContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();

  const handleGoogleAuth = async () => {
    setError("");
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Failed to authenticate with Google.");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      router.push("/dashboard");
    } catch (err: any) {
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError("Invalid email or password.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col md:flex-row">
      <div className="md:w-1/2 p-12 flex flex-col justify-between border-r border-[#1E293B] bg-gradient-to-br from-[#090D16] via-[#07120e] to-[#064E3B]/20">
        <div>
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-7 h-7 rounded-md bg-[#10B981] flex items-center justify-center font-bold text-slate-950 text-sm">
              P
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Probable<span className="text-[#10B981]">.ai</span>
            </span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Calculate your university chances.
          </h1>
          <p className="text-[#94A3B8] text-lg max-w-md">
            Our website analyzes your top 6 average, target programs,
            extracurriculars, specific math contests, and university-specific
            factors/penalities using real Admissions Data.
          </p>
        </div>
        <p className="text-xs text-[#64748B] mt-8">
          Powered by real Ontario applicant data & Gemini AI.
        </p>
      </div>

      <div className="md:w-1/2 p-6 md:p-12 flex items-center justify-center">
        <div className="w-full max-w-md bg-[#111827] border border-[#1E293B] p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-2">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h2>
          <p className="text-sm text-[#94A3B8] mb-6">
            {isSignUp
              ? "Sign up to analyze your profile"
              : "Log in to access your dashboard"}
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-[#1E293B] text-white font-medium text-sm rounded-lg transition flex items-center justify-center gap-3 mb-6 cursor-pointer"
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
            Continue with Google
          </button>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-[#1E293B] w-full"></div>
            <span className="bg-[#111827] px-3 text-xs text-[#64748B] absolute">
              OR
            </span>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#090D16] border border-[#1E293B] focus:border-[#10B981] text-white text-sm rounded-lg p-2.5 outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#090D16] border border-[#1E293B] focus:border-[#10B981] text-white text-sm rounded-lg p-2.5 outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#10B981] hover:bg-[#14B8A6] text-slate-950 font-bold text-sm rounded-lg transition shadow-lg shadow-emerald-500/20 mt-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Loading..." : isSignUp ? "Sign Up" : "Log In"}
            </button>
          </form>

          <p className="text-xs text-center text-[#94A3B8] mt-6">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setError("");
                setIsSignUp(!isSignUp);
              }}
              className="text-[#10B981] hover:underline font-medium ml-1 cursor-pointer"
            >
              {isSignUp ? "Log In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
