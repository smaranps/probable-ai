"use client";
import { LiquidBackground } from "@/app/components/dashboardBackground";
import React, { useState, useEffect } from "react";
import { UserProfileData } from "@/app/components/onboarding";
import { FloatingParticles } from "@/app/components/dashboardParticles";
import { Google_Sans_Flex } from "next/font/google";
import { useRouter } from "next/navigation";
import DetailedReportModal from "./detailedReport";
import Navbar from "./navbar";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import CreditCounter from "@/app/components/limits";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../services/firebaseConfig";
import { NextRequest } from "next/server";

const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-google-sans-flex",
});

import {
  GraduationCap,
  AlertTriangle,
  Flame,
  Bot,
  CheckCircle2,
  BookOpen,
  RefreshCw,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import DashboardCharts from "@/app/components/graph";
import {
  CompetitivenessRadar,
  RadarMetrics,
} from "@/app/components/CompetitivenessRadar";

interface OverviewDashboardProps {
  profile: UserProfileData;
  onResetModal: () => void;
}

interface AIAnalysisResult {
  estimatedMin?: number;
  estimatedMax?: number;
  tier?: string;
  reasoning?: string;
  radarMetrics?: RadarMetrics;
}
export interface TargetChoice {
  university: string;
  program: string;
}

export interface TargetProgramOption {
  id: string;
  university: string;
  program: string;
  tier: "Safety" | "Match" | "Target" | "Reach";
  minOdds: number;
  maxOdds: number;
}

interface CachedResult {
  aiResult: AIAnalysisResult | null;
  rawTextResponse: string;
}
type ResultsCache = Record<string, CachedResult>;

const cacheKey = (programId: string, mode: "advisor" | "roast") =>
  `${programId}::${mode}`;

const TIER_BADGE_STYLES: Record<string, string> = {
  Safety: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Match: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Target: "bg-amber-50 text-amber-700 border-amber-200",
  Reach: "bg-rose-50 text-rose-700 border-rose-200",
};

const buildInitialTargets = (
  profile: UserProfileData
): TargetProgramOption[] => {
  const choices =
    profile.targetChoices && profile.targetChoices.length > 0
      ? profile.targetChoices
      : [{ university: profile.university, program: profile.program }];

  return choices.slice(0, 3).map((choice, idx) => ({
    id: `target-${idx}`,
    university: choice.university || "Untitled Choice",
    program: choice.program || "—",
    tier: "Match" as const,
    minOdds: 0,
    maxOdds: 0,
  }));
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

const GUEST_RESULTS_KEY = "guestResultsCache";

export default function OverviewDashboard({
  profile,
  onResetModal,
}: OverviewDashboardProps) {
  const [targetPrograms, setTargetPrograms] = useState<TargetProgramOption[]>(
    () => buildInitialTargets(profile)
  );
  const [activeProgramId, setActiveProgramId] = useState<string>("primary");
  const [mode, setMode] = useState<"advisor" | "roast">("advisor");
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [rawTextResponse, setRawTextResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [maxCredits, setMaxCredits] = useState<number>(5);
  const [userCredits, setUserCredits] = useState<number>(5);
  function getClientIp(req: NextRequest): string {
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    return req.headers.get("x-real-ip") ?? "unknown";
  }

  const [creditsLoaded, setCreditsLoaded] = useState<boolean>(false);
  const [currentProfile, setCurrentProfile] = useState<UserProfileData | null>(
    null
  );
  const [resultsCache, setResultsCache] = useState<ResultsCache>({});
  const getTodayKey = () => new Date().toISOString().split("T")[0];
  const activeProgram =
    targetPrograms.find((p) => p.id === activeProgramId) || targetPrograms[0];
  const persistResultsCache = async (
    nextCache: ResultsCache,
    nextTargets: TargetProgramOption[] = targetPrograms
  ) => {
    if (isGuest) {
      try {
        localStorage.setItem(GUEST_RESULTS_KEY, JSON.stringify(nextCache));
      } catch (err) {
        console.error("Guest cache save error:", err);
      }
      return;
    }
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await setDoc(
          doc(db, "users", currentUser.uid),
          {
            resultsCache: nextCache,
            targetPrograms: nextTargets,
            activeProgramId,
            mode,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error("Results cache save error:", err);
      }
    }
  };

  const applyCachedOrEmpty = (
    programId: string,
    forMode: "advisor" | "roast",
    cache: ResultsCache = resultsCache
  ) => {
    const cached = cache[cacheKey(programId, forMode)];
    if (cached) {
      setAiResult(cached.aiResult);
      setRawTextResponse(cached.rawTextResponse);
      setHasRun(true);
    } else {
      setAiResult(null);
      setRawTextResponse("");
      setHasRun(false);
    }
  };

  const handleRunAnalysis = async (
    selectedMode = mode,
    prog = activeProgram
  ) => {
    if (userCredits <= 0) {
      setRawTextResponse(
        isGuest
          ? "You have reached your guest limit of 1 analysis. Please sign up to get 5 daily analyses!"
          : "You have reached your daily limit of 5 analyses."
      );
      setHasRun(true);
      return;
    }

    setLoading(true);
    try {
      const activeProfileContext = {
        ...profile,
        university: prog.university,
        program: prog.program,
      };
      const currentUser = auth.currentUser;
      const idToken = currentUser ? await currentUser.getIdToken() : null;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: activeProfileContext,
          mode: selectedMode,
          idToken,
        }),
      });
      if (res.status === 429) {
        const errData = await res.json();
        setRawTextResponse(errData.error ?? "Daily limit reached.");
        setHasRun(true);
        setUserCredits(0);
        setLoading(false);
        return;
      }

      const rawBody = await res.text();
      console.log("Raw response:", res.status, rawBody);

      let data: any;
      try {
        data = JSON.parse(rawBody);
      } catch (e) {
        console.error("Failed to parse response as JSON:", rawBody);
        setRawTextResponse("Error connecting to admissions AI.");
        setHasRun(true);
        setLoading(false);
        return;
      }
      if (data.estimatedMin !== undefined) {
        setAiResult(data);
        setHasRun(true);
        await spendCredit(currentUser?.uid);

        const updatedTargets = targetPrograms.map((p) =>
          p.id === prog.id
            ? {
                ...p,
                minOdds: data.estimatedMin,
                maxOdds: data.estimatedMax,
                tier: data.tier || p.tier,
              }
            : p
        );
        setTargetPrograms(updatedTargets);

        const nextCache: ResultsCache = {
          ...resultsCache,
          [cacheKey(prog.id, selectedMode)]: {
            aiResult: data,
            rawTextResponse: "",
          },
        };
        setResultsCache(nextCache);
        await persistResultsCache(nextCache, updatedTargets);
      } else if (data.result) {
        setRawTextResponse(data.result);
        setHasRun(true);
        await spendCredit(currentUser?.uid);

        const nextCache: ResultsCache = {
          ...resultsCache,
          [cacheKey(prog.id, selectedMode)]: {
            aiResult: null,
            rawTextResponse: data.result,
          },
        };
        setResultsCache(nextCache);
        await persistResultsCache(nextCache);
      } else {
        setRawTextResponse("Could not generate analysis at this time.");
        setHasRun(true);
      }
    } catch (err) {
      console.error(err);
      setRawTextResponse("Error connecting to admissions AI.");
      setHasRun(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      const isGuestUser =
        !user && localStorage.getItem("isGuestMode") === "true";
      setIsGuest(isGuestUser);
      const limit = isGuestUser ? 1 : 5;
      setMaxCredits(limit);
      const today = getTodayKey();
      if (isGuestUser) {
        const storedCredits = localStorage.getItem("guestCredits");
        const storedDate = localStorage.getItem("guestCreditsDate");
        if (storedDate === today && storedCredits !== null) {
          setUserCredits(parseInt(storedCredits, 10));
        } else {
          setUserCredits(limit);
          localStorage.setItem("guestCredits", limit.toString());
          localStorage.setItem("guestCreditsDate", today);
        }
        setCreditsLoaded(true);
        try {
          const storedResults = localStorage.getItem(GUEST_RESULTS_KEY);
          if (storedResults) {
            const parsed: ResultsCache = JSON.parse(storedResults);
            setResultsCache(parsed);
            applyCachedOrEmpty(activeProgramId, mode, parsed);
          }
        } catch (err) {
          console.error("Guest cache load error:", err);
        }
      } else if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfileData & {
              creditsRemaining?: number;
              creditsDate?: string;
              resultsCache?: ResultsCache;
              targetPrograms?: TargetProgramOption[];
              activeProgramId?: string;
              mode?: "advisor" | "roast";
            };
            setCurrentProfile(data);
            if (
              data.creditsDate === today &&
              typeof data.creditsRemaining === "number"
            ) {
              setUserCredits(data.creditsRemaining);
            } else {
              setUserCredits(limit);
              await setDoc(
                doc(db, "users", user.uid),
                { creditsRemaining: limit, creditsDate: today },
                { merge: true }
              );
            }
            const restoredTargets =
              data.targetPrograms && data.targetPrograms.length > 0
                ? data.targetPrograms
                : targetPrograms;
            if (data.targetPrograms && data.targetPrograms.length > 0) {
              setTargetPrograms(data.targetPrograms);
            }

            const restoredProgramId =
              data.activeProgramId &&
              restoredTargets.some((p) => p.id === data.activeProgramId)
                ? data.activeProgramId
                : restoredTargets[0]?.id ?? activeProgramId;
            const restoredMode = data.mode || mode;
            setActiveProgramId(restoredProgramId);
            setMode(restoredMode);

            if (data.resultsCache) {
              setResultsCache(data.resultsCache);
              applyCachedOrEmpty(
                restoredProgramId,
                restoredMode,
                data.resultsCache
              );
            }
          }
        } catch (err) {
          console.error("Dashboard fetch error:", err);
        } finally {
          setCreditsLoaded(true);
        }
      } else {
        setCreditsLoaded(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const spendCredit = async (uid?: string) => {
    setUserCredits((prev) => {
      const next = Math.max(0, prev - 1);
      if (isGuest) {
        localStorage.setItem("guestCredits", next.toString());
        localStorage.setItem("guestCreditsDate", getTodayKey());
      } else if (uid) {
        setDoc(
          doc(db, "users", uid),
          { creditsRemaining: next, creditsDate: getTodayKey() },
          { merge: true }
        ).catch((err) => console.error("Credit save error:", err));
      }
      return next;
    });
  };
  const handleProgramSwitch = (prog: TargetProgramOption) => {
    setActiveProgramId(prog.id);
    applyCachedOrEmpty(prog.id, mode);
    persistResultsCache(resultsCache).catch(() => {});
  };
  const handleModeChange = (newMode: "advisor" | "roast") => {
    setMode(newMode);
    applyCachedOrEmpty(activeProgramId, newMode);
    persistResultsCache(resultsCache).catch(() => {});
  };

  const router = useRouter();
  return (
    <div
      className="relative w-full min-h-screen text-slate-700 flex flex-col overflow-x-hidden selection:bg-emerald-500/30"
      style={{ fontFamily: googleSansFlex.style.fontFamily }}
    >
      <FloatingParticles />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6 flex-grow pb-16"
      >
        <LiquidBackground />
        <AnimatePresence>
          {isGuest && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500 text-white p-3 rounded-xl flex items-center justify-between shadow-lg shadow-emerald-500/20 mt-16"
            >
              <span className="text-sm font-medium flex items-center gap-2">
                <Sparkles size={16} />
                You are viewing this as a guest. Sign up to get 5 daily
                analyses!
              </span>
              <button
                onClick={() => router.push("/login?mode=signup")}
                className="px-4 py-1.5 bg-white text-emerald-600 font-bold rounded-lg text-xs hover:bg-emerald-50 transition cursor-pointer"
              >
                Create Account
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          variants={itemVariants}
          className={`flex flex-col sm:flex-row items-start sm:items-center bg-white/70 backdrop-blur-xl justify-between gap-4 p-5 rounded-2xl border border-slate-200/70 shadow-sm shadow-slate-200/50 ${
            !isGuest && "mt-20"
          }`}
        >
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1 block">
              Active Evaluation Target
            </span>
            <h1 className="text-xl font-semibold text-slate-900">
              {activeProgram.university}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Program: &nbsp;
              <span className="text-slate-700 font-medium">
                {activeProgram.program}
              </span>
              <span className="mx-1.5 text-slate-300">|</span> Pool:{" "}
              <span className="text-slate-700 font-medium">
                OUAC {profile.applicantType}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <CreditCounter remaining={userCredits} total={maxCredits} />

            <div className="w-full sm:w-auto flex flex-col items-center sm:items-start">
              <div className="relative flex bg-slate-100/70 p-1 rounded-xl border border-slate-200/70 w-full sm:w-auto shadow-inner">
                <motion.div
                  layoutId="modeIndicator"
                  className={`absolute top-1 bottom-1 rounded-lg ${
                    mode === "advisor"
                      ? "bg-emerald-500 shadow-md shadow-emerald-500/30"
                      : "bg-rose-500 shadow-md shadow-rose-500/30"
                  }`}
                  style={{
                    width: "calc(50% - 4px)",
                    left: mode === "advisor" ? "4px" : "calc(50% + 0px)",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
                <button
                  type="button"
                  onClick={() => handleModeChange("advisor")}
                  className={`relative z-10 flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                    mode === "advisor"
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Bot size={14} /> Advisor
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange("roast")}
                  className={`relative z-10 flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                    mode === "roast"
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Flame size={14} /> Roast
                </button>
              </div>
              <span className="text-[10px] font-semibold text-slate-600 mt-1.5 text-center sm:text-left">
                Toggle between Roast and Advisor mode
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => router.push("/onboarding")}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-white/70 rounded-xl transition-colors border border-transparent hover:border-slate-200 cursor-pointer text-xs font-medium"
              title="Reconfigure Profile"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Reconfigure</span>
            </motion.button>

            {creditsLoaded && userCredits > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleRunAnalysis(mode, activeProgram)}
                className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-white/70 rounded-xl transition-colors border border-transparent hover:border-slate-200 cursor-pointer text-xs font-medium"
                title="Re-analyze"
              >
                <RotateCcw size={16} />
                <span className="hidden sm:inline">Re-evaluate</span>
              </motion.button>
            )}
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              Application Targets Comparison
            </span>
            <span className="text-[11px] text-slate-400">
              Click a target to switch primary AI benchmark
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {targetPrograms.map((prog) => {
              const isSelected = prog.id === activeProgramId;
              const isEmpty = prog.university === "Untitled Choice";
              const badgeClass =
                TIER_BADGE_STYLES[prog.tier] ||
                "bg-slate-100 text-slate-700 border-slate-200";

              return (
                <motion.button
                  key={prog.id}
                  type="button"
                  onClick={() => !isEmpty && handleProgramSwitch(prog)}
                  disabled={isEmpty}
                  whileHover={!isEmpty ? { y: -3 } : undefined}
                  whileTap={!isEmpty ? { scale: 0.98 } : undefined}
                  transition={{ duration: 0.2 }}
                  className={`relative text-left p-4 rounded-xl border transition-all backdrop-blur-xl ${
                    isEmpty
                      ? "bg-slate-50/50 border-slate-200/60 opacity-50 cursor-not-allowed"
                      : isSelected
                      ? "bg-white/90 border-emerald-500/50 shadow-md ring-2 ring-emerald-500/20 cursor-pointer"
                      : "bg-white/50 border-slate-200/80 hover:bg-white/80 hover:border-slate-300 cursor-pointer"
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="activeTargetIndicator"
                      className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-xl"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-[11px] font-semibold text-slate-500 truncate">
                      {prog.university}
                    </p>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${badgeClass}`}
                    >
                      {prog.tier}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 truncate">
                    {prog.program}
                  </h3>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Est. Range</span>
                    <span className="font-bold text-slate-800">
                      {prog.minOdds === 0 && prog.maxOdds === 0
                        ? "Not yet evaluated"
                        : `${prog.minOdds}% – ${prog.maxOdds}%`}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className={`p-6 rounded-2xl border transition-colors duration-500 shadow-sm relative overflow-hidden backdrop-blur-xl ${
            mode === "advisor"
              ? "bg-gradient-to-b from-emerald-50/80 to-white/60 border-emerald-100"
              : "bg-gradient-to-b from-rose-50/80 to-white/60 border-rose-100"
          }`}
        >
          <div className="flex items-center justify-between gap-4 mb-6 z-10 relative">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                {mode === "advisor" ? (
                  <>
                    <Bot size={14} className="text-emerald-500" /> Primary AI
                    Acceptance Odds Range ({activeProgram.university})
                  </>
                ) : (
                  <>
                    <Flame size={14} className="text-rose-500" /> Admissions
                    Roast Probability ({activeProgram.university})
                  </>
                )}
              </span>
            </div>
            {hasRun && isGuest == false && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#10B981] hover:bg-[#14B8A6] text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 text-sm cursor-pointer"
                onClick={() => router.push("/details")}
              >
                <Sparkles size={16} /> Detailed Report
              </motion.button>
            )}
          </div>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-10 flex items-center justify-center gap-3 text-sm text-slate-500"
              >
                <Sparkles
                  size={16}
                  className="animate-pulse text-emerald-500"
                />
                Analyzing {activeProgram.university} historical markers...
              </motion.div>
            ) : hasRun ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start"
              >
                <div className="md:col-span-1 md:border-r border-slate-200 pb-4 md:pb-0 pr-0 md:pr-6">
                  {aiResult?.estimatedMin !== undefined ? (
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 inline-block mb-3">
                        {aiResult.tier || activeProgram.tier}
                      </span>
                      <div className="text-4xl font-light tracking-tight text-slate-900 mb-1">
                        {aiResult.estimatedMin}%{" "}
                        <span className="text-slate-400 font-serif">–</span>{" "}
                        {aiResult.estimatedMax}%
                      </div>
                      <span className="text-xs text-slate-500 font-medium block">
                        Estimated Probability Range
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 inline-block mb-3">
                        {activeProgram.tier}
                      </span>
                      <div className="text-4xl font-light tracking-tight text-slate-900 mb-1">
                        {activeProgram.minOdds}%{" "}
                        <span className="text-slate-400 font-serif">–</span>{" "}
                        {activeProgram.maxOdds}%
                      </div>
                      <span className="text-xs text-slate-500 font-medium block">
                        Estimated Probability Range
                      </span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 space-y-3">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-widest block">
                    {mode === "advisor"
                      ? "Strategic Breakdown"
                      : "Roast Summary"}
                  </span>
                  <p className="text-sm leading-relaxed text-slate-700 font-normal">
                    {aiResult?.reasoning || rawTextResponse}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-8 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="flex items-center gap-3 text-slate-600 text-sm max-w-md bg-white/70 p-4 rounded-xl border border-slate-200">
                  <TrendingUp
                    size={18}
                    className={
                      mode === "advisor" ? "text-emerald-500" : "text-rose-500"
                    }
                  />
                  <span className="text-left leading-relaxed">
                    Calculates an estimated acceptance range factoring in
                    Waterloo Euclid weighting, school flags, and top 6 averages
                    for &nbsp;
                    <strong>{activeProgram.university}</strong>.
                    <br />
                    <strong>Note:</strong> &nbsp; All calculations shown are
                    placeholders. Run the AI analysis to see the actual numbers.
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => handleRunAnalysis(mode, activeProgram)}
                  disabled={loading || userCredits <= 0 || !creditsLoaded}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                    userCredits <= 0
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : mode === "advisor"
                      ? "bg-emerald-500 hover:bg-emerald-400 text-white"
                      : "bg-rose-500 hover:bg-rose-400 text-white"
                  }`}
                >
                  <Sparkles size={16} />
                  {userCredits <= 0
                    ? isGuest
                      ? "Guest Limit Reached"
                      : "Daily Limit Reached"
                    : `Run ${
                        mode === "advisor" ? "Advisor" : "Roast"
                      } Evaluation`}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <motion.div
          variants={itemVariants}
          id="graph-container"
          className="space-y-6"
        >
          <DashboardCharts
            profile={{
              ...profile,
              university: activeProgram.university,
              program: activeProgram.program,
            }}
          />
          <CompetitivenessRadar
            metrics={aiResult?.radarMetrics}
            isLoading={loading}
          />
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/70 flex items-center justify-between shadow-sm shadow-slate-200/50 transition-shadow hover:shadow-md"
            >
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  Calculated OUAC Top 6
                </span>
                <div
                  className="text-3xl font-light text-black font-bold"
                  style={{ fontWeight: 600 }}
                >
                  {profile.top6Average > 0 ? `${profile.top6Average}%` : "N/A"}
                </div>
                <p className="text-xs text-slate-500">
                  Prerequisites locked + highest remaining grade electives.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                <GraduationCap size={28} strokeWidth={1.5} />
              </div>
            </motion.div>
            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/70 space-y-5 shadow-sm shadow-slate-200/50">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen size={14} className="text-slate-400" /> Course
                  Breakdown
                </h2>
                <span className="text-xs text-slate-500">
                  {profile.courses.length} entries
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.courses.map((course, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.01, y: -1 }}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between group hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-slate-800">
                          {course.code || "UNTITLED"}
                        </span>
                        {course.isRequired && (
                          <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium tracking-wide">
                            REQ
                          </span>
                        )}
                        {course.isSummerSchool && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-medium tracking-wide">
                            SUMMER
                          </span>
                        )}
                      </div>
                      {course.isRepeated && (
                        <span className="text-[10px] text-rose-500 mt-1 block">
                          Repeated Course
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-base text-slate-700">
                      {course.grade !== "" ? `${course.grade}%` : "—"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/70 space-y-6 shadow-sm shadow-slate-200/50">
              <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                Profile Context
              </h2>
              {profile.hasOvsOrNightSchool ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-sm text-amber-800">
                  <AlertTriangle
                    size={18}
                    className="text-amber-500 shrink-0 mt-0.5"
                  />
                  <div className="leading-relaxed">
                    <span className="font-medium text-amber-700 block mb-1">
                      Non-Day School Flag
                    </span>
                    Strict deductions typically apply for OVS/Night School
                    credits.
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2
                    size={18}
                    className="text-emerald-500 shrink-0"
                  />
                  <span className="font-medium">Standard Delivery</span>
                </div>
              )}
              <div className="pt-5 border-t border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mb-3">
                  STEM Contests
                </span>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <motion.div
                    whileHover={{ y: -1 }}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <div className="text-[10px] text-slate-500 mb-1">
                      EUCLID
                    </div>
                    <div className="font-medium text-slate-800">
                      {profile.contests.euclid !== ""
                        ? profile.contests.euclid
                        : "—"}
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -1 }}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <div className="text-[10px] text-slate-500 mb-1">CSMC</div>
                    <div className="font-medium text-slate-800">
                      {profile.contests.csmc !== ""
                        ? profile.contests.csmc
                        : "—"}
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -1 }}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <div className="text-[10px] text-slate-500 mb-1">CCC</div>
                    <div className="font-medium text-slate-800">
                      {profile.contests.ccc !== "" ? profile.contests.ccc : "—"}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
