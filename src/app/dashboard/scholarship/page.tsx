"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Google_Sans_Flex } from "next/font/google";
import { Calculator, Minus, Plus, Check, Lock, TrendingUp, Award, RotateCcw } from "lucide-react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";

const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface UniversityTier {
  university: string;
  minAverage: number;
  amountPerYear: number;
  durationYears: number;
  notes: string;
}

const SCHOLARSHIP_DATABASE: UniversityTier[] = [
  { university: "University of Waterloo", minAverage: 95, amountPerYear: 5000, durationYears: 1, notes: "President's Scholarship of Distinction" },
  { university: "University of Waterloo", minAverage: 90, amountPerYear: 2000, durationYears: 1, notes: "President's Scholarship" },
  { university: "University of Waterloo", minAverage: 85, amountPerYear: 1000, durationYears: 1, notes: "Merit Scholarship" },
  { university: "University of Toronto", minAverage: 95, amountPerYear: 7500, durationYears: 1, notes: "U of T Scholar (Top Applicants)" },
  { university: "University of Toronto", minAverage: 92, amountPerYear: 3000, durationYears: 1, notes: "Faculty Entrance Award" },
  { university: "McMaster University", minAverage: 95, amountPerYear: 3000, durationYears: 1, notes: "Award of Excellence" },
  { university: "McMaster University", minAverage: 90, amountPerYear: 1200, durationYears: 1, notes: "Entrance Award" },
  // Fixed: amountPerYear is now the per-year figure, so totals = amount × years
  { university: "Western University", minAverage: 95, amountPerYear: 5000, durationYears: 4, notes: "President's Entrance Scholarship" },
  { university: "Western University", minAverage: 92, amountPerYear: 2500, durationYears: 4, notes: "Western Admission Scholarship" },
  { university: "Western University", minAverage: 90, amountPerYear: 2500, durationYears: 1, notes: "Western Admission Award" },
];

const UNIVERSITIES = Array.from(new Set(SCHOLARSHIP_DATABASE.map((s) => s.university)));
const QUICK_AVERAGES = [85, 90, 92, 95];
const money = (n: number) => `$${n.toLocaleString()}`;
const total = (t: UniversityTier) => t.amountPerYear * t.durationYears;
const clamp = (n: number) => Math.min(100, Math.max(0, n));

// Maps free-text university names (from onboarding) to names in the database.
const SCHOOL_ALIASES: Record<string, string[]> = {
  "University of Waterloo": ["waterloo", "uwaterloo", "uw"],
  "University of Toronto": ["toronto", "utoronto", "uoft", "u of t", "utsg", "utm", "utsc"],
  "McMaster University": ["mcmaster", "mac"],
  "Western University": ["western", "uwo", "western u", "western ontario", "uwestern"],
};

const matchSchool = (input: string): string | null => {
  const norm = ` ${input.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
  for (const [name, aliases] of Object.entries(SCHOOL_ALIASES)) {
    if (aliases.some((a) => norm.includes(` ${a} `))) return name;
  }
  return null;
};

// Reads ?average=92.5 from the URL so the dashboard can link straight here.
export default function ScholarshipCalculatorPage() {
  return (
    <Suspense fallback={null}>
      <ScholarshipCalculator />
    </Suspense>
  );
}

function ScholarshipCalculator() {
  const params = useSearchParams();
  const profileAverage = parseFloat(params.get("average") ?? "");
  const hasProfileAverage = !isNaN(profileAverage) && profileAverage > 0 && profileAverage <= 100;
  const [rawAverage, setRawAverage] = useState(hasProfileAverage ? String(profileAverage) : "");
  const [estTuition, setEstTuition] = useState("9000");
  const [familyAid, setFamilyAid] = useState("3000");
  // ?schools=Waterloo,UofT pre-selects the student's targets; falls back to all schools.
  const targetSchools = useMemo(() => {
    const raw = params.get("schools") ?? "";
    const matched = raw
      .split(",")
      .map(matchSchool)
      .filter((n): n is string => n !== null);
    return Array.from(new Set(matched));
  }, [params]);
  const [selected, setSelected] = useState<string[]>(
    targetSchools.length > 0 ? targetSchools : UNIVERSITIES
  );
  const parsed = parseFloat(rawAverage);
  const validAverage = !isNaN(parsed) && parsed >= 0 && parsed <= 100;
  const average = validAverage ? parsed : 0;
  const tuition = Number(estTuition) || 0;
  const aid = Number(familyAid) || 0;

  const step = (delta: number) => {
    const base = validAverage ? parsed : 90;
    setRawAverage(String(Math.round(clamp(base + delta) * 2) / 2));
  };

  const toggleSchool = (name: string) =>
    setSelected((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));

  const results = useMemo(() => {
    return UNIVERSITIES.filter((u) => selected.includes(u))
      .map((university) => {
        const tiers = SCHOLARSHIP_DATABASE.filter((s) => s.university === university).sort(
          (a, b) => b.minAverage - a.minAverage
        );
        const earned = validAverage ? tiers.filter((t) => average >= t.minAverage) : [];
        const best = earned.reduce<UniversityTier | null>(
          (acc, t) => (!acc || total(t) > total(acc) ? t : acc),
          null
        );
        const next = tiers.filter((t) => average < t.minAverage).sort((a, b) => a.minAverage - b.minAverage)[0];
        const outOfPocket = Math.max(0, tuition - (best?.amountPerYear ?? 0) - aid);
        return { university, tiers, best, next, outOfPocket };
      })
      .sort((a, b) => (b.best ? total(b.best) : 0) - (a.best ? total(a.best) : 0));
  }, [selected, average, validAverage, tuition, aid]);

  const topResult = results.find((r) => r.best);
  const eligibleCount = results.filter((r) => r.best).length;

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="max-w-5xl mx-auto mt-[80px] px-4 pb-16 space-y-8 text-gray-900"
        style={{ fontFamily: googleSansFlex.style.fontFamily }}
      >
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Entrance scholarship estimator</h1>
          <p className="text-gray-500 text-sm max-w-xl">
            Enter your Top 6 average to see which automatic entrance awards you qualify for, and what's left to pay in
            first year.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 lg:sticky lg:top-24">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" /> Your numbers
            </h2>

            <div>
              <label htmlFor="avg" className="block text-xs font-semibold text-gray-600 mb-2">
                Top 6 average
              </label>
              <div className="flex items-stretch gap-2">
                <button
                  type="button"
                  aria-label="Decrease average by 0.5"
                  onClick={() => step(-0.5)}
                  className="w-11 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="relative flex-1">
                  <input
                    id="avg"
                    type="text"
                    inputMode="decimal"
                    value={rawAverage}
                    onChange={(e) => setRawAverage(e.target.value.replace(/[^0-9.]/g, ""))}
                    aria-invalid={!validAverage}
                    className={`w-full py-3 pl-3 pr-8 text-center text-3xl font-bold tabular-nums bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 ${
                      validAverage
                        ? "border-gray-200 text-emerald-600 focus:ring-emerald-500"
                        : "border-red-300 text-red-600 focus:ring-red-400"
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">%</span>
                </div>
                <button
                  type="button"
                  aria-label="Increase average by 0.5"
                  onClick={() => step(0.5)}
                  className="w-11 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {hasProfileAverage && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                  <span>Pre-filled from your dashboard ({profileAverage}%).</span>
                  {rawAverage !== String(profileAverage) && (
                    <button
                      type="button"
                      onClick={() => setRawAverage(String(profileAverage))}
                      className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  )}
                </p>
              )}
              {!validAverage && rawAverage !== "" && (
                <p role="alert" className="text-xs text-red-600 mt-2">
                  Enter an average between 0 and 100.
                </p>
              )}
              <div className="flex gap-2 mt-3">
                {QUICK_AVERAGES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setRawAverage(String(v))}
                    aria-pressed={validAverage && average === v}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      validAverage && average === v
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {v}%
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "tuition", label: "Annual tuition", value: estTuition, set: setEstTuition },
                { id: "aid", label: "OSAP / personal aid", value: familyAid, set: setFamilyAid },
              ].map((f) => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-xs font-semibold text-gray-600 mb-1">
                    {f.label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      id={f.id}
                      type="text"
                      inputMode="numeric"
                      value={f.value}
                      onChange={(e) => f.set(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full pl-6 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm tabular-nums text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Universities to compare</p>
              {targetSchools.length > 0 && selected.length !== UNIVERSITIES.length && (
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                  <span>Showing your target schools.</span>
                  <button
                    type="button"
                    onClick={() => setSelected(UNIVERSITIES)}
                    className="font-semibold text-emerald-700 hover:text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
                  >
                    Show all
                  </button>
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {UNIVERSITIES.map((u) => {
                  const on = selected.includes(u);
                  return (
                    <button
                      key={u}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleSchool(u)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        on
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {u.replace("University of ", "").replace(" University", "")}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
          <section className="space-y-4" aria-live="polite">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                {topResult?.best ? (
                  <>
                    <p className="text-sm text-emerald-900 font-semibold">
                      Highest award: {money(total(topResult.best))} at {topResult.university}
                    </p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      You qualify at {eligibleCount} of {results.length} selected{" "}
                      {results.length === 1 ? "school" : "schools"}.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-emerald-900 font-semibold">
                    {selected.length === 0
                      ? "Select at least one university to compare."
                      : validAverage
                      ? "No automatic awards at this average yet. See how close you are below."
                      : "Enter a valid average to see your awards."}
                  </p>
                )}
              </div>
            </div>

            <AnimatePresence initial={false}>
              {results.map(({ university, tiers, best, next, outOfPocket }) => (
                <motion.article
                  key={university}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  <div className="p-5 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{university}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {best ? best.notes : "Not yet eligible"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold tabular-nums text-emerald-600">
                        {best ? money(total(best)) : "$0"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {best && best.durationYears > 1
                          ? `${money(best.amountPerYear)} × ${best.durationYears} years`
                          : "one-time total"}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-500">Year 1 award</p>
                      <p className="font-semibold tabular-nums text-gray-900 text-sm mt-0.5">
                        {money(best?.amountPerYear ?? 0)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-500">Year 1 out-of-pocket</p>
                      <p className="font-semibold tabular-nums text-slate-800 text-sm mt-0.5">{money(outOfPocket)}</p>
                    </div>
                  </div>

                  {next && validAverage && (
                    <div className="mx-5 mb-5 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                      <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {(next.minAverage - average).toFixed(1).replace(/\.0$/, "")}% more unlocks {next.notes} (
                        {money(total(next))}).
                      </span>
                    </div>
                  )}

                  <ul className="border-t border-gray-100 divide-y divide-gray-100">
                    {tiers.map((t) => {
                      const unlocked = validAverage && average >= t.minAverage;
                      const isBest = best === t;
                      return (
                        <li
                          key={t.notes}
                          className={`px-5 py-2.5 flex items-center gap-3 text-xs ${
                            unlocked ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                              unlocked ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {unlocked ? <Check className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          </span>
                          <span className="flex-1 min-w-0 truncate">
                            {t.notes}
                            {isBest && (
                              <span className="ml-2 px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
                                Your award
                              </span>
                            )}
                          </span>
                          <span className="tabular-nums">{t.minAverage}%+</span>
                          <span className="tabular-nums font-semibold w-24 text-right">
                            {money(t.amountPerYear)}
                            {t.durationYears > 1 ? ` × ${t.durationYears}` : ""}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </motion.article>
              ))}
            </AnimatePresence>

            <p className="text-xs text-gray-400">
              Award amounts are estimates from your data set. Check each school's current award page before relying
              on them.
            </p>
          </section>
        </div>
      </div>
    </MotionConfig>
  );
}