"use client";

import Link from "next/link";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { AuroraBackground } from "@/app/components/auroraBackground";
import { useAuth } from "@/app/context/authContext";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/navbar";
import { motion } from "framer-motion";
import AdmissionMythsSection from "./components/faq";

// Animations proivded by Google Gemini
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.21, 0.47, 0.32, 0.98] as const,
    },
  },
};

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
      <AuroraBackground className="h-[80vh] min-h-[600px] flex items-center justify-center pt-16">
        <section className="flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Probable<span className="text-[#10B981]">.ai</span>
          </h1>
          <p className="text-[#94A3B8] text-base sm:text-lg md:text-xl font-normal mb-8 max-w-xl">
            Your academic profile, analyzed in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-none">
            <button
              onClick={() => router.push("/login?mode=login")}
              className="w-full sm:w-auto px-7 py-3 bg-[#10B981] hover:bg-[#14B8A6] text-slate-950 font-bold text-sm rounded-lg transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Analyze my profile!
            </button>
            <button
              onClick={() => router.push("/login?mode=signup")}
              className="w-full sm:w-auto px-7 py-3 bg-[#111827] hover:bg-[#1E293B] border border-[#1E293B] text-[#94A3B8] hover:text-white font-medium text-sm rounded-lg transition cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </section>
      </AuroraBackground>
      <section
        id="about"
        className="bg-slate-200 text-slate-900 py-20 px-6 w-full flex-grow overflow-hidden"
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-2xl font-extrabold mb-8 text-slate-900">
            About our application:
          </h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="space-y-4"
          >
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white border border-emerald-200/80 p-6 rounded-xl flex items-start gap-5 shadow-sm hover:shadow-md transition cursor-default"
            >
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-xl shrink-0 flex items-center justify-center text-emerald-600 shadow-sm">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
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
            </motion.div>
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white border border-emerald-200/80 p-6 rounded-xl flex items-start gap-5 shadow-sm hover:shadow-md transition cursor-default"
            >
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-xl shrink-0 flex items-center justify-center text-emerald-600 shadow-sm">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
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
            </motion.div>
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white border border-emerald-200/80 p-6 rounded-xl flex items-start gap-5 shadow-sm hover:shadow-md transition cursor-default"
            >
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-xl shrink-0 flex items-center justify-center text-emerald-600 shadow-sm">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0-6C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
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
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <button
              onClick={signInWithGoogle}
              className="text-slate-700 hover:text-slate-950 font-medium underline text-xs transition cursor-pointer"
            >
              Sign Up Below!
            </button>
          </motion.div>
        </div>
        <br />
        <br />
        <hr />
        <section id="faq">
          <AdmissionMythsSection />
        </section>
      </section>

      <footer className="bg-[#090D16] border-t border-[#1E293B] py-10 px-6 text-xs text-[#94A3B8]">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#10B981] flex items-center justify-center font-bold text-slate-950 text-[11px]">
                P
              </div>
              <span className="font-heading font-bold text-white tracking-tight text-sm">
                Probable<span className="text-[#10B981]">.ai</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs">
              Created by &nbsp;
              <span className="text-white font-medium">Smaran Pinisetty</span>
              &nbsp; &copy; 2026 Probable.ai. All rights reserved.
            </p>

            <div className="flex gap-4 text-slate-400 text-xs">
              <a href="#" className="hover:text-white transition">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition">
                Terms of Service
              </a>
            </div>
          </div>
          <hr className="border-[#1E293B]" />
          <div className="text-[11px] text-slate-500 leading-relaxed space-y-2 text-center sm:text-left">
            <p>
              <strong className="text-slate-400">Disclaimer:</strong>{" "}
              Probable.ai is an independent, AI-driven evaluation tool intended
              for informational and planning purposes only. Estimated
              probabilities are generated using historical admission trends,
              public dataset benchmarks (including CUDO and OUInfo), and AI
              modeling.
            </p>
            <p>
              Probable.ai is not officially affiliated with, endorsed by, or
              connected to the Ontario Universities' Application Centre (OUAC)
              or any university (such as the University of Waterloo, University
              of Toronto, McMaster University, or UBC). Official admissions
              decisions are made solely by individual university admissions
              committees.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
