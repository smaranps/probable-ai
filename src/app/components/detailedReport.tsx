"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Printer,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  BookOpen,
  Target,
  Calendar,
  Layers,
} from "lucide-react";

interface EvaluationResult {
  ecLeadershipScore: number;
  courseRigorScore: number;
  contestRigorScore: number;
  adjustmentFactorScore: number;
  calculationProof: Array<{
    label: string;
    impact: string;
    type: "base" | "penalty" | "boost" | "neutral";
  }>;
  opportunityItems: Array<{
    id: number;
    title: string;
    impact: string;
    desc: string;
  }>;
}

interface ProfileData {
  studentName?: string;
  targetProgram?: string;
  targetUniversity?: string;
  top6Average?: number;
  confidenceMin?: number;
  confidenceMax?: number;
  hasNonDaySchool?: boolean;
  euclidScore?: number;
  cccScore?: number;
}

interface DetailedReportProps {
  isOpen: boolean;
  onClose: () => void;
  data?: ProfileData | null;
}

export default function DetailedReportModal({
  isOpen,
  onClose,
  data,
}: DetailedReportProps) {
  const [proofExpanded, setProofExpanded] = useState(true);
  const [completedActions, setCompletedActions] = useState<number[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const safeData = {
    studentName: data?.studentName ?? "Applicant",
    targetProgram:
      data?.targetProgram ?? (data as any)?.program ?? "Target Program",
    targetUniversity:
      data?.targetUniversity ??
      (data as any)?.university ??
      "Target University",
    top6Average: data?.top6Average ?? (data as any)?.top6Average ?? 0,
    confidenceMin: data?.confidenceMin ?? 75,
    confidenceMax: data?.confidenceMax ?? 85,
    hasNonDaySchool:
      data?.hasNonDaySchool ?? (data as any)?.hasOvsOrNightSchool ?? false,
    euclidScore: data?.euclidScore ?? undefined,
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem("ouac_user_profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);

        const cachedEval = sessionStorage.getItem("gemini_profile_evaluation");
        if (cachedEval) {
          setEvaluation(JSON.parse(cachedEval));
        }
      } catch (err) {
        console.error("Failed to parse saved profile:", err);
      }
    }
  }, []);

  const handleRunEvaluation = async () => {
    const payload = profile || data || safeData;
    if (!payload || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType?.includes("application/json")) {
        const text = await res.text();
        console.error(`API Error (${res.status}):`, text.slice(0, 150));
        throw new Error(`API route returned status ${res.status}`);
      }

      const resData = await res.json();
      if (!resData.error) {
        setEvaluation(resData);
        sessionStorage.setItem(
          "gemini_profile_evaluation",
          JSON.stringify(resData)
        );
      }
    } catch (err) {
      console.error("Evaluation failed:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const toggleAction = (id: number) => {
    if (completedActions.includes(id)) {
      setCompletedActions(completedActions.filter((i) => i !== id));
    } else {
      setCompletedActions([...completedActions, id]);
    }
  };

  const vectors = [
    {
      label: "Top 6 Avg",
      user: Math.round(safeData.top6Average || 0),
      benchmark: 97,
      unit: "%",
    },
    {
      label: "Contest Rigor",
      user: evaluation?.contestRigorScore ?? (safeData.euclidScore ? 78 : 50),
      benchmark: 85,
      unit: "pct",
    },
    {
      label: "EC Leadership",
      user: evaluation?.ecLeadershipScore ?? 75,
      benchmark: 80,
      unit: "pts",
    },
    {
      label: "Course Rigor",
      user: evaluation?.courseRigorScore ?? 80,
      benchmark: 90,
      unit: "pts",
    },
    {
      label: "Adj. Factor",
      user:
        evaluation?.adjustmentFactorScore ??
        (safeData.hasNonDaySchool ? 70 : 88),
      benchmark: 88,
      unit: "pts",
    },
  ];

  const opportunityItems = evaluation?.opportunityItems || [
    {
      id: 1,
      title: "Raise Advanced Functions to 96%+",
      impact: "+4% Odds",
      desc: "Increasing core math average neutralizes the non-day school penalty margin.",
    },
    {
      id: 2,
      title: "Score 75+ on Euclid Contest",
      impact: "+7% Odds",
      desc: "Waterloo heavily factors Euclid scores >75 to offset competitive cutoff thresholds.",
    },
    {
      id: 3,
      title: "Highlight Quant Leadership in Supplemental Application",
      impact: "+3% Odds",
      desc: "Frame your coding project leadership with quantifiable metrics (e.g., 500+ active users).",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#090D16]/80 backdrop-blur-md">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report,
          #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            color: #000 !important;
            background: #fff !important;
            padding: 20px;
            margin-top: 50px;
          }
          .no-print {
            display: none !important;
          }
          .print-light-bg {
            background: #f8fafc !important;
            border-color: #e2e8f0 !important;
            color: #0f172a !important;
          }
          .print-text-dark {
            color: #0f172a !important;
          }
        }
      `}</style>
      <div
        id="printable-report"
        className="relative w-full max-w-4xl bg-[#111827] border border-[#1E293B] rounded-2xl shadow-2xl text-white overflow-hidden my-8 max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#090D16]/50 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                Detailed Admissions Brief
              </h2>
              <p className="text-xs text-[#94A3B8]">
                {safeData.targetUniversity} • {safeData.targetProgram}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRunEvaluation}
              disabled={isEvaluating}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#10B981] hover:bg-[#059669] disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-semibold text-xs rounded-xl transition cursor-pointer shadow-lg"
            >
              {isEvaluating ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  {evaluation ? "Re-analyze" : "Analyze with AI"}
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E293B] hover:bg-slate-700 text-[#94A3B8] hover:text-white text-xs font-semibold rounded-lg transition cursor-pointer border border-slate-700"
            >
              <Printer size={14} /> Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1E293B] transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="p-5 rounded-xl bg-[#090D16] border border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-4 print-light-bg">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#10B981]">
                  Admissions Forecast
                </span>
              </div>
              <h3 className="text-xl font-bold text-white print-text-dark">
                {safeData.confidenceMin}% – {safeData.confidenceMax}% Acceptance
                Confidence Band
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1 print-text-dark">
                Based on historical multi-year CUDO entering averages &amp;
                program-specific adjustment variables.
              </p>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-[#1E293B] pt-3 md:pt-0 md:pl-6 w-full md:w-auto justify-between">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#64748B]">
                  Top 6 Avg
                </p>
                <p className="text-lg font-extrabold text-white print-text-dark">
                  {safeData.top6Average ? `${safeData.top6Average}%` : "N/A"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#64748B]">
                  Euclid Score
                </p>
                <p className="text-lg font-extrabold text-[#34D399]">
                  {safeData.euclidScore ?? "N/A"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-[#64748B]">
                  Non-Day School
                </p>
                <p
                  className={`text-xs font-bold px-2 py-1 rounded mt-1 inline-block ${
                    safeData.hasNonDaySchool
                      ? "bg-rose-950/50 text-rose-400 border border-rose-800/40"
                      : "bg-emerald-950/50 text-emerald-400 border border-emerald-800/40"
                  }`}
                >
                  {safeData.hasNonDaySchool ? "Flagged (OVS)" : "None"}
                </p>
              </div>
            </div>
          </div>
          <div className="p-5 rounded-xl bg-[#090D16] border border-[#1E293B] print-light-bg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 print-text-dark">
                <Layers size={16} className="text-[#10B981]" /> 5-Axis Applicant
                Profile Comparison
              </h4>
              <span className="text-xs text-[#94A3B8]">
                Vs. Historical Admitted Median
              </span>
            </div>

            <div className="space-y-3.5">
              {vectors.map((v, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#94A3B8] print-text-dark">
                      {v.label}
                    </span>
                    <span className="text-white print-text-dark font-semibold">
                      {v.user}
                      {v.unit}{" "}
                      <span className="text-[#64748B]">
                        / Target: {v.benchmark}
                        {v.unit}
                      </span>
                    </span>
                  </div>
                  <div className="relative w-full h-2.5 bg-[#1E293B] rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                      style={{ left: `${v.benchmark}%` }}
                      title={`Target Benchmark: ${v.benchmark}`}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        v.user >= v.benchmark ? "bg-[#10B981]" : "bg-amber-500"
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(0, v.user))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-[#090D16] border border-[#1E293B] overflow-hidden print-light-bg">
            <button
              onClick={() => setProofExpanded(!proofExpanded)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition cursor-pointer no-print"
            >
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-[#10B981]" />
                <h4 className="text-sm font-bold text-white">
                  Transparent Calculation Proof
                </h4>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <span>
                  {proofExpanded
                    ? "Hide Breakdown"
                    : "View Deductions & Boosts"}
                </span>
                {proofExpanded ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
            </button>

            {proofExpanded && (
              <div className="px-5 pb-5 pt-1 space-y-2 border-t border-[#1E293B]/60 text-xs">
                {evaluation?.calculationProof ? (
                  evaluation.calculationProof.map((item, index) => (
                    <div
                      key={index}
                      className={`flex justify-between py-1.5 border-b border-[#1E293B]/40 ${
                        item.type === "penalty"
                          ? "text-rose-400"
                          : item.type === "boost"
                          ? "text-[#34D399]"
                          : "text-[#94A3B8]"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {item.type === "penalty" && <AlertTriangle size={13} />}
                        {item.type === "boost" && <Award size={13} />}
                        {item.label}
                      </span>
                      <span className="font-mono font-semibold">
                        {item.impact}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between py-1.5 border-b border-[#1E293B]/40">
                      <span className="text-[#94A3B8]">
                        Base Top 6 Academic Average:
                      </span>
                      <span className="font-mono text-white font-semibold">
                        +{safeData.top6Average}%
                      </span>
                    </div>
                    {safeData.hasNonDaySchool && (
                      <div className="flex justify-between py-1.5 border-b border-[#1E293B]/40 text-rose-400">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle size={13} /> Non-Day School / OVS
                          Course Adjustment:
                        </span>
                        <span className="font-mono font-semibold">-3.5%</span>
                      </div>
                    )}
                    {safeData.euclidScore && (
                      <div className="flex justify-between py-1.5 border-b border-[#1E293B]/40 text-[#34D399]">
                        <span className="flex items-center gap-1.5">
                          <Award size={13} /> Waterloo Euclid Contest
                          Performance Boost:
                        </span>
                        <span className="font-mono font-semibold">+2.5%</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 font-bold text-sm text-[#10B981] pt-2">
                      <span>Net Adjusted Scoring Index:</span>
                      <span className="font-mono">
                        {(
                          safeData.top6Average -
                          (safeData.hasNonDaySchool ? 3.5 : 0) +
                          (safeData.euclidScore ? 2.5 : 0)
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="p-5 rounded-xl bg-[#090D16] border border-[#1E293B] space-y-3 print-light-bg">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 print-text-dark">
              <Target size={16} className="text-[#10B981]" /> Opportunity
              Multiplier Checklist
            </h4>
            <p className="text-xs text-[#94A3B8] print-text-dark">
              Check actions to model potential probability gains before
              applications close:
            </p>

            <div className="space-y-2.5 pt-1">
              {opportunityItems.map((item) => {
                const isChecked = completedActions.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleAction(item.id)}
                    className={`p-3.5 rounded-lg border transition cursor-pointer flex items-start justify-between gap-3 ${
                      isChecked
                        ? "bg-[#10B981]/10 border-[#10B981]/50 text-white"
                        : "bg-[#111827] border-[#1E293B] hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition ${
                          isChecked
                            ? "bg-[#10B981] border-[#10B981] text-slate-950"
                            : "border-slate-600"
                        }`}
                      >
                        {isChecked && (
                          <CheckCircle2 size={12} strokeWidth={3} />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-xs font-semibold ${
                            isChecked ? "line-through text-slate-400" : ""
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${
                        isChecked
                          ? "bg-[#10B981] text-slate-950"
                          : "bg-[#064E3B]/60 text-[#34D399]"
                      }`}
                    >
                      {item.impact}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-5 rounded-xl bg-[#090D16] border border-[#1E293B] space-y-3 print-light-bg">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 print-text-dark">
              <Calendar size={16} className="text-[#10B981]" /> Path to
              Acceptance Timeline
            </h4>

            <div className="relative border-l-2 border-[#1E293B] ml-2 pl-4 space-y-4 pt-1">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <p className="text-xs font-bold text-white print-text-dark">
                  November – OUAC Submission &amp; Profile Setup
                </p>
                <p className="text-[11px] text-[#94A3B8]">
                  Ensure non-day school course codes are properly declared on
                  OUAC to prevent processing delays.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-400" />
                <p className="text-xs font-bold text-white print-text-dark">
                  February – Admissions Submission
                </p>
                <p className="text-[11px] text-[#94A3B8]">
                  Highlight independent coding projects and leadership roles to
                  counteract top-tier applicant average cutoffs.
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-600" />
                <p className="text-xs font-bold text-white print-text-dark">
                  April – Euclid Contest Date
                </p>
                <p className="text-[11px] text-[#94A3B8]">
                  Target score of 75+ to place in the upper quartile of
                  applicant benchmarks.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#1E293B] bg-[#090D16]/80 flex items-center justify-between no-print text-xs text-[#64748B]">
          <span>Generated by Probable.ai Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#10B981] hover:bg-[#14B8A6] text-slate-950 font-bold rounded-lg transition cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
