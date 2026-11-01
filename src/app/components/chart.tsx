"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

interface Feature {
  title: string;
  official: string | false;
  probable: string;
}

const FEATURES: Feature[] = [
  {
    title: "Admission cutoff",
    official: "One static figure",
    probable: "Real accepted range by year",
  },
  {
    title: "Supplemental weighting",
    official: false,
    probable: "Modeled from real outcomes",
  },
  {
    title: "Program specific tiering",
    official: false,
    probable: "Safety, Match, and Reach for you",
  },
  {
    title: "Prerequisite-level detail",
    official: false,
    probable: "Flags a weak course, not just your average",
  },
  {
    title: "Out of province conversion",
    official: false,
    probable: "Shows how your grades translate",
  },
];

export default function ComparisonChart() {
  return (
    <section
      className="bg-slate-200 py-5 px-6 w-full"
      style={{ fontFamily: `var(${plusJakarta.variable})` }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-[#10B981] text-xs font-bold tracking-[0.2em] uppercase mb-3">
            Compare
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            See the difference
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-slate-200">
              <span className="text-sm font-bold text-slate-500">
                Official website
              </span>
            </div>
            <div className="p-6 flex flex-col gap-6">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                    {f.official ? (
                      <Check size={12} strokeWidth={3} className="text-slate-500" />
                    ) : (
                      <X size={12} strokeWidth={3} className="text-slate-400" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {f.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {f.official || "Not provided"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border-2 border-[#10B981] bg-white overflow-hidden shadow-lg shadow-emerald-500/10"
          >
            <div className="px-6 py-5 border-b border-slate-100 bg-emerald-50/60">
              <span className="text-sm font-extrabold text-slate-900">
                Probable<span className="text-[#10B981]">.ai</span>
              </span>
            </div>
            <div className="p-6 flex flex-col gap-6">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check size={12} strokeWidth={3} className="text-[#10B981]" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {f.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {f.probable}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-8 max-w-lg mx-auto leading-relaxed">
          Estimates are generated from historical trends and public dataset
          benchmarks, not official university data.
        </p>
      </div>
    </section>
  );
}