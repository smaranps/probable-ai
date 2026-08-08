// Styling with the colors, and icons were done by Google Gemini.

"use client";
import { LiquidBackground } from "@/app/components/dashboardBackground";
import React, { useState } from "react";
import { UserProfileData } from "@/app/components/onboarding";
import { FloatingParticles } from "@/app/components/dashboardParticles";
import { Google_Sans_Flex } from "next/font/google";
import { useRouter } from "next/navigation";
import DetailedReportModal from "./detailedReport";
import Navbar from "./navbar";
import Link from "next/link";
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

export default function OverviewDashboard({
  profile,
  onResetModal,
}: OverviewDashboardProps) {
  const [mode, setMode] = useState<"advisor" | "roast">("advisor");
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [rawTextResponse, setRawTextResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(false);

  const handleRunAnalysis = async (selectedMode = mode) => {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, mode: selectedMode }),
      });
      const data = await res.json();

      if (data.estimatedMin !== undefined) {
        setAiResult(data);
        setHasRun(true);
      } else if (data.result) {
        setRawTextResponse(data.result);
        setHasRun(true);
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

  const handleModeChange = (newMode: "advisor" | "roast") => {
    setMode(newMode);
    if (hasRun) {
      handleRunAnalysis(newMode);
    }
  };
  const router = useRouter();

  return (
    <div
      className="relative w-full min-h-screen text-slate-700 flex flex-col overflow-x-hidden selection:bg-emerald-500/30"
      style={{ fontFamily: googleSansFlex.style.fontFamily }}
    >
      <FloatingParticles />
      <div className="relative z-10 w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6 flex-grow pb-16">
        <LiquidBackground />
        <div className="flex flex-col sm:flex-row items-start sm:items-center bg-white/70 backdrop-blur-xl justify-between gap-4 p-5 rounded-2xl border border-slate-200/70 shadow-sm shadow-slate-200/50 mt-20">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1 block">
              Target Program Evaluation
            </span>
            <h1 className="text-xl font-semibold text-slate-900">
              {profile.university}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Program:
              <span className="text-slate-700 font-medium">
                {profile.program}
              </span>
              <span className="mx-1.5 text-slate-300">|</span> Pool:
              <span className="text-slate-700 font-medium">
                OUAC {profile.applicantType}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex bg-slate-100/70 p-1 rounded-xl border border-slate-200/70 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleModeChange("advisor")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-medium px-4 py-1.5 rounded-lg transition-all duration-200 ${
                  mode === "advisor"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/70"
                }`}
              >
                <Bot size={14} /> Advisor
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("roast")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-medium px-4 py-1.5 rounded-lg transition-all duration-200 ${
                  mode === "roast"
                    ? "bg-rose-50 text-rose-600 border border-rose-200"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/70"
                }`}
              >
                <Flame size={14} /> Roast
              </button>
            </div>
            <button
              type="button"
              onClick={() => router.push("/onboarding")}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white/70 rounded-xl transition-colors border border-transparent hover:border-slate-200"
              title="Edit Profile Data"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
        <div
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
                    Acceptance Odds Range
                  </>
                ) : (
                  <>
                    <Flame size={14} className="text-rose-500" /> Admissions
                    Roast Probability
                  </>
                )}
              </span>
            </div>
            {hasRun && (
              <div>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  disabled={loading}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 bg-white/70 hover:bg-white text-slate-600 transition-colors cursor-pointer border border-slate-200"
                >
                  <RefreshCw
                    size={12}
                    className={loading ? "animate-spin" : ""}
                  />
                  Re-evaluate
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-10 flex items-center justify-center gap-3 text-sm text-slate-500">
              <Sparkles size={16} className="animate-pulse text-emerald-500" />
              Analyzing {profile.university} historical markers...
            </div>
          ) : hasRun ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-1 md:border-r border-slate-200 pb-4 md:pb-0 pr-0 md:pr-6">
                {aiResult?.estimatedMin !== undefined ? (
                  <div>
                    <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 inline-block mb-3">
                      {aiResult.tier || "Evaluated"}
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
                  <div className="text-lg text-slate-700 font-medium">
                    Analysis Complete
                  </div>
                )}
              </div>

              <div className="md:col-span-2 space-y-3">
                <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-widest block">
                  {mode === "advisor" ? "Strategic Breakdown" : "Roast Summary"}
                </span>
                <p className="text-sm leading-relaxed text-slate-700 font-normal">
                  {aiResult?.reasoning || rawTextResponse}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
              <div className="flex items-center gap-3 text-slate-600 text-sm max-w-md bg-white/70 p-4 rounded-xl border border-slate-200">
                <TrendingUp
                  size={18}
                  className={
                    mode === "advisor" ? "text-emerald-500" : "text-rose-500"
                  }
                />
                <span className="text-left leading-relaxed">
                  Calculates an estimated acceptance range factoring in Waterloo
                  Euclid weighting, school flags, and top 6 averages.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRunAnalysis()}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                  mode === "advisor"
                    ? "bg-emerald-500 hover:bg-emerald-400 text-white"
                    : "bg-rose-500 hover:bg-rose-400 text-white"
                }`}
              >
                <Sparkles size={16} /> Run
                {mode === "advisor" ? "Advisor" : "Roast"} Evaluation
              </button>

              <button
                className="flex items-center gap-2 px-5 py-2.5 bg-[#10B981] hover:bg-[#14B8A6] text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 text-sm"
                onClick={() => router.push("/details")}
              >
                <Sparkles size={16} /> Detailed Report
              </button>
            </div>
          )}
        </div>
        <div id="graph-container" className="space-y-6">
          <DashboardCharts profile={profile} />
          <CompetitivenessRadar
            metrics={aiResult?.radarMetrics}
            isLoading={loading}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/70 flex items-center justify-between shadow-sm shadow-slate-200/50">
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
            </div>
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
                  <div
                    key={idx}
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
                  </div>
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
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 mb-1">
                      EUCLID
                    </div>
                    <div className="font-medium text-slate-800">
                      {profile.contests.euclid !== ""
                        ? profile.contests.euclid
                        : "—"}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 mb-1">CSMC</div>
                    <div className="font-medium text-slate-800">
                      {profile.contests.csmc !== ""
                        ? profile.contests.csmc
                        : "—"}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 mb-1">CCC</div>
                    <div className="font-medium text-slate-800">
                      {profile.contests.ccc !== "" ? profile.contests.ccc : "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
