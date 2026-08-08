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
  Sliders,
  UserCheck,
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

interface ScenarioState {
  simulatedAverage: number;
  simulatedEuclid: number;
  simulatedEC: number;
}

function ScenarioSliderPanel({
  scenario,
  defaults,
  onChange,
}: {
  scenario: ScenarioState;
  defaults: {
    originalAverage: number;
    originalEuclid?: number;
    originalEC?: number;
  };
  onChange: (updated: ScenarioState) => void;
}) {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm no-print space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sliders size={16} className="text-emerald-600" />
          Interactive "What-If" Scenario Engine
        </h4>
        <span className="text-[11px] font-semibold text-slate-400">
          Slide parameters to test impact
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sliders size={13} className="text-emerald-600" />
              Top 6 Avg
            </label>
            <span className="text-xs font-black font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              {scenario.simulatedAverage.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min="80"
            max="99"
            step="0.5"
            value={scenario.simulatedAverage}
            onChange={(e) =>
              onChange({
                ...scenario,
                simulatedAverage: parseFloat(e.target.value),
              })
            }
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-0.5">
            <span>80.0%</span>
            <span>Base: {defaults.originalAverage}%</span>
            <span>99.0%</span>
          </div>
        </div>
        <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Award size={13} className="text-emerald-600" />
              Euclid Score
            </label>
            <span className="text-xs font-black font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              {scenario.simulatedEuclid} / 100
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="100"
            step="1"
            value={scenario.simulatedEuclid}
            onChange={(e) =>
              onChange({
                ...scenario,
                simulatedEuclid: parseInt(e.target.value),
              })
            }
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-0.5">
            <span>30</span>
            <span>Base: {defaults.originalEuclid ?? "N/A"}</span>
            <span>100</span>
          </div>
        </div>
        <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <UserCheck size={13} className="text-emerald-600" />
              EC &amp; Supplemental
            </label>
            <span className="text-xs font-black font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              {scenario.simulatedEC} / 100
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="1"
            value={scenario.simulatedEC}
            onChange={(e) =>
              onChange({ ...scenario, simulatedEC: parseInt(e.target.value) })
            }
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-0.5">
            <span>50</span>
            <span>Base: {defaults.originalEC ?? 75}</span>
            <span>100</span>
          </div>
        </div>
      </div>
    </div>
  );
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
    top6Average: data?.top6Average ?? (data as any)?.top6Average ?? 92.5,
    confidenceMin: data?.confidenceMin ?? 75,
    confidenceMax: data?.confidenceMax ?? 85,
    hasNonDaySchool:
      data?.hasNonDaySchool ?? (data as any)?.hasOvsOrNightSchool ?? false,
    euclidScore: data?.euclidScore ?? 70,
  };

  const [scenario, setScenario] = useState<ScenarioState>({
    simulatedAverage: safeData.top6Average,
    simulatedEuclid: safeData.euclidScore ?? 70,
    simulatedEC: 75,
  });

  useEffect(() => {
    setScenario({
      simulatedAverage: safeData.top6Average,
      simulatedEuclid: safeData.euclidScore ?? 70,
      simulatedEC: evaluation?.ecLeadershipScore ?? 75,
    });
  }, [safeData.top6Average, safeData.euclidScore, evaluation]);

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
    const basePayload = profile || data || safeData;
    const payload = {
      ...basePayload,
      top6Average: scenario.simulatedAverage,
      euclidScore: scenario.simulatedEuclid,
      ecLeadershipScore: scenario.simulatedEC,
    };

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

  const avgDelta = (scenario.simulatedAverage - safeData.top6Average) * 2;
  const euclidDelta =
    (scenario.simulatedEuclid - (safeData.euclidScore ?? 70)) * 0.2;
  const ecDelta =
    (scenario.simulatedEC - (evaluation?.ecLeadershipScore ?? 75)) * 0.15;
  const totalOffset = avgDelta + euclidDelta + ecDelta;

  const liveConfidenceMin = Math.min(
    99,
    Math.max(1, Math.round(safeData.confidenceMin + totalOffset))
  );
  const liveConfidenceMax = Math.min(
    99,
    Math.max(1, Math.round(safeData.confidenceMax + totalOffset))
  );

  const vectors = [
    {
      label: "Top 6 Avg",
      user: Math.round(scenario.simulatedAverage),
      benchmark: 97,
      unit: "%",
    },
    {
      label: "Contest Rigor",
      user: scenario.simulatedEuclid,
      benchmark: 85,
      unit: "pts",
    },
    {
      label: "EC Leadership",
      user: scenario.simulatedEC,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
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
            color: #0f172a !important;
            background: #fff !important;
            padding: 20px;
            margin-top: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div
        id="printable-report"
        className="relative w-full max-w-4xl bg-slate-50 border border-slate-200 rounded-2xl shadow-xl text-slate-800 overflow-hidden my-8 max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white no-print">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Detailed Admissions Brief
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {safeData.targetUniversity} • {safeData.targetProgram}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRunEvaluation}
              disabled={isEvaluating}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs rounded-xl transition cursor-pointer shadow-sm"
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
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl transition cursor-pointer border border-slate-200 shadow-xs"
            >
              <Printer size={14} /> Print
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  Admissions Forecast
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {liveConfidenceMin}% – {liveConfidenceMax}% Acceptance
                Confidence Band
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Based on historical multi-year CUDO entering averages &amp;
                program-specific adjustment variables.
              </p>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6 w-full md:w-auto justify-between">
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Top 6 Avg
                </p>
                <p className="text-lg font-black text-slate-900">
                  {scenario.simulatedAverage.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Euclid Score
                </p>
                <p className="text-lg font-black text-emerald-600">
                  {scenario.simulatedEuclid}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Non-Day School
                </p>
                <p
                  className={`text-xs font-bold px-2 py-0.5 rounded-md mt-1 inline-block ${
                    safeData.hasNonDaySchool
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {safeData.hasNonDaySchool ? "Flagged (OVS)" : "None"}
                </p>
              </div>
            </div>
          </div>
          <ScenarioSliderPanel
            scenario={scenario}
            defaults={{
              originalAverage: safeData.top6Average,
              originalEuclid: safeData.euclidScore,
              originalEC: evaluation?.ecLeadershipScore ?? 75,
            }}
            onChange={(updated) => setScenario(updated)}
          />
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers size={16} className="text-emerald-600" /> 5-Axis
                Applicant Profile Comparison
              </h4>
              <span className="text-xs text-slate-400 font-medium">
                Vs. Historical Admitted Median
              </span>
            </div>

            <div className="space-y-3.5">
              {vectors.map((v, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-600">{v.label}</span>
                    <span className="text-slate-900 font-bold">
                      {v.user}
                      {v.unit}{" "}
                      <span className="text-slate-400 font-normal">
                        / Target: {v.benchmark}
                        {v.unit}
                      </span>
                    </span>
                  </div>
                  <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                      style={{ left: `${v.benchmark}%` }}
                      title={`Target Benchmark: ${v.benchmark}`}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        v.user >= v.benchmark
                          ? "bg-emerald-500"
                          : "bg-amber-500"
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
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
            <button
              onClick={() => setProofExpanded(!proofExpanded)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer no-print"
            >
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Transparent Calculation Proof
                </h4>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
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
              <div className="px-5 pb-5 pt-1 space-y-2 border-t border-slate-100 text-xs">
                {evaluation?.calculationProof ? (
                  evaluation.calculationProof.map((item, index) => (
                    <div
                      key={index}
                      className={`flex justify-between py-2 border-b border-slate-100 ${
                        item.type === "penalty"
                          ? "text-rose-600"
                          : item.type === "boost"
                          ? "text-emerald-600"
                          : "text-slate-600"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-medium">
                        {item.type === "penalty" && <AlertTriangle size={13} />}
                        {item.type === "boost" && <Award size={13} />}
                        {item.label}
                      </span>
                      <span className="font-mono font-bold">{item.impact}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-600">
                        Base Top 6 Academic Average:
                      </span>
                      <span className="font-mono text-slate-900 font-bold">
                        +{scenario.simulatedAverage.toFixed(1)}%
                      </span>
                    </div>
                    {safeData.hasNonDaySchool && (
                      <div className="flex justify-between py-2 border-b border-slate-100 text-rose-600">
                        <span className="flex items-center gap-1.5 font-medium">
                          <AlertTriangle size={13} /> Non-Day School / OVS
                          Course Adjustment:
                        </span>
                        <span className="font-mono font-bold">-3.5%</span>
                      </div>
                    )}
                    {scenario.simulatedEuclid > 0 && (
                      <div className="flex justify-between py-2 border-b border-slate-100 text-emerald-600">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Award size={13} /> Waterloo Euclid Contest
                          Performance Boost:
                        </span>
                        <span className="font-mono font-bold">+2.5%</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 font-bold text-sm text-emerald-700 pt-2">
                      <span>Net Adjusted Scoring Index:</span>
                      <span className="font-mono font-black">
                        {(
                          scenario.simulatedAverage -
                          (safeData.hasNonDaySchool ? 3.5 : 0) +
                          (scenario.simulatedEuclid > 70 ? 2.5 : 0)
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Target size={16} className="text-emerald-600" /> Opportunity
              Multiplier Checklist
            </h4>
            <p className="text-xs text-slate-500">
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
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                      isChecked
                        ? "bg-emerald-50/60 border-emerald-300 text-slate-900"
                        : "bg-slate-50/50 border-slate-200/80 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition ${
                          isChecked
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isChecked && (
                          <CheckCircle2 size={12} strokeWidth={3} />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-xs font-semibold ${
                            isChecked
                              ? "line-through text-slate-400"
                              : "text-slate-800"
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md shrink-0 ${
                        isChecked
                          ? "bg-emerald-600 text-white"
                          : "bg-emerald-100/80 text-emerald-800"
                      }`}
                    >
                      {item.impact}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar size={16} className="text-emerald-600" /> Path to
              Acceptance Timeline
            </h4>

            <div className="relative border-l-2 border-slate-200 ml-2 pl-4 space-y-4 pt-1">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <p className="text-xs font-bold text-slate-900">
                  November – OUAC Submission &amp; Profile Setup
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Ensure non-day school course codes are properly declared on
                  OUAC to prevent processing delays.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500" />
                <p className="text-xs font-bold text-slate-900">
                  February – Admissions Submission
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Highlight independent coding projects and leadership roles to
                  counteract top-tier applicant average cutoffs.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300" />
                <p className="text-xs font-bold text-slate-900">
                  April – Euclid Contest Date
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Target score of 75+ to place in the upper quartile of
                  applicant benchmarks.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between no-print text-xs text-slate-400 font-medium">
          <span>Generated by Probable.ai Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer shadow-xs"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
