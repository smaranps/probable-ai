"use client";

import React, { useState } from "react";
import { DollarSign, Award, Calculator, TrendingUp, CheckCircle, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  { university: "Western University", minAverage: 95, amountPerYear: 20000, durationYears: 4, notes: "President's Entrance ($5k/yr)" },
  { university: "Western University", minAverage: 92, amountPerYear: 10000, durationYears: 4, notes: "Western Admission ($2.5k/yr)" },
  { university: "Western University", minAverage: 90, amountPerYear: 2500, durationYears: 1, notes: "Western Admission Award" },
];
export default function ScholarshipCalculatorPage() {
  const [average, setAverage] = useState<number>(92);
  const [estTuition, setEstTuition] = useState<number>(9000);
  const [familyAid, setFamilyAid] = useState<number>(3000);
  const matchedScholarships = SCHOLARSHIP_DATABASE.filter(
    (item) => average >= item.minAverage
  );
  const bestBySchool = matchedScholarships.reduce((acc, curr) => {
    if (!acc[curr.university] || curr.amountPerYear * curr.durationYears > acc[curr.university].amountPerYear * acc[curr.university].durationYears) {
      acc[curr.university] = curr;
    }
    return acc;
  }, {} as Record<string, UniversityTier>);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-5xl mx-auto space-y-8 mt-[80px]"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Entrance Scholarship Estimator
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Calculate automatic merit based entrance awards based on your Top 6 academic average.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" /> Academic Inputs
            </h2>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Estimated Top 6 Average: <span className="font-mono text-emerald-600 text-sm">{average}%</span>
              </label>
              <input
                type="range"
                min="80"
                max="100"
                step="0.5"
                value={average}
                onChange={(e) => setAverage(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Estimated Annual Tuition ($)</label>
              <input
                type="number"
                value={estTuition}
                onChange={(e) => setEstTuition(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">OSAP / Personal Aid Estimate ($)</label>
              <input
                type="number"
                value={familyAid}
                onChange={(e) => setFamilyAid(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Eligible Automatic Tier Awards ({Object.keys(bestBySchool).length})
          </h2>
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {Object.values(bestBySchool).map((award, idx) => {
                const totalAwardValue = award.amountPerYear * (award.durationYears > 1 ? award.durationYears : 1);
                const year1NetTuition = Math.max(0, estTuition - award.amountPerYear - familyAid);
                return (
                  <motion.div
                    key={award.university}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{award.university}</h3>
                        <p className="text-xs text-gray-500">{award.notes}</p>
                      </div>
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-200">
                        Requires {award.minAverage}%+
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex items-baseline justify-between">
                      <span className="text-xs text-gray-500">Scholarship Total:</span>
                      <span className="text-lg font-bold font-mono text-emerald-600">
                        ${totalAwardValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2.5 bg-gray-50 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between text-gray-600">
                        <span>Yr 1 Award:</span>
                        <span className="font-mono font-medium">${award.amountPerYear.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-900 font-semibold pt-1 border-t border-gray-200">
                        <span>Est. Year 1 Out-of-Pocket:</span>
                        <span className="font-mono text-slate-800">${year1NetTuition.toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}