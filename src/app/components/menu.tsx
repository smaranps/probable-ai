"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Printer,
  Loader2,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ScrollText,
  Compass,
  CalendarClock,
} from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";

/**
 * Google Sans Flex is a Google-internal typeface and isn't distributed via
 * Google Fonts, so it can't be pulled into the project. Plus Jakarta Sans is
 * used instead — a variable-weight geometric sans with enough warmth to
 * carry both the display heading and the small data labels in this report.
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

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

/* ---------------------------------------------------------------------- */
/* Design tokens (see inline notes) — ink/paper dossier palette, single    */
/* brass accent, serif display type for the "admissions brief" register.  */
/* ---------------------------------------------------------------------- */
const INK = "#181611";
const PAPER = "#FBF9F4";
const RULE = "#E4DFD3";
const MUTED = "#7A7566";
const BRASS = "#10B981";
const BRASS_SOFT = "#E4F6EE";
const GOOD = "#10B981";
const GOOD_SOFT = "#E4F6EE";
const WARN = "#A44A26";
const WARN_SOFT = "#F7EAE2";

/**
 * Confidence math is intentionally damped and clamped. Nobody can predict
 * an admissions outcome to the percentage point, so the model:
 *   1. gives every input diminishing returns above the applicant's own baseline
 *   2. caps the total swing a "what-if" scenario can produce
 *   3. never reports a band outside a plausible 4%–92% range
 */
function computeOffset(scenario: ScenarioState, base: {
  average: number;
  euclid: number;
  ec: number;
}) {
  const damp = (delta: number, weight: number) =>
    Math.sign(delta) * Math.min(Math.abs(delta) * weight, weight * 6);

  const avgDelta = damp(scenario.simulatedAverage - base.average, 0.9);
  const euclidDelta = damp(scenario.simulatedEuclid - base.euclid, 0.09);
  const ecDelta = damp(scenario.simulatedEC - base.ec, 0.07);

  const raw = avgDelta + euclidDelta + ecDelta;
  return Math.max(-18, Math.min(15, raw));
}

function clampBand(min: number, max: number) {
  const lo = Math.min(92, Math.max(4, Math.round(min)));
  const hi = Math.min(92, Math.max(lo + 3, Math.round(max)));
  return [lo, hi] as const;
}

/* ---------------------------------------------------------------------- */

function ScenarioEngine({
  scenario,
  defaults,
  onChange,
}: {
  scenario: ScenarioState;
  defaults: { average: number; euclid?: number; ec?: number };
  onChange: (updated: ScenarioState) => void;
}) {
  const sliders: Array<{
    key: keyof ScenarioState;
    label: string;
    min: number;
    max: number;
    step: number;
    base?: number;
    display: (v: number) => string;
  }> = [
    {
      key: "simulatedAverage",
      label: "Top 6 average",
      min: 80,
      max: 99,
      step: 0.5,
      base: defaults.average,
      display: (v) => `${v.toFixed(1)}%`,
    },
    {
      key: "simulatedEuclid",
      label: "Euclid contest score",
      min: 30,
      max: 100,
      step: 1,
      base: defaults.euclid,
      display: (v) => `${v} / 100`,
    },
    {
      key: "simulatedEC",
      label: "EC & supplemental strength",
      min: 50,
      max: 100,
      step: 1,
      base: defaults.ec,
      display: (v) => `${v} / 100`,
    },
  ];

  return (
    <section
      className="no-print"
      style={{ border: `1px solid ${RULE}`, borderRadius: 4, background: "#fff" }}
    >
      <div
        className="flex items-baseline justify-between px-5 py-3.5"
        style={{ borderBottom: `1px solid ${RULE}` }}
      >
        <h3
          className="font-semibold tracking-tight text-[15px]"
          style={{ color: INK }}
        >
          Scenario planner
        </h3>
        <span className="text-[11px]" style={{ color: MUTED }}>
          Move a slider to see the directional effect
        </span>
      </div>

      <div className="px-5 py-4 space-y-5">
        {sliders.map((s) => {
          const value = scenario[s.key];
          return (
            <div key={s.key}>
              <div className="flex items-baseline justify-between mb-1.5">
                <label className="text-[13px] font-medium" style={{ color: INK }}>
                  {s.label}
                </label>
                <span
                  className="text-[13px] font-mono tabular-nums"
                  style={{ color: BRASS }}
                >
                  {s.display(value)}
                </span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={value}
                onChange={(e) =>
                  onChange({ ...scenario, [s.key]: parseFloat(e.target.value) })
                }
                className="w-full accent-current"
                style={{ accentColor: BRASS, height: 4 }}
              />
              <div
                className="flex justify-between text-[10.5px] mt-1"
                style={{ color: MUTED }}
              >
                <span>{s.min}</span>
                <span>Your baseline: {s.base ?? "—"}</span>
                <span>{s.max}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
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
    confidenceMin: data?.confidenceMin ?? 40,
    confidenceMax: data?.confidenceMax ?? 60,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeData.top6Average, safeData.euclidScore, evaluation]);

  useEffect(() => {
    const savedProfile = localStorage.getItem("ouac_user_profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
        const cachedEval = sessionStorage.getItem("gemini_profile_evaluation");
        if (cachedEval) setEvaluation(JSON.parse(cachedEval));
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
        sessionStorage.setItem("gemini_profile_evaluation", JSON.stringify(resData));
      }
    } catch (err) {
      console.error("Evaluation failed:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!isOpen) return null;

  const toggleAction = (id: number) => {
    setCompletedActions((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const offset = computeOffset(scenario, {
    average: safeData.top6Average,
    euclid: safeData.euclidScore ?? 70,
    ec: evaluation?.ecLeadershipScore ?? 75,
  });

  const [liveMin, liveMax] = clampBand(
    safeData.confidenceMin + offset,
    safeData.confidenceMax + offset
  );

  const vectors = [
    { label: "Top 6 average", user: Math.round(scenario.simulatedAverage), benchmark: 97, unit: "%" },
    { label: "Contest rigor", user: scenario.simulatedEuclid, benchmark: 85, unit: "pts" },
    { label: "EC & leadership", user: scenario.simulatedEC, benchmark: 80, unit: "pts" },
    { label: "Course rigor", user: evaluation?.courseRigorScore ?? 80, benchmark: 90, unit: "pts" },
    {
      label: "Adjustment factor",
      user: evaluation?.adjustmentFactorScore ?? (safeData.hasNonDaySchool ? 70 : 88),
      benchmark: 88,
      unit: "pts",
    },
  ];

  const opportunityItems = evaluation?.opportunityItems || [
    {
      id: 1,
      title: "Raise Advanced Functions to 96%+",
      impact: "Meaningful lift",
      desc: "Increasing your core math average narrows the gap left by the non-day-school adjustment.",
    },
    {
      id: 2,
      title: "Score 75+ on the Euclid contest",
      impact: "Meaningful lift",
      desc: "Waterloo weighs Euclid scores above 75 to offset competitive program cutoffs.",
    },
    {
      id: 3,
      title: "Quantify leadership in your supplemental",
      impact: "Modest lift",
      desc: "Frame your coding project leadership with real numbers — e.g. 500+ active users.",
    },
  ];

  return (
    <div
      className={`${jakarta.className} fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/50 backdrop-blur-[2px]`}
    >
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report {
            position: absolute; left: 0; top: 0; width: 100%;
            color: #181611 !important; background: #fff !important;
            padding: 20px; margin-top: 0;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div
        id="printable-report"
        className="relative w-full max-w-5xl my-8 max-h-[90vh] flex flex-col overflow-hidden"
        style={{ background: PAPER, border: `1px solid ${RULE}`, borderRadius: 6 }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-4 no-print"
          style={{ borderBottom: `1px solid ${RULE}`, background: "#fff" }}
        >
          <div>
            <p className="text-[11px] tracking-normal" style={{ color: MUTED }}>
              {safeData.targetUniversity} · {safeData.targetProgram}
            </p>
            <h2 className="font-semibold tracking-tight text-[19px] mt-0.5" style={{ color: INK }}>
              Admissions brief for {safeData.studentName}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunEvaluation}
              disabled={isEvaluating}
              className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-medium transition cursor-pointer disabled:opacity-50"
              style={{ background: INK, color: PAPER, borderRadius: 4 }}
            >
              {isEvaluating ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Evaluating
                </>
              ) : (
                <>
                  <Sparkles size={14} /> {evaluation ? "Re-run analysis" : "Run analysis"}
                </>
              )}
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium transition cursor-pointer"
              style={{ border: `1px solid ${RULE}`, color: INK, borderRadius: 4 }}
            >
              <Printer size={14} /> Print
            </button>
            <button
              onClick={onClose}
              className="p-2 cursor-pointer transition"
              style={{ color: MUTED, borderRadius: 4 }}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
            {/* Left rail */}
            <div
              className="px-6 py-6 space-y-6 md:sticky md:top-0"
              style={{ borderRight: `1px solid ${RULE}` }}
            >
              <div>
                <p className="text-[11px]" style={{ color: MUTED }}>
                  Estimated acceptance range
                </p>
                <p className="font-bold tracking-tight text-[34px] leading-none mt-1" style={{ color: INK }}>
                  {liveMin}–{liveMax}%
                </p>
                <p className="text-[11px] mt-2 leading-relaxed" style={{ color: MUTED }}>
                  A directional estimate from historical entering averages —
                  not a guarantee. No model can predict an individual decision.
                </p>
              </div>

              <div className="flex gap-2">
                <div
                  className="flex-1 px-2.5 py-2"
                  style={{ background: "#fff", border: `1px solid ${RULE}`, borderRadius: 4 }}
                >
                  <p className="text-[10px]" style={{ color: MUTED }}>Top 6 avg</p>
                  <p className="text-[15px] font-medium" style={{ color: INK }}>
                    {scenario.simulatedAverage.toFixed(1)}%
                  </p>
                </div>
                <div
                  className="flex-1 px-2.5 py-2"
                  style={{ background: "#fff", border: `1px solid ${RULE}`, borderRadius: 4 }}
                >
                  <p className="text-[10px]" style={{ color: MUTED }}>Euclid</p>
                  <p className="text-[15px] font-medium" style={{ color: INK }}>
                    {scenario.simulatedEuclid}
                  </p>
                </div>
              </div>

              <div
                className="px-2.5 py-2 flex items-center justify-between"
                style={{
                  background: safeData.hasNonDaySchool ? WARN_SOFT : GOOD_SOFT,
                  borderRadius: 4,
                }}
              >
                <span className="text-[11.5px]" style={{ color: INK }}>
                  Non-day-school course flag
                </span>
                <span
                  className="text-[11px] font-medium"
                  style={{ color: safeData.hasNonDaySchool ? WARN : GOOD }}
                >
                  {safeData.hasNonDaySchool ? "Flagged" : "None"}
                </span>
              </div>

              <div>
                <p className="text-[11px] font-medium mb-2.5" style={{ color: MUTED }}>
                  Profile vs. admitted median
                </p>
                <div className="space-y-3">
                  {vectors.map((v, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span style={{ color: INK }}>{v.label}</span>
                        <span style={{ color: MUTED }}>
                          {v.user}{v.unit} / {v.benchmark}{v.unit}
                        </span>
                      </div>
                      <div
                        className="relative h-[3px] w-full"
                        style={{ background: RULE }}
                      >
                        <div
                          className="absolute top-0 bottom-0"
                          style={{
                            width: `${Math.min(100, Math.max(0, v.user))}%`,
                            background: v.user >= v.benchmark ? GOOD : BRASS,
                          }}
                        />
                        <div
                          className="absolute top-[-2px] bottom-[-2px] w-px"
                          style={{ left: `${v.benchmark}%`, background: INK }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main column */}
            <div className="px-6 py-6 space-y-5">
              <ScenarioEngine
                scenario={scenario}
                defaults={{
                  average: safeData.top6Average,
                  euclid: safeData.euclidScore,
                  ec: evaluation?.ecLeadershipScore ?? 75,
                }}
                onChange={setScenario}
              />

              {/* Calculation proof */}
              <section style={{ border: `1px solid ${RULE}`, borderRadius: 4, background: "#fff" }}>
                <button
                  onClick={() => setProofExpanded(!proofExpanded)}
                  className="w-full px-5 py-3.5 flex items-center justify-between text-left cursor-pointer no-print"
                >
                  <span className="flex items-center gap-2 font-semibold tracking-tight text-[15px]" style={{ color: INK }}>
                    <ScrollText size={15} style={{ color: BRASS }} />
                    Calculation detail
                  </span>
                  {proofExpanded ? <ChevronUp size={16} color={MUTED} /> : <ChevronDown size={16} color={MUTED} />}
                </button>

                {proofExpanded && (
                  <div className="px-5 pb-4" style={{ borderTop: `1px solid ${RULE}` }}>
                    {evaluation?.calculationProof ? (
                      evaluation.calculationProof.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between py-2.5 text-[12.5px]"
                          style={{
                            borderBottom: `1px solid ${RULE}`,
                            color: item.type === "penalty" ? WARN : item.type === "boost" ? GOOD : INK,
                          }}
                        >
                          <span className="flex items-center gap-1.5">
                            {item.type === "penalty" && <AlertTriangle size={12} />}
                            {item.label}
                          </span>
                          <span className="font-mono">{item.impact}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex justify-between py-2.5 text-[12.5px]" style={{ borderBottom: `1px solid ${RULE}`, color: INK }}>
                          <span>Base top 6 academic average</span>
                          <span className="font-mono">+{scenario.simulatedAverage.toFixed(1)}%</span>
                        </div>
                        {safeData.hasNonDaySchool && (
                          <div className="flex justify-between py-2.5 text-[12.5px]" style={{ borderBottom: `1px solid ${RULE}`, color: WARN }}>
                            <span className="flex items-center gap-1.5">
                              <AlertTriangle size={12} /> Non-day-school / OVS adjustment
                            </span>
                            <span className="font-mono">−3.5%</span>
                          </div>
                        )}
                        {scenario.simulatedEuclid > 70 && (
                          <div className="flex justify-between py-2.5 text-[12.5px]" style={{ color: GOOD }}>
                            <span>Euclid contest performance</span>
                            <span className="font-mono">+2.5%</span>
                          </div>
                        )}
                      </>
                    )}
                    <p className="text-[10.5px] pt-2" style={{ color: MUTED }}>
                      These figures illustrate the direction and rough weight of each
                      factor — treat them as relative, not literal, percentages.
                    </p>
                  </div>
                )}
              </section>

              {/* Opportunity checklist */}
              <section style={{ border: `1px solid ${RULE}`, borderRadius: 4, background: "#fff" }}>
                <div className="px-5 py-3.5" style={{ borderBottom: `1px solid ${RULE}` }}>
                  <h3 className="flex items-center gap-2 font-semibold tracking-tight text-[15px]" style={{ color: INK }}>
                    <Compass size={15} style={{ color: BRASS }} />
                    Where to focus next
                  </h3>
                </div>
                <div className="px-5 py-4 space-y-2">
                  {opportunityItems.map((item) => {
                    const done = completedActions.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleAction(item.id)}
                        className="flex items-start gap-3 py-2.5 cursor-pointer"
                        style={{ borderBottom: `1px solid ${RULE}` }}
                      >
                        {done ? (
                          <CheckCircle2 size={16} style={{ color: GOOD, marginTop: 1 }} />
                        ) : (
                          <Circle size={16} style={{ color: RULE, marginTop: 1 }} />
                        )}
                        <div className="flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p
                              className="text-[13px] font-medium"
                              style={{ color: done ? MUTED : INK, textDecoration: done ? "line-through" : "none" }}
                            >
                              {item.title}
                            </p>
                            <span className="text-[10.5px] shrink-0" style={{ color: BRASS }}>
                              {item.impact}
                            </span>
                          </div>
                          <p className="text-[11.5px] mt-0.5" style={{ color: MUTED }}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Timeline */}
              <section style={{ border: `1px solid ${RULE}`, borderRadius: 4, background: "#fff" }}>
                <div className="px-5 py-3.5" style={{ borderBottom: `1px solid ${RULE}` }}>
                  <h3 className="flex items-center gap-2 font-semibold tracking-tight text-[15px]" style={{ color: INK }}>
                    <CalendarClock size={15} style={{ color: BRASS }} />
                    Path to application
                  </h3>
                </div>
                <div className="px-5 py-4">
                  {[
                    {
                      when: "November",
                      title: "OUAC submission & profile setup",
                      body: "Declare non-day-school course codes accurately to avoid processing delays.",
                    },
                    {
                      when: "February",
                      title: "Admissions submission",
                      body: "Lead with independent projects and leadership that quantify your impact.",
                    },
                    {
                      when: "April",
                      title: "Euclid contest date",
                      body: "A score above 75 places you in the upper quartile of applicants.",
                    },
                  ].map((step, i, arr) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-[7px] h-[7px] rounded-full mt-1.5"
                          style={{ background: BRASS }}
                        />
                        {i < arr.length - 1 && (
                          <div className="w-px flex-1" style={{ background: RULE }} />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-[10.5px]" style={{ color: MUTED }}>{step.when}</p>
                        <p className="text-[13px] font-medium" style={{ color: INK }}>{step.title}</p>
                        <p className="text-[11.5px] mt-0.5" style={{ color: MUTED }}>{step.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-3.5 flex items-center justify-between no-print"
          style={{ borderTop: `1px solid ${RULE}`, background: "#fff" }}
        >
          <span className="text-[11px]" style={{ color: MUTED }}>
            Estimates only — actual admissions decisions depend on factors outside this model.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-[12px] font-medium cursor-pointer"
            style={{ background: INK, color: PAPER, borderRadius: 4 }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}