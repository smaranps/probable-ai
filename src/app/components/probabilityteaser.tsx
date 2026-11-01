"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const PROGRAMS = [
  { name: "University of Toronto — Computer Science", cutoff: 95, curve: 2.2 },
  { name: "Waterloo — Software Engineering", cutoff: 96, curve: 2.6 },
  { name: "McMaster — Health Sciences", cutoff: 93, curve: 2.0 },
  { name: "Queen's — Commerce", cutoff: 92, curve: 1.7 },
  { name: "Western — Ivey AEO", cutoff: 88, curve: 1.4 },
];

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}

function estimateProbability(
  average: number,
  program: (typeof PROGRAMS)[number]
) {
  const diff = average - program.cutoff;
  const p = sigmoid(diff / program.curve);
  return Math.round(p * 100);
}

function tierFor(pct: number): { label: string; color: string } {
  if (pct >= 75) return { label: "Safety", color: "#1B6B5A" };
  if (pct >= 35) return { label: "Match", color: "#B45309" };
  return { label: "Reach", color: "#BE123C" };
}

export default function ProbabilityTeaser() {
  const router = useRouter();
  const [average, setAverage] = useState(90);
  const [programIndex, setProgramIndex] = useState(0);
  const program = PROGRAMS[programIndex];
  const pct = useMemo(
    () => estimateProbability(average, program),
    [average, program]
  );
  const tier = tierFor(pct);

  return (
    <section className="bg-[var(--mist)] py-24 px-6 border-t border-[var(--border)]">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <p className="font-heading text-[var(--accent)] text-xs font-semibold tracking-[0.18em] uppercase mb-3">
            Quick demo
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-[var(--ink)] tracking-tight leading-tight mb-3">
            See your tier in seconds
          </h2>
          <p className="text-[var(--ink-soft)] text-[15px] leading-relaxed">
            A simplified preview. Sign up for the full model based on real
            applicant outcomes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="border border-[var(--border)] bg-[var(--paper)] rounded-xl p-6 sm:p-8"
        >
          <div className="mb-6">
            <label className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wide mb-2 block">
              Target program
            </label>
            <select
              value={programIndex}
              onChange={(e) => setProgramIndex(Number(e.target.value))}
              className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--ink)] bg-[var(--mist)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
            >
              {PROGRAMS.map((p, i) => (
                <option key={p.name} value={i}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[var(--ink-soft)] uppercase tracking-wide">
                Your Top 6 average
              </label>
              <span className="font-heading text-sm font-semibold text-[var(--ink)]">
                {average}%
              </span>
            </div>
            <input
              type="range"
              min={75}
              max={100}
              step={1}
              value={average}
              onChange={(e) => setAverage(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>

          <div className="flex items-center justify-between bg-[var(--mist)] rounded-lg p-5 border border-[var(--border)]">
            <div>
              <p className="text-xs text-[var(--ink-soft)] mb-1">Estimated tier</p>
              <p
                className="font-heading text-lg font-semibold"
                style={{ color: tier.color }}
              >
                {tier.label}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--ink-soft)] mb-1">
                Rough probability
              </p>
              <p className="font-heading text-3xl font-semibold text-[var(--ink)]">
                {pct}%
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/login?mode=signup")}
            className="w-full mt-6 px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm rounded-lg transition cursor-pointer"
          >
            Get my full breakdown
          </button>
        </motion.div>
      </div>
    </section>
  );
}
