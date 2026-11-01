"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    num: "01",
    title: "Enter your profile",
    desc: "Top 6 average, prerequisite grades, and extracurriculars. Takes about two minutes.",
  },
  {
    num: "02",
    title: "Add target programs",
    desc: "Pick any Canadian program: U of T CS, Waterloo Engineering, McMaster Health Science, and more.",
  },
  {
    num: "03",
    title: "Get your tiers",
    desc: "Every program sorted into Safety, Match, or Reach based on real historical outcomes.",
  },
  {
    num: "04",
    title: "Strengthen your case",
    desc: "See what separates accepted from rejected applicants at your target average.",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 40%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="bg-[var(--mist)] py-24 px-6 border-t border-[var(--border)]"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 max-w-xl"
        >
          <p className="font-heading text-[var(--accent)] text-xs font-semibold tracking-[0.18em] uppercase mb-3">
            How it works
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-[var(--ink)] tracking-tight leading-tight">
            Four steps to a clearer application list
          </h2>
        </motion.div>

        <div className="relative">
          <div className="hidden md:block absolute left-[1.15rem] top-3 bottom-3 w-px bg-[var(--border)]" />
          <motion.div
            style={{ scaleY: lineScale }}
            className="hidden md:block absolute left-[1.15rem] top-3 bottom-3 w-px origin-top bg-[var(--accent)]"
          />

          <ol className="space-y-10 md:space-y-12">
            {steps.map((step, i) => (
              <motion.li
                key={step.num}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative grid grid-cols-[2.5rem_1fr] md:grid-cols-[2.5rem_1fr] gap-5 md:gap-8 items-start"
              >
                <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--paper)] border border-[var(--border)] font-heading text-xs font-semibold text-[var(--accent)]">
                  {step.num}
                </div>
                <div className="pt-1">
                  <h3 className="font-heading text-lg sm:text-xl font-semibold text-[var(--ink)] mb-2 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-[var(--ink-soft)] text-[15px] leading-relaxed max-w-xl">
                    {step.desc}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
