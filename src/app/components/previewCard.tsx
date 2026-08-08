"use client";

import React from "react";
import { motion } from "framer-motion";

export default function HeroPreviewCards() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="hidden xl:flex absolute left-8 lg:left-16 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-[#111827]/80 backdrop-blur-xl border border-emerald-500/20 shadow-2xl shadow-emerald-950/40 flex-col gap-2 max-w-[220px] pointer-events-none select-none z-10"
      >
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
            Live Analysis
          </span>
        </div>
        <p className="text-sm font-bold text-white">
          Choose your target program
        </p>
        <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-slate-800">
          <span>Get Calculated Insights and a clear roadmap to success.</span>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="hidden xl:flex absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-[#111827]/80 backdrop-blur-xl border border-emerald-500/20 shadow-2xl shadow-emerald-950/40 flex-col gap-2 max-w-[210px] pointer-events-none select-none z-10"
      >
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold tracking-wider uppercase">
          <span>How it Works</span>
        </div>
        <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-lg p-2">
          <p className="text-xs font-bold text-emerald-400">
            Real Application Data Powered by CUDO/OUAC
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
            Real Application Data is used along with AI to provide accurate
            predictions and insights.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
