"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  id: number;
  myth: string;
  truth: string;
  schools: string[];
}

const MYTHS_DATA: FAQItem[] = [
  {
    id: 1,
    myth: "A 95%+ average guarantees admission to top Canadian STEM programs.",
    truth:
      "A high average is just the baseline. Competitive programs like U of T CS, McMaster Health Sci, Waterloo SE, and UBC Science place massive weight on supplemental applications, video interviews, and STEM contest performance (Euclid/CCC). Thousands of 95%+ applicants are turned away yearly without strong supplemental context.",
    schools: ["U of T", "Waterloo", "McMaster", "UBC"],
  },
  {
    id: 2,
    myth: "Taking summer school or online courses (like OVS) won't impact my chances.",
    truth:
      "Policies vary significantly across Canada. While many general programs treat all accredited Ontario credits equally, top engineering and computer science faculties explicitly penalize non-day-school courses or require detailed justification on supplemental forms.",
    schools: ["Waterloo", "U of T Eng", "McGill"],
  },
  {
    id: 3,
    myth: "Out-of-province applicants face unfair disadvantages compared to Ontario students.",
    truth:
      "Canadian universities use clear grade-conversion matrices across provinces (e.g., normalizing Alberta Diploma scores or BC percentage benchmarks). Universities allocate distinct seat pools for in-province, out-of-province, and international applicants.",
    schools: ["OUAC 101/105", "UBC", "McGill", "UCalgary"],
  },
  {
    id: 4,
    myth: "High elective grades can make up for a lower score in required prerequisites.",
    truth:
      "Prerequisite satisfaction is non-negotiable. Admissions algorithms evaluate your required prerequisite subset (e.g., Calculus, Advanced Functions, English, Physics/Chemistry) separately. Falling below program-specific prerequisite thresholds will result in rejection, even with a 98% elective average.",
    schools: ["All Canadian Universities"],
  },
];

export default function AdmissionMythsSection() {
  const [openId, setOpenId] = useState<number | null>(1);

  const toggleAccordion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="bg-transparent text-slate-900 py-20 px-6 w-full border-t border-slate-200/70">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-emerald-600 uppercase bg-emerald-50 border border-emerald-200 rounded-full mb-3">
            Canadian Admissions Real Talk
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Common Admission &nbsp;
            <span className="text-[#10B981]">Myths vs. Reality</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
            Analyzing how Canadian universities actually evaluate your Top 6
            average, prerequisites, and non-day school credits.
          </p>
        </div>
        <div className="space-y-4">
          {MYTHS_DATA.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white/70 backdrop-blur-xl border border-slate-200/70 rounded-xl overflow-hidden transition-colors duration-200 shadow-sm shadow-slate-200/50"
              >
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      MYTH #{item.id}
                    </span>
                    <h3 className="font-semibold text-sm md:text-base text-slate-800">
                      {item.myth}
                    </h3>
                  </div>
                  <span className="text-emerald-500 text-xl shrink-0 font-mono">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="p-5 pt-0 border-t border-slate-200/70 text-xs md:text-sm text-slate-600 leading-relaxed space-y-3">
                        <p className="pt-3">{item.truth}</p>
                        <div className="flex items-center gap-2 pt-2">
                          <span className="text-[11px] font-semibold text-slate-500">
                            Applies to:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {item.schools.map((school, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-100 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200"
                              >
                                {school}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
