"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Plus, Minus } from "lucide-react";

type Category = "Grades" | "Extracurriculars" | "Timeline" | "Provincial";

interface FAQItem {
  id: number;
  myth: string;
  truth: string;
  schools: string[];
  category: Category;
}

const CATEGORIES: Category[] = [
  "Grades",
  "Extracurriculars",
  "Timeline",
  "Provincial",
];

const MYTHS_DATA: FAQItem[] = [
  {
    id: 1,
    myth: "A 95%+ average guarantees admission to top Canadian STEM programs.",
    truth:
      "A high average is just the baseline. Competitive programs like U of T CS, McMaster Health Sci, Waterloo SE, and UBC Science place massive weight on supplemental applications, video interviews, and STEM contest performance (Euclid/CCC). Thousands of 95%+ applicants are turned away yearly without strong supplemental context.",
    schools: ["U of T", "Waterloo", "McMaster", "UBC"],
    category: "Grades",
  },
  {
    id: 2,
    myth: "Taking summer school or online courses (like OVS) won't impact my chances.",
    truth:
      "Policies vary significantly across Canada. While many general programs treat all accredited Ontario credits equally, top engineering and computer science faculties explicitly penalize non-day-school courses or require detailed justification on supplemental forms.",
    schools: ["Waterloo", "U of T Eng", "McGill"],
    category: "Timeline",
  },
  {
    id: 3,
    myth: "Out of province applicants face unfair disadvantages compared to Ontario students.",
    truth:
      "Canadian universities use clear grade conversion matrices across provinces (e.g., normalizing Alberta Diploma scores or BC percentage benchmarks). Universities allocate distinct seat pools for in-province, out-of-province, and international applicants.",
    schools: ["OUAC 101/105", "UBC", "McGill", "UCalgary"],
    category: "Provincial",
  },
  {
    id: 4,
    myth: "High elective grades can make up for a lower score in required prerequisites.",
    truth:
      "Prerequisite satisfaction is non negotiable. Admissions algorithms evaluate your required prerequisite subset (e.g., Calculus, Advanced Functions, English, Physics/Chemistry) separately. Falling below program-specific prerequisite thresholds will result in rejection, even with a 98% elective average.",
    schools: ["All Canadian Universities"],
    category: "Grades",
  },
  {
    id: 5,
    myth: "Extracurriculars barely matter if your average is high enough.",
    truth:
      "For non-competitive programs this is close to true, but for Health Sci, Ivey AEO, and most scholarship streams, extracurriculars and the supplemental essay carry as much weight as your average once you clear the prerequisite bar. Two applicants with identical averages can land in different tiers based on this alone.",
    schools: ["McMaster", "Western Ivey", "Queen's"],
    category: "Extracurriculars",
  },
  {
    id: 6,
    myth: "You should wait until your final grades are in before applying.",
    truth:
      "Most Canadian universities admit on a rolling basis using your Grade 11 and early Grade 12 marks, then confirm with your final grades in the summer. Applying early with your best available average typically improves your odds versus waiting for a marginally higher final mark.",
    schools: ["OUAC 101", "Waterloo", "Queen's"],
    category: "Timeline",
  },
];

export default function AdmissionMythsSection() {
  const [openId, setOpenId] = useState<number | null>(1);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "All">(
    "All"
  );

  const toggleAccordion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MYTHS_DATA.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        item.myth.toLowerCase().includes(q) ||
        item.truth.toLowerCase().includes(q) ||
        item.schools.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [query, activeCategory]);

  return (
    <section
      id="faq"
      className="bg-[var(--paper)] text-[var(--ink)] py-24 px-6 w-full border-t border-[var(--border)]"
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <p className="font-heading text-[var(--accent)] text-xs font-semibold tracking-[0.18em] uppercase mb-3">
            Myths vs reality
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight text-[var(--ink)] leading-tight">
            What Canadian admissions actually weigh
          </h2>
          <p className="text-[var(--ink-soft)] text-[15px] mt-3 max-w-lg leading-relaxed">
            Clear answers on Top 6 averages, prerequisites, and non-day school
            credits — without the noise.
          </p>
        </motion.div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a myth, school, or topic..."
              className="w-full pl-10 pr-9 py-3 text-sm bg-[var(--mist)] border border-[var(--border)] rounded-lg text-[var(--ink)] placeholder:text-[var(--ink-soft)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] hover:text-[var(--ink)]"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCategory("All")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-md border transition cursor-pointer ${
                activeCategory === "All"
                  ? "bg-[var(--ink)] text-white border-[var(--ink)]"
                  : "bg-transparent text-[var(--ink-soft)] border-[var(--border)] hover:border-[var(--ink)]/30"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md border transition cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "bg-transparent text-[var(--ink-soft)] border-[var(--border)] hover:border-[var(--accent)]/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-[var(--ink-soft)]">
              No myths match your search. Try a different term or category.
            </div>
          ) : (
            filtered.map((item, index) => {
              const isOpen = openId === item.id;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <button
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full py-5 text-left flex items-start justify-between gap-4 cursor-pointer group"
                  >
                    <div className="space-y-2 min-w-0">
                      <span className="inline-block text-[11px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                        {item.category}
                      </span>
                      <h3 className="font-heading font-semibold text-[15px] md:text-base text-[var(--ink)] leading-snug group-hover:text-[var(--accent)] transition-colors">
                        {item.myth}
                      </h3>
                    </div>
                    <span className="mt-1 shrink-0 text-[var(--ink-soft)]">
                      {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-5 text-[15px] text-[var(--ink-soft)] leading-relaxed space-y-3">
                          <p>{item.truth}</p>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink)]/50">
                              Applies to
                            </span>
                            {item.schools.map((school, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] text-[var(--ink-soft)] border border-[var(--border)] px-2 py-0.5 rounded-md"
                              >
                                {school}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
