"use client";

import { useAuth } from "@/app/context/authContext";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import AdmissionMythsSection from "./components/faq";
import { useEffect, useRef, useState } from "react";
import ScrollTiltDashboard from "@/app/components/scrollTiltBoard";
import HowItWorks from "@/app/components/howitworks";
import ProbabilityTeaser from "@/app/components/probabilityteaser";
import ComparisonChart from "@/app/components/chart";
import HeroBackground from "./components/auroraBackground";
import Lenis from "lenis";
import {
  getGuestMode,
  GUEST_MODE_EVENT,
} from "@/app/services/guestMode";

const features = [
  {
    title: "Powered by real outcomes",
    desc: "Built on CUDO applicant records. We look beyond official cutoffs to show historical averages, decision timelines, and acceptance trends.",
  },
  {
    title: "AI profile analysis",
    desc: "Our model evaluates your Top 6 average, target programs, and extracurriculars in context, giving realistic, unbiased probability tiers in seconds.",
  },
  {
    title: "Targeted application strategy",
    desc: "See whether a program is a Safety, Match, or Reach for your stats, then get tailored insights to strengthen supplemental applications.",
  },
];

const rotatingWords = [
  "decoded",
  "simplified",
  "structured",
  "organized",
  "modeled",
];

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isGuest, setIsGuest] = useState(false);
  const [checkedGuest, setCheckedGuest] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    setIsGuest(getGuestMode());
    setCheckedGuest(true);
    const handleGuestChange = () => setIsGuest(getGuestMode());
    window.addEventListener(GUEST_MODE_EVENT, handleGuestChange);
    return () =>
      window.removeEventListener(GUEST_MODE_EVENT, handleGuestChange);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const authResolved = checkedGuest && !loading;
  const isLoggedIn = !!user || isGuest;

  const heroWrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroWrapRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(heroProgress, [0, 1], [1, 0]);
  const heroY = useTransform(heroProgress, [0, 1], [0, -60]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 0.96]);

  return (
    <div className="min-h-screen bg-[var(--mist)] text-[var(--ink)] flex flex-col">
      <div ref={heroWrapRef} className="relative">
  <HeroBackground className="min-h-[88vh]" scrollProgress={heroProgress}>
    <motion.section
      style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
      className="relative flex flex-col items-center justify-center px-6 text-center max-w-3xl mx-auto min-h-[88vh] pt-20 pb-16"
    >
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-5 font-heading text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-white leading-[1.05]"
      >
        Probable<span className="text-[#34D399]">.ai</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="text-white/75 text-lg md:text-xl font-normal mb-10 max-w-md flex items-center justify-center flex-wrap gap-x-1.5"
      >
        <span>Canadian admissions,</span>
        <span className="relative inline-flex h-[1.4em] w-[9ch] justify-center overflow-hidden align-bottom">
          <AnimatePresence mode="wait">
            <motion.span
              key={rotatingWords[wordIndex]}
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="absolute font-heading font-semibold text-[#34D399]"
            >
              {rotatingWords[wordIndex]}
            </motion.span>
          </AnimatePresence>
        </span>
        <span>in seconds.</span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-none"
      >
        {!authResolved ? (
          <div className="h-[46px]" />
        ) : isLoggedIn ? (
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full sm:w-auto px-7 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm rounded-lg transition cursor-pointer"
          >
            Go to Dashboard
          </button>
        ) : (
          <>
            <button
              onClick={() => router.push("/login?mode=login")}
              className="w-full sm:w-auto px-7 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm rounded-lg transition cursor-pointer"
            >
              Analyze my profile
            </button>
            <button
              onClick={() => router.push("/login?mode=signup")}
              className="w-full sm:w-auto px-7 py-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white/80 hover:text-white font-medium text-sm rounded-lg transition cursor-pointer"
            >
              Sign up
            </button>
          </>
        )}
      </motion.div>
    </motion.section>
  </HeroBackground>
</div>

      <HowItWorks />

      <section
        id="about"
        className="bg-[var(--paper)] text-[var(--ink)] py-24 px-6 w-full border-t border-[var(--border)]"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mb-14 max-w-xl"
          >
            <p className="font-heading text-[var(--accent)] text-xs font-semibold tracking-[0.18em] uppercase mb-3">
              Why Probable
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              Clarity built on real Canadian admissions data
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 mb-20">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="mb-4 h-px w-10 bg-[var(--accent)]" />
                <h3 className="font-heading text-lg font-semibold text-[var(--ink)] mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-[var(--ink-soft)] text-[15px] leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <ScrollTiltDashboard />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16"
          >
            <ComparisonChart />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="text-center mt-10"
          >
            <button
              onClick={() => router.push("/login?mode=signup")}
              className="text-[var(--ink-soft)] hover:text-[var(--accent)] font-medium underline underline-offset-4 text-sm transition cursor-pointer"
            >
              Sign up now
            </button>
          </motion.div>
        </div>
      </section>

      <AdmissionMythsSection />
      <ProbabilityTeaser />

      <footer className="bg-[var(--ink)] border-t border-white/10 py-12 px-6 text-sm text-white/55">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center font-heading font-bold text-white text-[11px]">
                P
              </div>
              <span className="font-heading font-semibold text-white tracking-tight">
                Probable<span className="text-[var(--accent)]">.ai</span>
              </span>
            </div>

            <p className="text-xs text-white/45">
              Created by{" "}
              <span className="text-white/80 font-medium">
                Smaran Pinisetty
              </span>{" "}
              &copy; 2026 Probable.ai. All rights reserved.
            </p>

            <div className="flex gap-5 text-xs">
              <a
                onClick={() => router.push("/privacy")}
                className="hover:text-white transition cursor-pointer"
              >
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-white transition">
                Terms of Service
              </a>
            </div>
          </div>

          <div className="h-px bg-white/10" />

          <div className="text-[11px] text-white/40 leading-relaxed space-y-2 text-center sm:text-left max-w-4xl">
            <p>
              <strong className="text-white/55 font-medium">Disclaimer:</strong>{" "}
              Probable.ai is an independent, AI-driven evaluation tool intended
              for informational and planning purposes only. Estimated
              probabilities are generated using historical admission trends,
              public dataset benchmarks (including CUDO and OUInfo), and AI
              modeling.
            </p>
            <p>
              Probable.ai is not officially affiliated with, endorsed by, or
              connected to the Ontario Universities&apos; Application Centre
              (OUAC) or any university (such as the University of Waterloo,
              University of Toronto, McMaster University, or UBC). Official
              admissions decisions are made solely by individual university
              admissions committees.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
