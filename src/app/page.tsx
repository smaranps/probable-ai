"use client";

import Link from "next/link";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { AuroraBackground } from "@/app/components/auroraBackground";
import { useAuth } from "@/app/context/authContext";
import { useRouter } from "next/navigation";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-plus-jakarta",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export default function Home() {
  const router = useRouter();
  const { user, signInWithGoogle } = useAuth();

  return (
    <div
      className={`${inter.variable} ${plusJakarta.variable} font-sans min-h-screen bg-[#090D16] text-white flex flex-col justify-between`}
    >
      <div className="relative min-h-screen flex flex-col justify-between">
        <AuroraBackground>
          <div className="sticky top-0 z-50 pt-4 px-4 sm:px-8 max-w-5xl mx-auto w-full">
            <nav className="bg-[#111827]/60 backdrop-blur-md border border-[#1E293B]/80 rounded-2xl px-6 py-3.5 flex items-center justify-between shadow-lg shadow-black/20">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#10B981] flex items-center justify-center font-bold text-slate-950 text-xs">
                  P
                </div>
                <span className="font-heading text-xl font-bold tracking-tight text-white">
                  Probable<span className="text-[#10B981]">.ai</span>
                </span>
              </div>

              <div className="flex items-center gap-6 text-sm font-medium">
                <a
                  href="#about"
                  className="text-[#94A3B8] hover:text-white transition"
                >
                  How It Works
                </a>
                {user ? (
                  <Link
                    href="/dashboard"
                    className="px-4 py-1.5 bg-[#10B981] hover:bg-[#14B8A6] text-slate-950 font-semibold rounded-lg transition"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={signInWithGoogle}
                      className="px-4 py-1.5 text-[#94A3B8] hover:text-white transition"
                    >
                      Sign up
                    </button>
                    <button
                      onClick={signInWithGoogle}
                      className="px-4 py-1.5 bg-[#10B981] hover:bg-[#14B8A6] text-slate-950 font-semibold rounded-lg transition"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
          <section className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto my-auto py-12">
            <h1 className="font-heading text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-white mb-4 leading-none">
              Probable<span className="text-[#10B981]">.ai</span>
            </h1>
            <p className="text-[#94A3B8] text-lg sm:text-xl md:text-2xl font-normal mb-8 max-w-xl">
              Your academic profile, analyzed in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-none">
              <button
                onClick={signInWithGoogle}
                className="w-full sm:w-auto px-7 py-3 bg-[#10B981] hover:bg-[#14B8A6] text-slate-950 font-bold text-sm rounded-lg transition shadow-lg shadow-emerald-500/20"
              >
                Analyze my profile!
              </button>
              <button
                onClick={() => router.push("/login")}
                className="w-full sm:w-auto px-7 py-3 bg-[#111827] hover:bg-[#1E293B] border border-[#1E293B] text-[#94A3B8] hover:text-white font-medium text-sm rounded-lg transition"
              >
                Login
              </button>
            </div>
          </section>

          <div className="h-16 pointer-events-none"></div>
        </AuroraBackground>
      </div>

      <section
        id="about"
        className="bg-[#D1FAE5] text-slate-900 py-20 px-6 w-full flex-grow"
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-2xl font-extrabold mb-8 text-slate-900">
            About our application:
          </h2>

          <div className="space-y-4">
            <div className="bg-white border border-emerald-200/80 p-6 rounded-xl flex items-start gap-5 shadow-sm hover:shadow-md transition">
              <div className="w-24 h-20 bg-emerald-50 border border-emerald-100 rounded-lg shrink-0 flex items-center justify-center text-emerald-500">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900 mb-1">
                  Powered by Real Outcomes
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Built on thousands of crowd-sourced Ontario applicant records.
                  We look beyond official general cutoffs to show you the actual
                  historical averages, decision timelines, and real acceptance
                  trends.
                </p>
              </div>
            </div>

            <div className="bg-white border border-emerald-200/80 p-6 rounded-xl flex items-start gap-5 shadow-sm hover:shadow-md transition">
              <div className="w-24 h-20 bg-emerald-50 border border-emerald-100 rounded-lg shrink-0 flex items-center justify-center text-emerald-500">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900 mb-1">
                  AI-Driven Profile Analysis
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Our intelligent model evaluates your Top 6 average, target
                  programs, and extra curriculars in context, giving you
                  realistic, non-biased probability tiers in seconds.
                </p>
              </div>
            </div>

            <div className="bg-white border border-emerald-200/80 p-6 rounded-xl flex items-start gap-5 shadow-sm hover:shadow-md transition">
              <div className="w-24 h-20 bg-emerald-50 border border-emerald-100 rounded-lg shrink-0 flex items-center justify-center text-emerald-500">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900 mb-1">
                  Targeted Application Strategy
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Stop guessing where you stand. Discover whether a program is a
                  Safety, Match, or Reach for your specific stats, and get
                  tailored insights to optimize your supplemental applications
                  (AIF).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={signInWithGoogle}
              className="text-slate-700 hover:text-slate-950 font-medium underline text-xs transition"
            >
              Sign Up Below!
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-[#090D16] border-t border-[#1E293B] py-8 px-6 text-center text-xs text-[#94A3B8]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#10B981] flex items-center justify-center font-bold text-slate-950 text-[10px]">
              P
            </div>
            <span className="font-heading font-bold text-white tracking-tight">
              Probable<span className="text-[#10B981]">.ai</span>
            </span>
          </div>

          <p className="text-slate-400">
            Created by
            <span className="text-white font-medium">Smaran Pinisetty</span>
            &copy; 2026 Probable.ai. All rights reserved.
          </p>

          <div className="flex gap-4 text-slate-400">
            <a href="#" className="hover:text-white transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
