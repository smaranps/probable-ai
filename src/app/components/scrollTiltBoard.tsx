"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ScrollTiltDashboard() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "start 25%"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [28, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [48, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div
      ref={containerRef}
      className="relative mt-8 w-full"
      style={{ perspective: "1400px" }}
    >
      <motion.div
        style={{
          rotateX,
          scale,
          y,
          opacity,
          transformStyle: "preserve-3d",
          transformOrigin: "50% 0%",
        }}
        className="relative mx-auto max-w-4xl"
      >
        <div className="rounded-xl border border-[var(--border)] bg-[var(--paper)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--mist)]/60">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-[var(--accent)]" />
              <div className="space-y-1.5">
                <div className="h-2.5 w-32 rounded bg-[var(--border)]" />
                <div className="h-2 w-20 rounded bg-[var(--border)]/80" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-[var(--border)]" />
              <div className="h-7 w-7 rounded-md bg-[var(--border)]" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
            {[
              {
                label: "Safety",
                pct: "92%",
                bar: "bg-[var(--accent)]",
                schools: [
                  { name: "University of Ottawa", program: "Computer Science" },
                  { name: "York University", program: "Software Eng." },
                  { name: "Carleton University", program: "Computer Science" },
                ],
              },
              {
                label: "Match",
                pct: "61%",
                bar: "bg-amber-600",
                schools: [
                  { name: "University of Waterloo", program: "Software Eng." },
                  { name: "McMaster University", program: "Computer Science" },
                  { name: "Queen's University", program: "Computer Science" },
                ],
              },
              {
                label: "Reach",
                pct: "23%",
                bar: "bg-rose-600",
                schools: [
                  {
                    name: "University of Toronto",
                    program: "Computer Science",
                  },
                  { name: "Waterloo", program: "CS - AI Specialist" },
                  { name: "UBC", program: "Computer Science" },
                ],
              },
            ].map((col) => (
              <div
                key={col.label}
                className="rounded-lg border border-[var(--border)] bg-[var(--mist)]/40 p-4 flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[var(--ink-soft)] tracking-wide uppercase">
                    {col.label}
                  </span>
                  <span className="font-heading text-xs font-semibold text-[var(--ink)]">
                    {col.pct}
                  </span>
                </div>

                <div className={`h-1 w-full rounded-full ${col.bar} mb-4 opacity-80`} />

                <div className="space-y-2.5">
                  {col.schools.map((s) => (
                    <div
                      key={s.name}
                      className="rounded-md border border-[var(--border)] bg-[var(--paper)] px-3 py-2.5"
                    >
                      <p className="text-xs font-medium text-[var(--ink)] leading-tight">
                        {s.name}
                      </p>
                      <p className="text-[11px] text-[var(--ink-soft)] mt-0.5">
                        {s.program}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
